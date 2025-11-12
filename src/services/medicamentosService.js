/**
 * Servicio para gestionar medicamentos en Firestore
 * Maneja todas las operaciones CRUD de medicamentos
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Obtiene todos los medicamentos de un usuario
 */
export const obtenerMedicamentos = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentosRef = collection(db, 'medicamentos');
    const q = query(
      medicamentosRef,
      where('userId', '==', userId),
      orderBy('primeraToma', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const medicamentos = [];

    querySnapshot.forEach((doc) => {
      medicamentos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      medicamentos
    };
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    return {
      success: false,
      error: error.message,
      medicamentos: []
    };
  }
};

/**
 * Obtiene un medicamento por ID
 */
export const obtenerMedicamento = async (medicamentoId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentoDoc = await getDoc(doc(db, 'medicamentos', medicamentoId));
    
    if (medicamentoDoc.exists()) {
      return {
        success: true,
        medicamento: {
          id: medicamentoDoc.id,
          ...medicamentoDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Agrega un nuevo medicamento
 */
export const agregarMedicamento = async (userId, medicamentoData) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentoCompleto = {
      ...medicamentoData,
      userId,
      stockActual: medicamentoData.stockInicial || medicamentoData.stockActual,
      tomasRealizadas: medicamentoData.tomasRealizadas || [],
      activo: medicamentoData.activo !== undefined ? medicamentoData.activo : true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      eventoIdsGoogleCalendar: [] // IDs de eventos en Google Calendar
    };

    const docRef = await addDoc(collection(db, 'medicamentos'), medicamentoCompleto);

    // Intentar crear eventos en Google Calendar si está conectado
    try {
      const { obtenerTokenGoogle } = await import('./calendarService');
      const { crearEventosRecurrentes } = await import('./calendarService');
      const tokenData = await obtenerTokenGoogle(userId);
      
      console.log('Token data obtenido:', tokenData ? 'Sí' : 'No');
      
      if (tokenData && tokenData.access_token) {
        console.log('Creando eventos en Google Calendar...');
        const resultado = await crearEventosRecurrentes(
          tokenData.access_token,
          medicamentoCompleto
        );
        
        console.log('Resultado de crear eventos:', resultado);
        
        if (resultado.success && resultado.eventoIds) {
          // Actualizar el medicamento con los IDs de eventos
          await updateDoc(docRef, {
            eventoIdsGoogleCalendar: resultado.eventoIds
          });
          console.log('Eventos creados y guardados:', resultado.eventoIds.length);
        } else {
          console.warn('No se pudieron crear eventos:', resultado.error);
        }
      } else {
        console.log('No hay access_token disponible. Token data:', tokenData);
      }
    } catch (calendarError) {
      // Si falla la sincronización con Google Calendar, no es crítico
      console.warn('Error al sincronizar con Google Calendar:', calendarError);
    }

    return {
      success: true,
      medicamento: {
        id: docRef.id,
        ...medicamentoCompleto
      }
    };
  } catch (error) {
    console.error('Error al agregar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualiza un medicamento existente
 */
export const actualizarMedicamento = async (medicamentoId, datosActualizados) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (!medicamentoSnap.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamentoActual = medicamentoSnap.data();
    
    // Si cambió el horario o las tomas, actualizar eventos de Google Calendar
    const horarioCambio = datosActualizados.primeraToma !== medicamentoActual.primeraToma ||
                         datosActualizados.tomasDiarias !== medicamentoActual.tomasDiarias;
    
    if (horarioCambio && medicamentoActual.eventoIdsGoogleCalendar && medicamentoActual.eventoIdsGoogleCalendar.length > 0) {
      try {
        const { obtenerTokenGoogle, actualizarEventoToma, eliminarEventoToma } = await import('./calendarService');
        const tokenData = await obtenerTokenGoogle(medicamentoActual.userId);
        
        if (tokenData && tokenData.access_token) {
          // Eliminar eventos antiguos
          for (const eventoId of medicamentoActual.eventoIdsGoogleCalendar) {
            await eliminarEventoToma(tokenData.access_token, eventoId);
          }
          
          // Crear nuevos eventos con el horario actualizado
          const medicamentoActualizado = { ...medicamentoActual, ...datosActualizados };
          const { crearEventosRecurrentes } = await import('./calendarService');
          const resultado = await crearEventosRecurrentes(
            tokenData.access_token,
            medicamentoActualizado
          );
          
          if (resultado.success && resultado.eventoIds) {
            datosActualizados.eventoIdsGoogleCalendar = resultado.eventoIds;
          } else {
            datosActualizados.eventoIdsGoogleCalendar = [];
          }
        }
      } catch (calendarError) {
        console.warn('No se pudieron actualizar eventos de Google Calendar:', calendarError);
      }
    }
    
    await updateDoc(medicamentoRef, {
      ...datosActualizados,
      fechaActualizacion: new Date().toISOString()
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina un medicamento
 */
export const eliminarMedicamento = async (medicamentoId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Obtener el medicamento antes de eliminarlo para borrar eventos de Google Calendar
    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (medicamentoSnap.exists()) {
      const medicamentoData = medicamentoSnap.data();
      
      // Eliminar eventos de Google Calendar si existen
      if (medicamentoData.eventoIdsGoogleCalendar && medicamentoData.eventoIdsGoogleCalendar.length > 0) {
        try {
          const { obtenerTokenGoogle, eliminarEventoToma } = await import('./calendarService');
          const tokenData = await obtenerTokenGoogle(medicamentoData.userId);
          
          if (tokenData && tokenData.access_token) {
            // Eliminar todos los eventos asociados
            for (const eventoId of medicamentoData.eventoIdsGoogleCalendar) {
              await eliminarEventoToma(tokenData.access_token, eventoId);
            }
          }
        } catch (calendarError) {
          console.warn('No se pudieron eliminar eventos de Google Calendar:', calendarError);
        }
      }
    }

    await deleteDoc(medicamentoRef);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Marca una toma como realizada
 */
export const marcarTomaRealizada = async (medicamentoId, hora) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Obtener el medicamento actual
    const medicamentoDoc = await getDoc(doc(db, 'medicamentos', medicamentoId));
    
    if (!medicamentoDoc.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamento = medicamentoDoc.data();
    const fecha = new Date().toISOString().split('T')[0];
    
    const nuevaToma = {
      fecha,
      hora,
      tomada: true,
      timestamp: new Date().toISOString()
    };

    const tomasActualizadas = [...(medicamento.tomasRealizadas || []), nuevaToma];
    const stockActual = Math.max(0, (medicamento.stockActual || medicamento.stockInicial) - 1);

    await updateDoc(doc(db, 'medicamentos', medicamentoId), {
      tomasRealizadas: tomasActualizadas,
      stockActual,
      fechaActualizacion: new Date().toISOString()
    });

    return {
      success: true,
      toma: nuevaToma
    };
  } catch (error) {
    console.error('Error al marcar toma:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Suscribe a cambios en tiempo real de los medicamentos de un usuario
 */
export const suscribirMedicamentos = (userId, callback) => {
  if (!db) {
    console.warn('Firestore no está disponible');
    return () => {};
  }

  const medicamentosRef = collection(db, 'medicamentos');
  const q = query(
    medicamentosRef,
    where('userId', '==', userId),
    orderBy('primeraToma', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const medicamentos = [];
    querySnapshot.forEach((doc) => {
      medicamentos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(medicamentos);
  }, (error) => {
    console.error('Error en suscripción de medicamentos:', error);
    callback([]);
  });
};

