# Configurar Google Authentication en Firebase

Para que el login con Google funcione, necesitas habilitar Google como proveedor de autenticación en Firebase.

## Pasos para Habilitar Google Auth

1. **Ve a Firebase Console**
   - Abre [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto `mimedicina-ebec7`

2. **Habilita Google como Proveedor**
   - Ve a **Authentication** → **Sign-in method**
   - Haz clic en **Google**
   - Activa el toggle **Enable**
   - Completa el **Email de soporte del proyecto** (puede ser tu email)
   - Haz clic en **Guardar**

3. **Configura Dominios Autorizados**
   - En la misma página de **Sign-in method** → **Google**
   - Desplázate hasta **Dominios autorizados**
   - Asegúrate de que estén agregados:
     - `localhost` (para desarrollo)
     - `mimedicina-ebec7.firebaseapp.com` (tu dominio de Firebase)
     - Si tienes un dominio personalizado, agrégalo también

4. **Verifica OAuth Consent Screen (si es necesario)**
   - Si aparece un error sobre OAuth consent screen, ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Selecciona tu proyecto
   - Ve a **APIs & Services** → **OAuth consent screen**
   - Completa la información requerida:
     - **User Type**: Internal (si es solo para tu organización) o External
     - **App name**: MiMedicina
     - **User support email**: Tu email
     - **Developer contact information**: Tu email
   - Agrega los **Scopes** necesarios:
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar.events` (para Google Calendar)
   - Agrega **Test users** (tus emails de prueba)
   - Guarda y continúa

## Verificar Configuración

Después de configurar, intenta:
1. Iniciar sesión con Google desde la app
2. Si aparece un error, verifica la consola del navegador para ver el código de error específico

## Errores Comunes

- **auth/operation-not-allowed**: Google no está habilitado en Firebase Auth
- **auth/unauthorized-domain**: El dominio no está autorizado
- **auth/popup-blocked**: El navegador bloqueó el popup
- **auth/popup-closed-by-user**: El usuario cerró el popup

