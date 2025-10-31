# Lista Completa de Endpoints - API Middleware Zendesk

## 📍 Base URL
```
http://localhost:3000 (desarrollo)
https://your-production-url.com (producción)
```

## 🔐 Autenticación
Todos los endpoints bajo `/v1/*` requieren autenticación mediante API Key:
```
Header: X-API-Key: your-api-key
```

---

## 📋 Índice de Endpoints

1. [Tickets](#tickets) - 7 endpoints
2. [Reviews](#reviews) - 1 endpoint
3. [Reportes](#reportes) - 4 endpoints
4. [Usuarios](#usuarios) - 1 endpoint
5. [Casas/Hogares](#casashogares) - 4 endpoints
6. [Checkpoints](#checkpoints) - 1 endpoint
7. [Estancias](#estancias) - 2 endpoints
8. [Propuestas](#propuestas) - 2 endpoints
9. [Documentación](#documentación) - 1 endpoint

---

## 🎫 Tickets

### 1. Obtener lista de tickets
```http
GET /v1/tickets
```
**Query Parameters:**
- `page` (integer, default: 1) - Número de página
- `per_page` (integer, default: 25) - Elementos por página
- `sort_by` (string, default: created_at) - Campo de ordenamiento
- `sort_order` (string: asc|desc, default: desc) - Orden
- `home` (string, opcional) - Nombre de casa para filtrar
- `from` (date, opcional) - Fecha desde (YYYY-MM-DD)
- `status` (string, opcional) - Estado del ticket

**Ejemplo:**
```bash
GET /v1/tickets?page=1&per_page=25&home=Casa%20Ejemplo&from=2024-01-01
```

---

### 2. Obtener estadísticas de tickets
```http
GET /v1/tickets/stats
```

---

### 3. Obtener estadísticas simples de tickets
```http
GET /v1/tickets/simple-stats
```
**Query Parameters:**
- `home` (string, opcional) - Nombre de casa para filtrar
- `from` (date, opcional) - Fecha desde (YYYY-MM-DD)
- `to` (date, opcional) - Fecha hasta (YYYY-MM-DD)

**Ejemplo:**
```bash
GET /v1/tickets/simple-stats?home=Casa%20Ejemplo&from=2024-01-01&to=2024-12-31
```

---

### 4. Obtener tickets de propuestas de mejora
```http
GET /v1/tickets/improvement-proposals
```
**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 25)
- `sort_by` (string, default: created_at)
- `sort_order` (string: asc|desc, default: desc)
- `home` (string, opcional)
- `from` (date, opcional)

---

### 5. Obtener tickets de reparaciones
```http
GET /v1/tickets/repairs
```
**Query Parameters:**
- `page` (integer, default: 1)
- `per_page` (integer, default: 25)
- `sort_by` (string, default: created_at)
- `sort_order` (string: asc|desc, default: desc)
- `home` (string, opcional)
- `from` (date, opcional)

---

### 6. Obtener estadísticas de reparaciones por casa
```http
GET /v1/tickets/home-repair-stats/:homeName
```
**Path Parameters:**
- `homeName` (string, requerido) - Nombre de la casa

**Ejemplo:**
```bash
GET /v1/tickets/home-repair-stats/Casa%20Ejemplo
```

---

### 7. Obtener ticket por ID
```http
GET /v1/tickets/:id
```
**Path Parameters:**
- `id` (string, requerido) - ID del ticket

---

## ⭐ Reviews

### 1. Obtener reviews
```http
GET /v1/reviews
```
**Query Parameters:**
- `type` (string: home|stay, opcional) - Tipo de review
- `houseName` (string, opcional) - Nombre de casa para filtrar

**Ejemplo:**
```bash
GET /v1/reviews?type=home&houseName=Casa%20Ejemplo
```

---

## 📊 Reportes

### 1. Obtener lista de reportes 2024
```http
GET /v1/report/2024/list
```

---

### 2. Obtener reportes 2024 por usuario
```http
GET /v1/report/2024/user/:userId
```
**Path Parameters:**
- `userId` (string, requerido) - ID del usuario

**Ejemplo:**
```bash
GET /v1/report/2024/user/USER123
```

---

### 3. Obtener lista de reportes 2025
```http
GET /v1/report/2025/list
```

---

### 4. Obtener reportes 2025 por usuario
```http
GET /v1/report/2025/user/:userId
```
**Path Parameters:**
- `userId` (string, requerido) - ID del usuario

---

## 👥 Usuarios

### 1. Obtener deals de usuario por email
```http
GET /v1/users/deals/:email
```
**Path Parameters:**
- `email` (string, requerido) - Email del usuario

**Ejemplo:**
```bash
GET /v1/users/deals/usuario@ejemplo.com
```

---

## 🏠 Casas/Hogares

### 1. Obtener listado de casas
```http
GET /v1/homes/list
```
**Response:** Lista de casas con campos `hid`, `name`, `is_test_home`, `zendesk_name`

---

### 2. Obtener listado de casas con datos del dashboard
```http
GET /v1/homes/list-with-dashboard
```
**Response:** Lista de casas combinando Firebase y Dashboard NPS

---

### 3. Obtener casa por HID
```http
GET /v1/homes/:hid
```
**Path Parameters:**
- `hid` (string, requerido) - ID único de la casa

**Ejemplo:**
```bash
GET /v1/homes/39121124
```

---

### 4. Obtener imágenes de habitaciones de una casa
```http
GET /v1/homes/:hid/room-images
```
**Path Parameters:**
- `hid` (string, requerido) - ID único de la casa

**Ejemplo:**
```bash
GET /v1/homes/39121124/room-images
```

---

## ✅ Checkpoints

### 1. Obtener checkpoints de casas
```http
GET /v1/checkpoints
```
**Query Parameters:**
- `homeName` (string, opcional) - Nombre de casa para filtrar

**Ejemplo:**
```bash
GET /v1/checkpoints?homeName=Saona
```

**Response:** CheckPoints de propietarios y Home Excellence con estadísticas agregadas

---

## 🏨 Estancias

### 1. Obtener estadísticas de estancias de una casa
```http
GET /v1/stays/:hid/stats
```
**Path Parameters:**
- `hid` (string, requerido) - ID único de la casa

**Ejemplo:**
```bash
GET /v1/stays/39121124/stats
```

---

### 2. Obtener fechas de inspección de una casa
```http
GET /v1/stays/:hid/inspections
```
**Path Parameters:**
- `hid` (string, requerido) - ID único de la casa

**Ejemplo:**
```bash
GET /v1/stays/39121124/inspections
```

---

## 💡 Propuestas

### 1. Crear propuesta de mejora
```http
POST /api/proposals
```
**Content-Type:** `multipart/form-data`

**Body Parameters:**
- `proposal` (string, requerido) - Descripción (mínimo 10 caracteres)
- `investment` (string, requerido) - Rango: "0-100", "100-500", "500-1000", "1000-5000", "5000+"
- `hid` (string, requerido) - ID del hogar
- `files` (File[], opcional) - Máximo 5 archivos (jpg, png, pdf, doc, docx)

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/proposals \
  -F "proposal=La piscina debería tener más iluminación" \
  -F "investment=100-500" \
  -F "hid=home_12345" \
  -F "files=@imagen.jpg"
```

---

### 2. Obtener todas las propuestas
```http
GET /api/proposals
```

---

## 📖 Documentación

### 1. Swagger API Docs
```http
GET /api-docs
```
**Descripción:** Documentación interactiva de la API con Swagger UI

---

## 📝 Resumen por Categoría

| Categoría | Endpoints | Autenticación |
|-----------|-----------|---------------|
| Tickets | 7 | ✅ API Key |
| Reviews | 1 | ✅ API Key |
| Reportes | 4 | ✅ API Key |
| Usuarios | 1 | ✅ API Key |
| Casas/Hogares | 4 | ✅ API Key |
| Checkpoints | 1 | ✅ API Key |
| Estancias | 2 | ✅ API Key |
| Propuestas | 2 | ❌ Sin auth |
| Documentación | 1 | ❌ Pública |
| **TOTAL** | **23** | |

---

## 🔧 Ejemplos de Uso

### Con curl
```bash
# Obtener tickets con filtros
curl -H "X-API-Key: your-api-key" \
     "http://localhost:3000/v1/tickets?home=Casa%20Ejemplo&from=2024-01-01"

# Obtener casa específica
curl -H "X-API-Key: your-api-key" \
     "http://localhost:3000/v1/homes/39121124"

# Crear propuesta
curl -X POST http://localhost:3000/api/proposals \
  -F "proposal=Mejorar iluminación" \
  -F "investment=100-500" \
  -F "hid=home_12345"
```

### Con JavaScript (fetch)
```javascript
// Obtener tickets
const response = await fetch('/v1/tickets?page=1&per_page=25', {
    headers: {
        'X-API-Key': 'your-api-key'
    }
});
const data = await response.json();

// Obtener casa
const house = await fetch('/v1/homes/39121124', {
    headers: {
        'X-API-Key': 'your-api-key'
    }
});
const houseData = await house.json();

// Crear propuesta
const formData = new FormData();
formData.append('proposal', 'Mejorar iluminación');
formData.append('investment', '100-500');
formData.append('hid', 'home_12345');

const proposal = await fetch('/api/proposals', {
    method: 'POST',
    body: formData
});
const proposalData = await proposal.json();
```

---

## 🌐 CORS

Dominios permitidos:
- `http://localhost:3000`
- `https://hx.vivla.com`
- `https://www.hx.vivla.com`
- `https://report.vivla.com`
- `https://www.report.vivla.com`

---

## 📚 Documentación Adicional

- **Swagger UI:** `http://localhost:3000/api-docs`
- **CORS Config:** Ver `CORS_CONFIG.md`
- **Propuestas API:** Ver `PROPOSALS_API.md`
- **Ejemplos POST:** Ver `EJEMPLOS_POST.md`

---

## 🔍 Notas

- Todos los endpoints bajo `/v1/*` requieren autenticación con API Key
- Los endpoints bajo `/api/*` no requieren autenticación
- Las respuestas siguen el formato estándar:
  ```json
  {
    "status": "success" | "error",
    "message": "Mensaje descriptivo",
    "data": { /* datos */ }
  }
  ```
- Los errores incluyen códigos HTTP estándar: 200, 400, 404, 500, etc.


