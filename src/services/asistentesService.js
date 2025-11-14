/**
 * Servicio para gestionar asistentes/supervisores
 * Maneja la relación entre pacientes y asistentes
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLECCION_ASISTENTES = 'asistentes';

/**
 * Agrega un asistente a un paciente
 * @param {string} pacienteId - ID del paciente
 * @param {string} emailAsistente - Email del asistente
 * @param {string} nombreAsistente - Nombre del asistente
 */
export const agregarAsistente = async (pacienteId, emailAsistente, nombreAsistente) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Verificar que el asistente no esté ya agregado
    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('pacienteId', '==', pacienteId),
      where('emailAsistente', '==', emailAsistente)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        success: false,
        error: 'Este asistente ya está agregado'
      };
    }

    // Agregar asistente
    const asistenteData = {
      pacienteId,
      emailAsistente,
      nombreAsistente,
      fechaAgregado: new Date().toISOString(),
      activo: true
    };

    const docRef = await addDoc(collection(db, COLECCION_ASISTENTES), asistenteData);

    return {
      success: true,
      asistente: { id: docRef.id, ...asistenteData }
    };
  } catch (error) {
    console.error('Error al agregar asistente:', error);
    return {
      success: false,
      error: error.message || 'Error al agregar asistente'
    };
  }
};

/**
 * Obtiene todos los asistentes de un paciente
 */
export const obtenerAsistentes = async (pacienteId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('pacienteId', '==', pacienteId),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const asistentes = [];

    querySnapshot.forEach((doc) => {
      asistentes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      asistentes
    };
  } catch (error) {
    console.error('Error al obtener asistentes:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener asistentes',
      asistentes: []
    };
  }
};

/**
 * Elimina un asistente
 */
export const eliminarAsistente = async (asistenteId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    await deleteDoc(doc(db, COLECCION_ASISTENTES, asistenteId));

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar asistente:', error);
    return {
      success: false,
      error: error.message || 'Error al eliminar asistente'
    };
  }
};

/**
 * Verifica si un usuario es asistente de algún paciente
 */
export const esAsistenteDe = async (emailAsistente) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('emailAsistente', '==', emailAsistente),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const asistenteDoc = querySnapshot.docs[0];
      const asistenteData = asistenteDoc.data();
      
      // Obtener datos del paciente
      const pacienteDoc = await getDoc(doc(db, 'usuarios', asistenteData.pacienteId));
      
      if (pacienteDoc.exists()) {
        return {
          success: true,
          esAsistente: true,
          pacienteId: asistenteData.pacienteId,
          paciente: {
            id: pacienteDoc.id,
            ...pacienteDoc.data()
          },
          asistente: {
            id: asistenteDoc.id,
            ...asistenteData
          }
        };
      }
    }

    return {
      success: true,
      esAsistente: false
    };
  } catch (error) {
    console.error('Error al verificar asistente:', error);
    return {
      success: false,
      esAsistente: false,
      error: error.message
    };
  }
};

/**
 * Obtiene el paciente asociado a un asistente
 */
export const obtenerPacienteDeAsistente = async (emailAsistente) => {
  try {
    const resultado = await esAsistenteDe(emailAsistente);
    
    if (resultado.success && resultado.esAsistente) {
      return {
        success: true,
        paciente: resultado.paciente,
        pacienteId: resultado.pacienteId
      };
    }

    return {
      success: false,
      error: 'No se encontró paciente asociado'
    };
  } catch (error) {
    console.error('Error al obtener paciente de asistente:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

