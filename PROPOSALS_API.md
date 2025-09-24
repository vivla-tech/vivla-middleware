# Endpoint de Propuestas de Mejora de Hogares

## Descripción
Este endpoint permite crear propuestas de mejora para hogares, incluyendo la subida de archivos adjuntos a Firebase Storage.

## Endpoint
- **URL**: `POST /api/proposals`
- **Método**: POST
- **Content-Type**: `multipart/form-data`

## Parámetros

### Campos requeridos:
- `proposal` (string): Descripción de la propuesta (mínimo 10 caracteres)
- `investment` (string): Rango de inversión estimada
  - Valores válidos: `"0-100"`, `"100-500"`, `"500-1000"`, `"1000-5000"`, `"5000+"`

### Campos opcionales:
- `files` (File[]): Archivos adjuntos (máximo 5 archivos)
  - Tipos permitidos: jpg, png, pdf, doc, docx
  - Tamaño máximo: 10MB por archivo
  - Tamaño total máximo: 50MB

## Ejemplo de uso con curl:

```bash
curl -X POST http://localhost:3000/api/proposals \
  -F "proposal=La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes" \
  -F "investment=100-500" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/document.pdf"
```

## Ejemplo de uso con JavaScript (fetch):

```javascript
const formData = new FormData();
formData.append('proposal', 'La piscina debería tener más iluminación nocturna');
formData.append('investment', '100-500');

// Agregar archivos
const fileInput = document.getElementById('fileInput');
for (let file of fileInput.files) {
    formData.append('files', file);
}

fetch('/api/proposals', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Propuesta creada:', data.proposalId);
        console.log('URLs de archivos:', data.fileUrls);
    } else {
        console.error('Error:', data.message);
    }
});
```

## Respuestas

### Éxito (201):
```json
{
  "success": true,
  "proposalId": "123e4567-e89b-12d3-a456-426614174000",
  "fileUrls": [
    "https://firebasestorage.googleapis.com/v0/b/...",
    "https://firebasestorage.googleapis.com/v0/b/..."
  ],
  "message": "Propuesta creada exitosamente"
}
```

### Error de validación (400):
```json
{
  "success": false,
  "message": "Datos inválidos",
  "errors": [
    "La propuesta debe tener al menos 10 caracteres",
    "La inversión debe ser uno de los valores válidos"
  ]
}
```

### Archivo demasiado grande (413):
```json
{
  "success": false,
  "message": "Archivo demasiado grande. Máximo 10MB por archivo"
}
```

### Error interno (500):
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Estructura de datos en Firestore

Las propuestas se guardan en la colección `hx-proposals` con la siguiente estructura:

```json
{
  "proposal": "La piscina debería tener más iluminación nocturna",
  "investment": "100-500",
  "files": [
    {
      "fileName": "uuid-generated-name.jpg",
      "originalName": "image1.jpg",
      "url": "https://firebasestorage.googleapis.com/...",
      "size": 1024000,
      "mimeType": "image/jpeg"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "pending",
  "proposalId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Variables de entorno requeridas

Asegúrate de tener configuradas las siguientes variables de entorno:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Endpoint adicional

También se incluye un endpoint para obtener todas las propuestas:

- **URL**: `GET /api/proposals`
- **Método**: GET
- **Respuesta**: Lista de todas las propuestas ordenadas por fecha de creación (más recientes primero)
