# 🧪 GUÍA DE TESTING Y VERIFICACIÓN - Baby Shower Antonella

**Fecha**: 26 de Noviembre, 2025  
**Status**: LISTA PARA TESTING

---

## 1. VERIFICACIÓN RÁPIDA EN NAVEGADOR

### 1.1 Abrir el Sitio
```
URL: https://franuber34-ship-it.github.io/baby-shower-antonella/
```

**✓ Esperado:**
- Página con degradado rosa cargue
- Encabezado "¡Es una niña! Baby Shower"
- Fecha: 12 Diciembre 2025, 7:30 PM
- Iconos flotantes animan suavemente

---

## 2. VERIFICAR FIREBASE CONNECTION

### 2.1 Abrir Console del Navegador (F12)

```javascript
// 1. Verificar que Firebase se inicializó
firebase.apps.length > 0 ? console.log('✅ Firebase OK') : console.log('❌ Firebase ERROR');

// 2. Listar apps
firebase.apps

// 3. Verificar database reference
console.log(database);
console.log(confirmationsRef);
```

**✓ Esperado en consola:**
```
✅ Firebase OK
[App]
Database {...}
Reference {...}
```

### 2.2 Probar Lectura de Datos

```javascript
// Intentar leer confirmaciones existentes
confirmationsRef.once('value', (snapshot) => {
    console.log('Confirmaciones:', snapshot.val());
    console.log('Total registros:', snapshot.numChildren());
});

// Intentar leer contadores de regalos
giftsCountRef.once('value', (snapshot) => {
    console.log('Contadores:', snapshot.val());
});
```

**✓ Esperado:**
- Se muestran datos (si existen confirmaciones previas)
- O retorna `null` si está vacío

---

## 3. VERIFICAR FLUJO RSVP COMPLETO

### 3.1 Paso 1: Seleccionar Regalos

1. Click en botón "Lista de Regalos"
2. Click en "Transportación" para expandir
3. Click en "Seleccionar" de cualquier regalo
4. ✅ Debe cambiar a "✓ Seleccionado" (verde)
5. Repetir con 2-3 regalos más

**En consola:**
```javascript
console.log('Regalos seleccionados:', selectedGifts);
// Debe mostrar: ["Pañales", "Cochecito"]
```

### 3.2 Paso 2: Ir a Confirmación

1. Click en botón "Confirmar Asistencia"
2. ✅ Debe mostrarse el contador de asistentes
3. ✅ Debe verse lista de regalos seleccionados

### 3.3 Paso 3: Rellenar Formulario

```
Nombre: "Test Usuario"
Teléfono: "999999999" (o tu número real)
Mensaje: "¡Qué emoción!" (opcional)
Regalos: [Ya seleccionados]
```

### 3.4 Paso 4: Hacer Submit

1. Click "Confirmar mi asistencia"
2. **En consola, deberías ver:**

```javascript
// Debug log
console.log('RSVP Data:', confirmationData);
// {nombre: "Test Usuario", telefono: "999999999", asistentes: 1, mensaje: "...", regalos: [...], timestamp: "..."}
```

3. ✅ **Esperado:** Abre WhatsApp (o web.whatsapp.com)

---

## 4. VERIFICAR DEDUPLICACIÓN

### Test 1: Duplicado por localStorage

**Mismo navegador, primer intento:**
1. Llenar formulario con teléfono: "111222333"
2. Submit → Abre WhatsApp ✅

**Segundo intento (mismo navegador, mismo teléfono):**
1. Llenar formulario con teléfono: "111222333" de nuevo
2. Submit → ❌ **NO debe abrir WhatsApp**
3. ✅ Debe mostrarse overlay: "Ya has confirmado..."

**En consola:**
```javascript
// Verificar localStorage
localStorage.getItem('confirmed_111222333');
// Debe mostrar: "2025-11-26T..."
```

### Test 2: Duplicado por Firebase

