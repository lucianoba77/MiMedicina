/**
 * Servicio de autenticación con Firebase Auth
 * Maneja registro, login, logout y gestión de sesión
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
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
 * Inicia sesión con Google
 */
export const iniciarSesionConGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Verificar si el usuario ya existe en Firestore
    const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
    
    // Verificar si es asistente
    const { esAsistenteDe } = await import('./asistentesService');
    const asistenteResult = await esAsistenteDe(user.email);
    
    if (usuarioDoc.exists()) {
      const usuarioData = usuarioDoc.data();
      
      // Actualizar última sesión
      await setDoc(doc(db, 'usuarios', user.uid), {
        ...usuarioData,
        ultimaSesion: new Date().toISOString()
      }, { merge: true });

      let usuarioFinal = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || usuarioData.nombre,
        ...usuarioData
      };

      // Si es asistente, agregar información
      if (asistenteResult.success && asistenteResult.esAsistente) {
        usuarioFinal.role = 'asistente';
        usuarioFinal.pacienteId = asistenteResult.pacienteId;
        usuarioFinal.paciente = asistenteResult.paciente;
      }

      return {
        success: true,
        usuario: usuarioFinal
      };
    } else {
      // Crear nuevo usuario en Firestore
      let role = 'paciente';
      let pacienteId = null;
      let paciente = null;

      if (asistenteResult.success && asistenteResult.esAsistente) {
        role = 'asistente';
        pacienteId = asistenteResult.pacienteId;
        paciente = asistenteResult.paciente;
      }

      const usuarioData = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        role,
        tipoSuscripcion: 'gratis',
        esPremium: false,
        fechaCreacion: new Date().toISOString(),
        ultimaSesion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

      return {
        success: true,
        usuario: {
          ...usuarioData,
          pacienteId,
          paciente
        }
      };
    }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    
    // Mensajes de error más específicos
    let mensajeError = obtenerMensajeError(error.code);
    
    if (error.code === 'auth/popup-closed-by-user') {
      mensajeError = 'El popup fue cerrado. Intenta nuevamente.';
    } else if (error.code === 'auth/popup-blocked') {
      mensajeError = 'El popup fue bloqueado. Permite ventanas emergentes para este sitio.';
    } else if (error.code === 'auth/unauthorized-domain') {
      mensajeError = 'Este dominio no está autorizado. Verifica la configuración de Firebase.';
    } else if (error.code === 'auth/operation-not-allowed') {
      mensajeError = 'El login con Google no está habilitado. Verifica la configuración de Firebase Auth.';
    }
    
    return {
      success: false,
      error: mensajeError
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
          const usuarioData = usuarioDoc.data();
          
          // Verificar si es asistente
          const { esAsistenteDe } = await import('./asistentesService');
          const asistenteResult = await esAsistenteDe(user.email);
          
          if (asistenteResult.success && asistenteResult.esAsistente) {
            callback({
              id: user.uid,
              email: user.email,
              nombre: user.displayName || usuarioData.nombre,
              role: 'asistente',
              pacienteId: asistenteResult.pacienteId,
              paciente: asistenteResult.paciente,
              ...usuarioData
            });
          } else {
            callback({
              id: user.uid,
              email: user.email,
              nombre: user.displayName || usuarioData.nombre,
              role: usuarioData.role || 'paciente',
              ...usuarioData
            });
          }
        } else {
          // Usuario nuevo, verificar si es asistente
          try {
            const { esAsistenteDe } = await import('./asistentesService');
            const asistenteResult = await esAsistenteDe(user.email);
            
            if (asistenteResult.success && asistenteResult.esAsistente) {
              callback({
                id: user.uid,
                email: user.email,
                nombre: user.displayName || user.email.split('@')[0],
                role: 'asistente',
                pacienteId: asistenteResult.pacienteId,
                paciente: asistenteResult.paciente
              });
            } else {
              callback(null);
            }
          } catch (error) {
            console.error('Error al verificar asistente:', error);
            callback(null);
          }
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
    'auth/operation-not-allowed': 'Operación no permitida. Verifica que Google esté habilitado en Firebase Auth.',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Este usuario ha sido deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'El popup fue cerrado. Intenta nuevamente.',
    'auth/popup-blocked': 'El popup fue bloqueado. Permite ventanas emergentes.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase.',
    'auth/cancelled-popup-request': 'Solo se puede abrir un popup a la vez.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de login.'
  };

  return mensajes[codigoError] || `Error de autenticación: ${codigoError || 'Error desconocido'}`;
};

