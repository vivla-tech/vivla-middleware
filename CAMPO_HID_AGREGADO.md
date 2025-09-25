# Ejemplo Rápido - Campo HID Agregado

## ✅ Cambios Implementados

Se ha agregado el campo `hid` (Home ID) al endpoint de propuestas. Ahora es un campo **requerido** junto con `proposal`, `investment` y `files`.

## 🚀 Ejemplo más simple (curl)

```bash
curl -X POST http://localhost:3000/api/proposals \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "proposal": "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes",
    "investment": "100-500",
    "hid": "home_12345"
  }'
```

## 🌐 Ejemplo desde JavaScript

```javascript
fetch('/api/proposals', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        proposal: "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes",
        investment: "100-500",
        hid: "home_12345"
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Propuesta creada:', data.proposalId);
    } else {
        console.log('❌ Error:', data.message);
    }
});
```

## 📁 Ejemplo con archivos (FormData)

```javascript
const formData = new FormData();
formData.append('proposal', 'Instalación de sistema de riego automático en el jardín');
formData.append('investment', '500-1000');
formData.append('hid', 'home_12345');

// Agregar archivo desde input
const fileInput = document.getElementById('fileInput');
if (fileInput.files[0]) {
    formData.append('files', fileInput.files[0]);
}

fetch('/api/proposals', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Propuesta creada:', data.proposalId);
        console.log('📁 Archivos subidos:', data.fileUrls);
    } else {
        console.log('❌ Error:', data.message);
    }
});
```

## 📋 Estructura de datos en Firestore

Ahora las propuestas se guardan con el campo `hid`:

```json
{
  "proposal": "La piscina debería tener más iluminación nocturna",
  "investment": "100-500",
  "hid": "home_12345",
  "files": [...],
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "pending",
  "proposalId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## ❌ Nuevos errores de validación

Si no envías el campo `hid`, recibirás:

```json
{
    "success": false,
    "message": "Los campos proposal, investment e hid son requeridos"
}
```

O si el `hid` está vacío:

```json
{
    "success": false,
    "message": "Datos inválidos",
    "errors": ["El ID del hogar (hid) es requerido"]
}
```

## 🧪 Probar los cambios

```bash
# Asegúrate de que el servidor esté corriendo
npm start

# En otra terminal, ejecuta las pruebas
node test-proposal.js
```

El script de prueba ahora incluye casos de prueba para el campo `hid` y verificará que las validaciones funcionen correctamente.
