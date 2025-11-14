// Configuración de Firebase para MiMedicina

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// Usa variables de entorno si están disponibles, sino usa valores directos
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA6Zubxqx5QGYfGVd5SZOJ_JWOKbcN75YU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mimedicina-ebec7.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mimedicina-ebec7",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mimedicina-ebec7.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "61209788331",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:61209788331:web:fda8aa3439a78523179cee",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-CSW8HKD7HL" // Opcional: Solo para Analytics
};

// Inicializa Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}

// Inicializa servicios de Firebase
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export default app;

