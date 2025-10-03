# CORS Fix para report.vivla.com

## ✅ Problema Resuelto

Se ha agregado `https://report.vivla.com` a la lista de dominios permitidos en la configuración de CORS.

## 🔧 Cambios Realizados

### 1. Configuración CORS actualizada
```javascript
// src/config/cors.js
const baseOrigins = [
    'https://hx.vivla.com',
    'https://www.hx.vivla.com',
    'https://report.vivla.com',        // ← NUEVO
    'https://www.report.vivla.com'     // ← NUEVO
];
```

### 2. Dominios permitidos ahora incluyen:
- ✅ `https://hx.vivla.com`
- ✅ `https://www.hx.vivla.com`
- ✅ `https://report.vivla.com` ← **NUEVO**
- ✅ `https://www.report.vivla.com` ← **NUEVO**

## 🚀 Ejemplo de uso desde report.vivla.com

### JavaScript (Fetch)
```javascript
// Desde report.vivla.com
fetch('https://your-api-domain.com/v1/report/2025/list', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key'
    },
    credentials: 'include'
})
.then(response => response.json())
.then(data => {
    if (data.status === 'success') {
        console.log('✅ Reportes obtenidos:', data.data);
    } else {
        console.log('❌ Error:', data.message);
    }
});
```

### Ejemplo con Axios
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://your-api-domain.com',
    withCredentials: true,
    headers: {
        'X-API-Key': 'your-api-key'
    }
});

// Obtener reportes 2025
async function getReports2025() {
    try {
        const response = await api.get('/v1/report/2025/list');
        console.log('✅ Reportes 2025:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    }
}

// Obtener reportes por usuario
async function getReportsByUser(userId) {
    try {
        const response = await api.get(`/v1/report/2025/user/${userId}`);
        console.log('✅ Reportes del usuario:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    }
}
```

## 🧪 Probar la solución

### 1. Script de prueba específico
```bash
# Ejecutar el script de prueba para report.vivla.com
node test-cors-report.js
```

### 2. Prueba manual con curl
```bash
# Test CORS desde report.vivla.com
curl -H "Origin: https://report.vivla.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-API-Key" \
     -X OPTIONS \
     https://your-api-domain.com/v1/report/2025/list

# Test request real
curl -H "Origin: https://report.vivla.com" \
     -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     https://your-api-domain.com/v1/report/2025/list
```

## 📋 Endpoints disponibles para report.vivla.com

### Reportes 2024
- `GET /v1/report/2024/list` - Lista todos los reportes 2024
- `GET /v1/report/2024/user/:userId` - Reportes 2024 por usuario

### Reportes 2025
- `GET /v1/report/2025/list` - Lista todos los reportes 2025
- `GET /v1/report/2025/user/:userId` - Reportes 2025 por usuario

## 🔍 Verificar que funciona

### En el navegador (report.vivla.com)
```javascript
// Abrir consola del navegador en report.vivla.com
fetch('https://your-api-domain.com/v1/report/2025/list', {
    method: 'GET',
    headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Status:', response.status);
    console.log('CORS Headers:', {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
    });
    return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));
```

### Respuesta esperada
```json
{
    "status": "success",
    "data": [
        {
            "user_id": "USER123",
            "home_id": "HOME456",
            "user_name": "Juan Pérez",
            "destination": "Madrid",
            "total_expenses": 1500.00,
            // ... más campos
        }
    ]
}
```

## ⚠️ Si aún hay problemas

### 1. Verificar que el servidor esté actualizado
```bash
# Reiniciar el servidor para aplicar cambios
npm start
```

### 2. Verificar logs del servidor
Deberías ver en los logs:
```
✅ CORS permitido para origin: https://report.vivla.com
```

### 3. Verificar headers en el navegador
En las herramientas de desarrollador:
- Network tab → Request Headers → Origin: `https://report.vivla.com`
- Response Headers → Access-Control-Allow-Origin: `https://report.vivla.com`

## 🎯 Resultado

Ahora `report.vivla.com` puede hacer requests a tu API sin problemas de CORS. Los endpoints de reportes deberían funcionar correctamente desde tu aplicación web.
