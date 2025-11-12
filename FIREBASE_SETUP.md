# 🔥 Configuración de Firebase para MiMedicina

Esta guía te ayudará a configurar Firebase paso a paso para la aplicación MiMedicina.

## 📋 Prerrequisitos

1. Cuenta de Google
2. Node.js instalado
3. NPM o Yarn

## 🚀 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `MiMedicina` (o el que prefieras)
4. Desactiva Google Analytics (opcional) o actívalo si lo necesitas
5. Haz clic en "Crear proyecto"

## 🔐 Paso 2: Configurar Autenticación

1. En el panel de Firebase, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Habilita los siguientes proveedores:
   - **Email/Password** (método principal)
   - **Google** (opcional, para login rápido)

### Configurar Email/Password:
- Ve a la pestaña "Sign-in method"
- Haz clic en "Email/Password"
- Actívalo y haz clic en "Guardar"

## 🗄️ Paso 3: Crear Base de Datos Firestore

1. Ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona modo **Producción** (o Prueba para desarrollo)
4. Elige la ubicación más cercana a tus usuarios
5. Haz clic en "Habilitar"

## 📊 Paso 4: Configurar Reglas de Seguridad

Ve a la pestaña **Reglas** en Firestore y reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para medicamentos
    match /medicamentos/{medicamentoId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Reglas para tomas realizadas
    match /tomas/{tomaId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas para visitas médicas
    match /visitas/{visitaId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🔧 Paso 5: Instalar Firebase SDK

En la terminal del proyecto, ejecuta:

```bash
npm install firebase
```

## 📝 Paso 6: Configurar Firebase en la Aplicación

Crea el archivo `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

### Obtener las credenciales:

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Desplázate hasta "Tus apps"
3. Haz clic en el ícono de Web (`</>`)
4. Registra la app con un nickname
5. Copia las credenciales al archivo `firebase.js`

## 🏗️ Paso 7: Estructura de la Base de Datos

### Colección: `usuarios`
```javascript
{
  id: "userId",
  email: "usuario@email.com",
  nombre: "Nombre Usuario",
  role: "paciente" | "asistente",
  tipoSuscripcion: "gratis" | "premium",
  esPremium: boolean,
  fechaCreacion: timestamp,
  ultimaSesion: timestamp
}
```

### Colección: `medicamentos`
```javascript
{
  id: "medicamentoId",
  userId: "userId",
  nombre: "Paracetamol",
  presentacion: "comprimidos",
  tomasDiarias: 2,
  primeraToma: "08:00",
  afeccion: "Dolor de cabeza",
  stockInicial: 30,
  stockActual: 25,
  color: "#FFB6C1",
  diasTratamiento: 30,
  esCronico: false,
  alarmasActivas: true,
  detalles: "Tomar con comida",
  fechaVencimiento: timestamp, // NUEVO
  fechaCreacion: timestamp,
  activo: true
}
```

### Colección: `tomas`
```javascript
{
  id: "tomaId",
  medicamentoId: "medicamentoId",
  userId: "userId",
  fecha: "2025-01-15",
  hora: "08:00",
  tomada: true,
  timestamp: timestamp
}
```

### Colección: `visitas`
```javascript
{
  id: "visitaId",
  userId: "userId",
  tipo: "consulta" | "control" | "urgencia",
  medico: "Dr. Juan Pérez",
  fecha: timestamp,
  motivo: "Control de presión",
  notas: "Recordar llevar estudios",
  recordatorio: true,
  fechaRecordatorio: timestamp
}
```

## 🔒 Paso 8: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

Actualiza `firebase.js` para usar las variables de entorno:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## ✅ Paso 9: Verificar Instalación

1. Ejecuta `npm start`
2. Verifica que no haya errores en la consola
3. Intenta hacer login (aunque aún no esté conectado)

## 🚨 Seguridad Adicional

1. **Habilitar HTTPS**: Firebase lo hace automáticamente
2. **Configurar dominios autorizados** en Authentication > Settings > Authorized domains
3. **Revisar reglas de seguridad** regularmente
4. **Habilitar logging** en Firestore para monitorear accesos

## 📱 Próximos Pasos

1. Implementar autenticación con Firebase Auth
2. Migrar datos de medicamentos a Firestore
3. Implementar sincronización en tiempo real
4. Agregar funcionalidad de fechas de vencimiento
5. Implementar recordatorios de visitas médicas

## 🔗 Recursos Útiles

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)

