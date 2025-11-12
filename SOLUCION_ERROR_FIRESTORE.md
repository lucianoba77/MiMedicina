# 🔧 Solución: Error de Facturación en Firestore

## ❌ Problema
```
This API method requires billing to be enabled. Please enable billing on project...
```

## ✅ Solución: Usar Modo "Prueba" (Sin Facturación)

Firebase ofrece un modo **"Prueba"** que **NO requiere facturación** y es perfecto para desarrollo.

### Paso 1: Crear Base de Datos en Modo "Prueba"

1. Ve a **Firestore Database** en Firebase Console
2. Haz clic en **"Crear base de datos"**
3. **IMPORTANTE:** Selecciona **"Prueba"** (NO "Producción")
   - ✅ **Modo Prueba:** NO requiere facturación, permite leer/escribir durante 30 días
   - ❌ **Modo Producción:** Requiere facturación habilitada

4. Elige la **ubicación** de la base de datos:
   - Recomendado: `us-central` (Iowa) o la más cercana a tu ubicación
   - Esta ubicación NO se puede cambiar después

5. Haz clic en **"Habilitar"**

### Paso 2: Configurar Reglas de Seguridad (Importante)

Una vez creada la base de datos:

1. Ve a la pestaña **"Reglas"** en Firestore
2. Reemplaza las reglas con estas (modo prueba más seguro):

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

## 📊 Modo "Prueba" vs "Producción"

### Modo "Prueba" (Recomendado para Desarrollo)
- ✅ **NO requiere facturación**
- ✅ Permite leer y escribir libremente durante 30 días
- ✅ Perfecto para desarrollo y pruebas
- ⚠️ Después de 30 días, necesitas actualizar las reglas o migrar a Producción
- ⚠️ Las reglas por defecto permiten lectura/escritura a todos (por eso debes configurarlas)

### Modo "Producción" (Para Producción)
- ❌ **Requiere facturación habilitada**
- ✅ Reglas de seguridad estrictas desde el inicio
- ✅ Sin límite de tiempo
- ✅ Ideal para aplicaciones en producción

---

## 🔄 ¿Qué Pasará Después de 30 Días?

Después de 30 días en modo "Prueba", Firebase te pedirá:
1. **Migrar a modo Producción** (requiere facturación)
2. **Actualizar las reglas de seguridad** para mantener el modo Prueba

**Recomendación:** Para desarrollo, el modo Prueba es suficiente. Cuando tu app esté lista para producción, puedes migrar a modo Producción y habilitar facturación.

---

## 💰 Información sobre Facturación (Opcional)

Si en el futuro quieres habilitar facturación para usar modo Producción:

1. Ve a [Google Cloud Console](https://console.developers.google.com/billing/enable?project=mimedicina-ebec7)
2. O desde Firebase Console > Configuración del proyecto > Uso y facturación
3. Firebase tiene un **plan gratuito generoso** que incluye:
   - 50,000 lecturas/día
   - 20,000 escrituras/día
   - 20,000 eliminaciones/día
   - 1 GB de almacenamiento

**Para desarrollo y proyectos pequeños, el plan gratuito es más que suficiente.**

---

## ✅ Verificación

Después de crear la base de datos en modo Prueba:

1. Deberías ver la base de datos creada en Firebase Console
2. Puedes ver las pestañas: "Datos", "Reglas", "Índices", "Uso"
3. No deberías ver más errores de facturación

---

## 🎯 Resumen

**Para desarrollo:** Usa modo **"Prueba"** (sin facturación)
**Para producción:** Usa modo **"Producción"** (requiere facturación, pero tiene plan gratuito generoso)

**Para tu proyecto de desarrollo, el modo Prueba es perfecto y no requiere facturación.**

