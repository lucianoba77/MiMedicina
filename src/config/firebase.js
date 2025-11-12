// Configuración de Firebase para MiMedicina
// ⚠️ IMPORTANTE: Reemplaza estas credenciales con las de tu proyecto Firebase
// Las encontrarás en: Firebase Console > Configuración del proyecto > Tus apps > Web app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// Si usas variables de entorno, descomenta las líneas de process.env y comenta las hardcodeadas
const firebaseConfig = {
  // Opción 1: Usar variables de entorno (RECOMENDADO para producción)
  // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.REACT_APP_FIREBASE_APP_ID,

  // Opción 2: Credenciales directas (para desarrollo)
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "mimedicina-ebec7.firebaseapp.com",
  projectId: "mimedicina-ebec7",
  storageBucket: "mimedicina-ebec7.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  // En desarrollo, permite continuar sin Firebase
  if (process.env.NODE_ENV === 'development') {
    console.warn('Firebase no está configurado. Usando datos mock.');
  }
}

// Inicializar servicios de Firebase
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export default app;

