# Ejemplo Rápido - Llamada POST al Endpoint de Propuestas

## 🚀 Ejemplo más simple (curl)

```bash
# Propuesta básica sin archivos
curl -X POST http://localhost:3000/api/proposals \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "proposal": "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes",
    "investment": "100-500"
  }'
```

## 🌐 Ejemplo desde el navegador (JavaScript)

Abre la consola del navegador en `http://localhost:3000` o `https://hx.vivla.com` y ejecuta:

```javascript
fetch('/api/proposals', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        proposal: "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes",
        investment: "100-500"
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

## 🧪 Ejecutar script de prueba

```bash
# Asegúrate de que el servidor esté corriendo
npm start

# En otra terminal, ejecuta las pruebas
node test-proposal.js
```

## 📋 Respuesta esperada

```json
{
    "success": true,
    "proposalId": "123e4567-e89b-12d3-a456-426614174000",
    "fileUrls": [],
    "message": "Propuesta creada exitosamente"
}
```

## ❌ Errores comunes

### CORS Error
```json
{
    "success": false,
    "message": "Acceso denegado por política CORS"
}
```
**Solución**: Asegúrate de hacer la petición desde `localhost:3000` o `hx.vivla.com`

### Validación Error
```json
{
    "success": false,
    "message": "Datos inválidos",
    "errors": ["La propuesta debe tener al menos 10 caracteres"]
}
```
**Solución**: Usa una propuesta de al menos 10 caracteres y un investment válido

### Archivo Error
```json
{
    "success": false,
    "message": "Archivo demasiado grande. Máximo 10MB por archivo"
}
```
**Solución**: Usa archivos más pequeños o menos archivos (máximo 5)
