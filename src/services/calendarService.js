/**
 * Servicio para sincronizar con Google Calendar
 * Maneja autenticación OAuth y creación/actualización de eventos
 */

import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configuración de Google Calendar API
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

/**
 * Guarda el token de acceso de Google en Firestore
 */
export const guardarTokenGoogle = async (userId, tokenData) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    console.log('Guardando token para usuario:', userId, 'Token data:', tokenData);

    const tokenParaGuardar = {
      ...tokenData,
      fechaActualizacion: new Date().toISOString(),
      userId: userId // Agregar userId para referencia
    };

    await setDoc(doc(db, 'googleTokens', userId), tokenParaGuardar, { merge: true });

    console.log('Token guardado exitosamente en Firestore');
    return { success: true };
  } catch (error) {
    console.error('Error al guardar token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtiene el token de acceso de Google del usuario
 */
export const obtenerTokenGoogle = async (userId) => {
  try {
    if (!db) {
      console.log('Firestore no disponible');
      return null;
    }

    const tokenDoc = await getDoc(doc(db, 'googleTokens', userId));
    if (tokenDoc.exists()) {
      const tokenData = tokenDoc.data();
      console.log('Token encontrado para usuario:', userId, 'Tiene access_token:', !!tokenData.access_token);
      return tokenData;
    }
    console.log('No se encontró token para usuario:', userId);
    return null;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Elimina el token de acceso (desconecta Google Calendar)
 */
export const eliminarTokenGoogle = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    await deleteDoc(doc(db, 'googleTokens', userId));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Crea un evento en Google Calendar para una toma de medicamento
 */
export const crearEventoToma = async (accessToken, medicamento, fecha, hora) => {
  try {
    const fechaCompleta = new Date(`${fecha}T${hora}:00`);
    const fechaFin = new Date(fechaCompleta);
    fechaFin.setMinutes(fechaFin.getMinutes() + 15); // Evento de 15 minutos

    const evento = {
      summary: `💊 ${medicamento.nombre}`,
      description: `Toma de ${medicamento.nombre}\n` +
                   `Presentación: ${medicamento.presentacion}\n` +
                   `Condición: ${medicamento.afeccion || 'N/A'}\n` +
                   `Stock: ${medicamento.stockActual}/${medicamento.stockInicial}`,
      start: {
        dateTime: fechaCompleta.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: fechaFin.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 }, // Recordatorio 15 min antes
          { method: 'popup', minutes: 5 }   // Recordatorio 5 min antes
        ]
      },
      colorId: obtenerColorId(medicamento.color),
      extendedProperties: {
        private: {
          medicamentoId: medicamento.id,
          tipo: 'toma_medicamento'
        }
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evento)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al crear evento');
    }

    const eventoCreado = await response.json();
    return {
      success: true,
      eventoId: eventoCreado.id,
      evento: eventoCreado
    };
  } catch (error) {
    console.error('Error al crear evento en Google Calendar:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualiza un evento existente en Google Calendar
 */
export const actualizarEventoToma = async (accessToken, eventoId, medicamento, fecha, hora) => {
  try {
    const fechaCompleta = new Date(`${fecha}T${hora}:00`);
    const fechaFin = new Date(fechaCompleta);
    fechaFin.setMinutes(fechaFin.getMinutes() + 15);

    const evento = {
      summary: `💊 ${medicamento.nombre}`,
      description: `Toma de ${medicamento.nombre}\n` +
                   `Presentación: ${medicamento.presentacion}\n` +
                   `Condición: ${medicamento.afeccion || 'N/A'}\n` +
                   `Stock: ${medicamento.stockActual}/${medicamento.stockInicial}`,
      start: {
        dateTime: fechaCompleta.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: fechaFin.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'popup', minutes: 5 }
        ]
      },
      colorId: obtenerColorId(medicamento.color)
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventoId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evento)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al actualizar evento');
    }

    const eventoActualizado = await response.json();
    return {
      success: true,
      evento: eventoActualizado
    };
  } catch (error) {
    console.error('Error al actualizar evento en Google Calendar:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina un evento de Google Calendar
 */
export const eliminarEventoToma = async (accessToken, eventoId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventoId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al eliminar evento');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar evento de Google Calendar:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Crea eventos recurrentes para todas las tomas de un medicamento
 */
export const crearEventosRecurrentes = async (accessToken, medicamento) => {
  try {
    const eventos = [];
    const fechaHoy = new Date();
    const fechaFin = new Date(fechaHoy);
    fechaFin.setDate(fechaFin.getDate() + (medicamento.diasTratamiento || 30));

    // Calcular todas las horas de toma
    const [hora, minuto] = medicamento.primeraToma.split(':');
    const horasToma = [];
    
    for (let i = 0; i < medicamento.tomasDiarias; i++) {
      const intervalo = 24 / medicamento.tomasDiarias;
      const horas = (parseInt(hora) + (i * intervalo)) % 24;
      const minutos = i === 0 ? parseInt(minuto) : 0;
      horasToma.push(`${Math.floor(horas).toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`);
    }

    // Crear eventos para cada día del tratamiento
    for (let dia = 0; dia < (medicamento.diasTratamiento || 30); dia++) {
      const fecha = new Date(fechaHoy);
      fecha.setDate(fecha.getDate() + dia);
      const fechaStr = fecha.toISOString().split('T')[0];

      for (const horaToma of horasToma) {
        const resultado = await crearEventoToma(accessToken, medicamento, fechaStr, horaToma);
        if (resultado.success) {
          eventos.push(resultado.eventoId);
        }
      }
    }

    return {
      success: true,
      eventosCreados: eventos.length,
      eventoIds: eventos
    };
  } catch (error) {
    console.error('Error al crear eventos recurrentes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Convierte el color del medicamento a un colorId de Google Calendar
 */
const obtenerColorId = (colorHex) => {
  // Mapeo de colores hex a colorId de Google Calendar (1-11)
  const colores = {
    '#FFFFFF': '1', // Lavanda
    '#FFB6C1': '11', // Rosa
    '#ADD8E6': '9', // Azul
    '#F5F5DC': '5', // Amarillo
    '#E6E6FA': '3', // Púrpura
    '#90EE90': '10', // Verde
    '#FFFF00': '5', // Amarillo
    '#FFA500': '6', // Naranja
    '#800080': '3', // Púrpura
    '#00BFFF': '9', // Azul
    '#00FF00': '10', // Verde
    '#FF0000': '11' // Rojo
  };

  return colores[colorHex] || '1';
};

/**
 * Verifica si el usuario tiene Google Calendar conectado
 */
export const tieneGoogleCalendarConectado = async (userId) => {
  const token = await obtenerTokenGoogle(userId);
  return token !== null && token.access_token;
};

