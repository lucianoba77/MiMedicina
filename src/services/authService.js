/**
 * Servicio de autenticación con Firebase Auth
 * Maneja registro, login, logout y gestión de sesión
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Registra un nuevo usuario
 */
export const registrarUsuario = async (email, password, nombre) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: nombre
    });

    // Crear documento de usuario en Firestore
    const usuarioData = {
      id: user.uid,
      email: user.email,
      nombre: nombre,
      role: 'paciente',
      tipoSuscripcion: 'gratis',
      esPremium: false,
      fechaCreacion: new Date().toISOString(),
      ultimaSesion: new Date().toISOString()
    };

    await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

    return {
      success: true,
      usuario: usuarioData
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return {
      success: false,
      error: obtenerMensajeError(error.code)
    };
  }
};

/**
 * Inicia sesión con email y password
 */
export const iniciarSesion = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos del usuario desde Firestore
    const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
    
    if (usuarioDoc.exists()) {
      const usuarioData = usuarioDoc.data();
      
      // Actualizar última sesión
      await setDoc(doc(db, 'usuarios', user.uid), {
        ...usuarioData,
        ultimaSesion: new Date().toISOString()
      }, { merge: true });

      return {
        success: true,
        usuario: {
          id: user.uid,
          email: user.email,
          nombre: user.displayName || usuarioData.nombre,
          ...usuarioData
        }
      };
    } else {
      // Si no existe el documento, crearlo
      const usuarioData = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || email.split('@')[0],
        role: 'paciente',
        tipoSuscripcion: 'gratis',
        esPremium: false,
        fechaCreacion: new Date().toISOString(),
        ultimaSesion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

      return {
        success: true,
        usuario: usuarioData
      };
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return {
      success: false,
      error: obtenerMensajeError(error.code)
    };
  }
};

/**
 * Cierra la sesión del usuario
 */
export const cerrarSesion = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Observa cambios en el estado de autenticación
 */
export const observarEstadoAuth = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuario autenticado, obtener datos de Firestore
      try {
        const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (usuarioDoc.exists()) {
          callback({
            id: user.uid,
            email: user.email,
            nombre: user.displayName || usuarioDoc.data().nombre,
            ...usuarioDoc.data()
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        callback(null);
      }
    } else {
      // Usuario no autenticado
      callback(null);
    }
  });
};

/**
 * Obtiene el usuario actual
 */
export const obtenerUsuarioActual = async () => {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const usuarioDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
    if (usuarioDoc.exists()) {
      return {
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        nombre: auth.currentUser.displayName || usuarioDoc.data().nombre,
        ...usuarioDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

/**
 * Convierte códigos de error de Firebase a mensajes en español
 */
const obtenerMensajeError = (codigoError) => {
  const mensajes = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'El email no es válido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Este usuario ha sido deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
  };

  return mensajes[codigoError] || 'Error de autenticación. Intenta nuevamente';
};