**Primer navegador/dispositivo:**
- Teléfono: "222333444"
- Submit → WhatsApp abre ✅

**Segundo navegador/incógnito/dispositivo (otro usuario):**
- Teléfono: "222333444" (mismo)
- Submit → ❌ **NO debe abrir WhatsApp**
- ✅ Overlay: "Ya existe una confirmación registrada..."

**En Firebase Console:**
```
Realtime Database → confirmations
Buscar por teléfono "222333444"
Debe existir solo 1 registro
```

---

## 5. VERIFICAR MENSAJE WHATSAPP

### 5.1 Formato Correcto

Cuando se abre WhatsApp, el mensaje debe verse así:

```
*CONFIRMACIÓN BABY SHOWER*
━━━━━━━━━━━━━━━━━━━━━

*Nombre:* Test Usuario
*Teléfono:* 999999999
*Papás:* Kelvin & Cristel
*Fecha:* Viernes, 12 de Diciembre 2025
*Hora:* 7:30 PM
*Lugar:* Urb. La Planicie, Naranjal Mz "G" lote 7, San Martín de Porres

*Regalos que llevaré:*
   1. Pañales
   2. Cochecito

*Mensaje para los papás:*
"¡Qué emoción!"

━━━━━━━━━━━━━━━━━━━━━
¡Confirmo mi asistencia!
¡Nos vemos pronto!
```

### 5.2 Omisiones Correctas

**Si NO selecciona regalos:**
- ❌ NO debe mostrar sección "Regalos que llevaré:"

**Si NO escribe mensaje:**
- ❌ NO debe mostrar sección "Mensaje para los papás:"

---

## 6. VERIFICAR EN FIREBASE CONSOLE

### 6.1 Acceder

1. Ir a https://console.firebase.google.com
2. Seleccionar proyecto: "baby-shower-antonella"
3. Ir a "Realtime Database"

### 6.2 Estructura de Datos

**Debe verse así:**

```
confirmations
├── -N123... (push ID aleatorio)
│   ├── asistentes: 1
│   ├── mensaje: "¡Qué emoción!"
│   ├── nombre: "Test Usuario"
│   ├── regalos: ["Pañales", "Cochecito"]
│   ├── telefono: "999999999"
│   └── timestamp: 1732652345123
└── ...

giftCounts
├── Pañales: 2
├── Cochecito: 1
├── Bodys: 1
└── ...
```

### 6.3 Verificar Índice

1. Click en "confirmations"
2. Pestaña ".indexOn" debe mostrar: `["telefono"]`
3. Si no está: agregar en **Rules** (ver sección 7)

---

## 7. CONFIGURAR REGLAS FIREBASE

### 7.1 Editar Rules

1. Firebase Console → Realtime Database → **Rules** (pestaña)
2. Copiar y pegar:

```json
{
  "rules": {
    "confirmations": {
      ".read": true,
      ".write": true,
      ".indexOn": ["telefono"],
      "$uid": {
        ".validate": "newData.hasChildren(['nombre', 'telefono', 'asistentes', 'timestamp'])",
        "nombre": { ".validate": "newData.isString() && newData.val().length > 0" },
        "telefono": { ".validate": "newData.isString() && newData.val().length > 0" },
        "asistentes": { ".validate": "newData.isNumber() && newData.val() > 0" },
        "timestamp": { ".validate": "newData.isNumber()" }
      }
    },
    "giftCounts": {
      ".read": true,
      ".write": true,
      "$gift": {
        ".validate": "newData.isNumber() && newData.val() >= 0"
      }
    }
  }
}
```

3. Click "Publicar"

✅ Las reglas están en modo desarrollo (cualquiera puede leer/escribir)  
⚠️ **Para producción**, configurar autenticación.

---

## 8. TEST DE RESPONSIVE

### 8.1 Verificar Breakpoints

**Mobile (320px - 767px):**
```javascript
// En DevTools (F12) → Device Toolbar
// Seleccionar "iPhone 12" o "Mobile"
// Verificar: texto legible, botones toqueables
```

