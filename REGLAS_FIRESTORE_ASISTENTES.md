# Reglas de Firestore para Asistentes

Para que la funcionalidad de asistentes funcione correctamente, necesitas actualizar las reglas de Firestore en la consola de Firebase.

## Reglas Completas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para usuarios
    match /usuarios/{userId} {
      // Los usuarios pueden leer y escribir sus propios datos
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Los asistentes pueden leer datos del paciente que supervisan
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/asistentes/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/asistentes/$(request.auth.uid)).data.pacienteId == userId;
    }
    
    // Reglas para medicamentos
    match /medicamentos/{medicamentoId} {
      // Los usuarios pueden leer y escribir sus propios medicamentos
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      // Los asistentes pueden leer medicamentos del paciente que supervisan
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/asistentes/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/asistentes/$(request.auth.uid)).data.pacienteId == resource.data.userId;
    }
    
    // Reglas para asistentes
    match /asistentes/{asistenteId} {
      // Los pacientes pueden crear asistentes para ellos mismos
      allow create: if request.auth != null && 
        request.resource.data.pacienteId == request.auth.uid;
      
      // Los pacientes pueden leer sus propios asistentes
      allow read: if request.auth != null && 
        resource.data.pacienteId == request.auth.uid;
      
      // Los pacientes pueden eliminar sus propios asistentes
      allow delete: if request.auth != null && 
        resource.data.pacienteId == request.auth.uid;
      
      // Los asistentes pueden leer su propia información
      allow read: if request.auth != null && 
        resource.data.emailAsistente == request.auth.token.email;
    }
    
    // Reglas para tokens de Google Calendar
    match /googleTokens/{userId} {
      // Los usuarios solo pueden leer y escribir sus propios tokens
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Cómo Aplicar las Reglas

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mimedicina-ebec7`
3. Ve a **Firestore Database** → **Reglas**
4. Copia y pega las reglas de arriba
5. Haz clic en **Publicar**

## Nota Importante

Si estás en modo de desarrollo y quieres reglas más permisivas temporalmente (NO recomendado para producción):

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

Esto permite que cualquier usuario autenticado lea y escriba en cualquier colección. Úsalo solo para desarrollo.

