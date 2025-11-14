# Solución de Problemas Técnicos

## 1. Login con Google no funciona

### Problema
No puedes iniciar sesión con tu cuenta de Gmail.

### Soluciones

#### A. Habilitar Google en Firebase Auth
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mimedicina-ebec7`
3. Ve a **Authentication** → **Sign-in method**
4. Haz clic en **Google**
5. Activa el toggle **Enable**
6. Completa el **Email de soporte del proyecto**
7. Haz clic en **Guardar**

#### B. Agregar Dominios Autorizados
1. En la misma página de **Sign-in method** → **Google**
2. Desplázate hasta **Dominios autorizados**
3. Agrega:
   - `localhost`
   - `mimedicina-ebec7.firebaseapp.com`
   - Tu dominio personalizado (si lo tienes)

#### C. Verificar OAuth Consent Screen
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Completa la información:
   - **User Type**: External (si quieres que otros usuarios puedan usar la app)
   - **App name**: MiMedicina
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
5. En **Scopes**, agrega:
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar.events`
6. En **Test users**, agrega tu email de Gmail
7. Guarda y continúa

#### D. Verificar Variables de Entorno
Asegúrate de que tu archivo `.env` tenga:
```
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
```

## 2. Error "Faltan permisos" al agregar asistente

### Problema
Al intentar agregar un asistente, aparece un error de permisos.

### Solución: Actualizar Reglas de Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Reglas**
4. Copia y pega las reglas del archivo `REGLAS_FIRESTORE_ASISTENTES.md`
5. Haz clic en **Publicar**

**Reglas para desarrollo (temporal, NO para producción):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 3. No puedo sincronizar con Google Calendar

### Problema
Aunque agregaste tu cuenta de correo a las cuentas de prueba, no puedes sincronizar.

### Soluciones

#### A. Verificar OAuth Consent Screen
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Verifica que estés en modo **Testing** o **Production**
5. Si estás en **Testing**, agrega tu email en **Test users**

#### B. Verificar Redirect URI
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en tu **OAuth 2.0 Client ID**
5. Verifica que en **Authorized redirect URIs** esté:
   - `http://localhost:3000/auth/google/callback`
   - `https://mimedicina-ebec7.firebaseapp.com/auth/google/callback`

#### C. Verificar Scopes
Asegúrate de que el scope `https://www.googleapis.com/auth/calendar.events` esté habilitado.

#### D. Verificar Google Calendar API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Library**
4. Busca "Google Calendar API"
5. Asegúrate de que esté **habilitada**

## 4. Verificar Configuración Completa

### Checklist
- [ ] Google Auth habilitado en Firebase
- [ ] Dominios autorizados configurados
- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (si estás en modo Testing)
- [ ] Reglas de Firestore actualizadas
- [ ] Google Calendar API habilitada
- [ ] Redirect URIs configurados
- [ ] Variables de entorno configuradas

## 5. Errores Comunes y Soluciones

### `auth/operation-not-allowed`
**Solución**: Google no está habilitado en Firebase Auth. Sigue el paso 1.A.

### `auth/unauthorized-domain`
**Solución**: El dominio no está autorizado. Sigue el paso 1.B.

### `auth/popup-blocked`
**Solución**: Permite ventanas emergentes en tu navegador.

### `auth/popup-closed-by-user`
**Solución**: No cierres el popup, déjalo abrir completamente.

### `Permission denied` en Firestore
**Solución**: Actualiza las reglas de Firestore. Sigue el paso 2.

### `403 Access Denied` en Google Calendar
**Solución**: Verifica que Google Calendar API esté habilitada y que los scopes estén correctos.

## 6. Probar la Configuración

1. **Login con Google**:
   - Intenta iniciar sesión con tu cuenta de Gmail
   - Si funciona, verás el dashboard

2. **Agregar Asistente**:
   - Ve a Ajustes
   - Intenta agregar un asistente con un email
   - Debe funcionar sin errores de permisos

3. **Sincronizar Calendar**:
   - Ve a Ajustes
   - Haz clic en "Conectar Google Calendar"
   - Debe redirigirte a Google y pedir permisos
   - Después de autorizar, debe volver a la app

Si después de seguir estos pasos aún tienes problemas, revisa la consola del navegador (F12) para ver errores específicos.