**Tablet (768px - 1199px):**
```
Ancho: 800px
Verificar: grid de regalos con 2-3 columnas
```

**Desktop (1200px+):**
```
Ancho: 1400px
Verificar: grid de regalos con 3-4 columnas
```

---

## 9. PERFORMANCE & SEO

### 9.1 Verificar Carga

```javascript
// En consola:
performance.getEntriesByType('navigation')[0].loadEventEnd -
performance.getEntriesByType('navigation')[0].loadEventStart
// Debe ser < 2000ms
```

### 9.2 Lighthouse

1. DevTools → Lighthouse
2. Click "Analyze page load"
3. Verificar:
   - ✅ Performance > 80
   - ✅ Accessibility > 90
   - ✅ Best Practices > 85
   - ✅ SEO > 95

---

## 10. CHECKLIST FINAL ANTES DE LANZAR

### Funcionalidad
- [ ] Seleccionar regalos funciona
- [ ] Contador de regalos sincroniza Firebase
- [ ] Formulario RSVP valida (nombre, teléfono)
- [ ] Abre WhatsApp con mensaje correcto
- [ ] Overlay minimal aparece (3 segundos)
- [ ] Vuelve a sección "Invitación" automáticamente

### Deduplicación
- [ ] localStorage previene reenvío (mismo navegador)
- [ ] Firebase query previene duplicados (base de datos)
- [ ] Overlay "Ya confirmado" aparece en ambos casos

### Firebase
- [ ] Índice `.indexOn: ["telefono"]` está configurado
- [ ] Datos se guardan correctamente en "confirmations"
- [ ] Contadores se actualizan en "giftCounts"
- [ ] No hay errores en Network tab

### Responsive
- [ ] Mobile (320px): OK
- [ ] Tablet (768px): OK
- [ ] Desktop (1200px+): OK

### GitHub Pages
- [ ] Sitio carga en https://...
- [ ] Último commit está en main
- [ ] No hay errores 404 en assets

---

## 11. TROUBLESHOOTING RÁPIDO

| Problema | Solución |
|----------|----------|
| Firebase no conecta | Verificar internet, credenciales en firebase-config.js, reglas |
| Regalos no sincronizan | Comprobar Firebase Console, refrescar página |
| Query "telefono" lenta | Agregar índice .indexOn en Rules |
| WhatsApp no abre | Verificar URL en consola, probar en navegador directo |
| Overlay no se ve | Comprobar z-index en CSS (debe ser 9999+) |
| Botón deshabilitado | Recargar página (localStorage reset) |

---

## 12. PASOS PARA PRODUCCIÓN

### Semana antes del evento
- [x] Testing completo en múltiples dispositivos
- [x] Verificar Firebase está en "modo desarrollo" (o configurar auth)
- [x] Compartir URL con invitados clave

### Día del evento
- [x] Monitorear Firebase Console (confirmaciones en tiempo real)
- [x] Tener backup de lista de invitados
- [x] Verificar WhatsApp momá (Cristel) recibe mensajes

### Post-evento
- [x] Exportar confirmaciones (JSON)
- [x] Agradecer por WhatsApp
- [ ] Opcional: Archivar proyecto o resetear BD

---

## 13. COMANDO ÚTILES PARA TERMINAL

```bash
# Ver estado de cambios
git status

# Ver últimos commits
git log --oneline -10

# Ver cambios pendientes
git diff

# Resetear localStorage (ejecutar en consola browser)
localStorage.clear()

# Exportar confirmaciones (ejecutar en consola)
confirmationsRef.once('value', (snapshot) => {
    const data = snapshot.val();
    console.log(JSON.stringify(data, null, 2));
    // Copiar output → guardarlo en JSON
});
```

---

**🎉 ¡Listo para Testing y Lanzamiento!**

Para preguntas o problemas: revisar ANALISIS_COMPLETO.md

