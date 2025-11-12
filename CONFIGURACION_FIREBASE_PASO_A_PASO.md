# 🔥 Configuración de Firebase - Paso a Paso para MiMedicina

## ✅ Paso 1: Agregar App Web (AHORA)

En la página de configuración que tienes abierta:

1. **Haz clic en el ícono `</>` (Web)** para agregar una app web
2. **Registra la app:**
   - Nickname: `MiMedicina Web` (o el que prefieras)
   - ✅ Marca la casilla "También configura Firebase Hosting" (opcional, puedes hacerlo después)
3. **Haz clic en "Registrar app"**
4. **Copia las credenciales** que aparecerán (las necesitarás en el Paso 3)

### Las credenciales se verán así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mimedicina-ebec7.firebaseapp.com",
  projectId: "mimedicina-ebec7",
  storageBucket: "mimedicina-ebec7.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 🔐 Paso 2: Configurar Autenticación

1. En el menú lateral izquierdo, ve a **"Authentication"** (Autenticación)
2. Haz clic en **"Comenzar"** o **"Get started"**
3. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
4. Haz clic en **"Email/Password"**
5. **Activa** el primer toggle (Email/Password)
6. **Opcional:** Activa el segundo toggle si quieres que los usuarios puedan crear cuentas
7. Haz clic en **"Guardar"**

---

## 🗄️ Paso 3: Crear Base de Datos Firestore

1. En el menú lateral, ve a **"Firestore Database"** (Base de datos de Firestore)
2. Haz clic en **"Crear base de datos"**
3. **⚠️ IMPORTANTE:** Selecciona el modo:
   - **"Prueba"** para desarrollo (✅ NO requiere facturación, permite lectura/escritura durante 30 días)
   - **"Producción"** para producción (❌ REQUIERE facturación habilitada)
4. **Recomendación:** Empieza con **"Prueba"** para desarrollo (NO necesitas habilitar facturación)
5. Elige la **ubicación** de la base de datos (ej: `us-central` o la más cercana)
   - ⚠️ Esta ubicación NO se puede cambiar después
6. Haz clic en **"Habilitar"**

### 💡 Nota sobre Facturación
- **Modo "Prueba":** NO requiere facturación, perfecto para desarrollo
- **Modo "Producción":** Requiere facturación, pero Firebase tiene un plan gratuito generoso
- Para desarrollo, **usa modo "Prueba"** para evitar el error de facturación

---

## 📊 Paso 4: Configurar Reglas de Seguridad (IMPORTANTE)

1. En Firestore Database, ve a la pestaña **"Reglas"**
2. **Reemplaza** las reglas actuales con estas:

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
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Reglas para visitas médicas
    match /visitas/{visitaId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Haz clic en **"Publicar"**

---

## 🔧 Paso 5: Configurar Firebase en tu Proyecto React

### 5.1. Actualizar el archivo de configuración

Abre `src/config/firebase.js` y reemplaza las credenciales con las que copiaste en el Paso 1:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", // ← Pega tu API Key
  authDomain: "mimedicina-ebec7.firebaseapp.com",
  projectId: "mimedicina-ebec7",
  storageBucket: "mimedicina-ebec7.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID", // ← Pega tu Messaging Sender ID
  appId: "TU_APP_ID" // ← Pega tu App ID
};
```

### 5.2. Verificar instalación

Firebase ya está instalado (se instaló automáticamente). Verifica con:

```bash
npm list firebase
```

---

## ✅ Paso 6: Verificar Configuración

1. Abre `src/config/firebase.js`
2. Verifica que todas las credenciales estén correctas
3. Ejecuta la aplicación:
   ```bash
   npm start
   ```
4. Revisa la consola del navegador - no debe haber errores de Firebase

---

## 🔒 Paso 7: Configurar Variables de Entorno (OPCIONAL pero RECOMENDADO)

### 7.1. Crear archivo `.env`

En la raíz del proyecto, crea un archivo `.env`:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=mimedicina-ebec7.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mimedicina-ebec7
REACT_APP_FIREBASE_STORAGE_BUCKET=mimedicina-ebec7.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

### 7.2. Actualizar firebase.js para usar variables de entorno

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

### 7.3. Agregar .env al .gitignore

Asegúrate de que `.env` esté en tu `.gitignore` para no subir las credenciales a GitHub.

---

## 📋 Checklist de Configuración

- [ ] ✅ App web agregada en Firebase Console
- [ ] ✅ Credenciales copiadas
- [ ] ✅ Authentication configurado (Email/Password habilitado)
- [ ] ✅ Firestore Database creada
- [ ] ✅ Reglas de seguridad configuradas
- [ ] ✅ Firebase SDK instalado (npm install firebase)
- [ ] ✅ Archivo `src/config/firebase.js` configurado con credenciales
- [ ] ✅ Aplicación ejecuta sin errores
- [ ] ✅ (Opcional) Variables de entorno configuradas

---

## 🚨 Solución de Problemas

### Error: "Firebase: Error (auth/configuration-not-found)"
- **Solución:** Verifica que las credenciales en `firebase.js` sean correctas

### Error: "Permission denied"
- **Solución:** Verifica que las reglas de Firestore estén configuradas correctamente

### Error: "Firebase App named '[DEFAULT]' already exists"
- **Solución:** Reinicia la aplicación (Ctrl+C y npm start de nuevo)

---

## 🎯 Próximos Pasos

Una vez completada la configuración:

1. **Implementar autenticación con Firebase Auth** (reemplazar el sistema mock actual)
2. **Migrar datos a Firestore** (medicamentos, usuarios, etc.)
3. **Implementar sincronización en tiempo real**
4. **Agregar funcionalidad de fechas de vencimiento**
5. **Implementar recordatorios de visitas médicas**

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema durante la configuración, verifica:
1. Que todas las credenciales estén correctas
2. Que Authentication esté habilitado
3. Que Firestore esté creado y las reglas estén publicadas
4. Que la aplicación esté ejecutándose correctamente

