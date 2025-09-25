# Ejemplos de Llamadas POST - Endpoint de Propuestas

## 1. Ejemplo con curl (Terminal)

### Propuesta simple sin archivos
```bash
curl -X POST http://localhost:3000/api/proposals \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "proposal": "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes durante las noches de verano",
    "investment": "100-500",
    "hid": "home_12345"
  }'
```

### Propuesta con archivos (multipart/form-data)
```bash
curl -X POST http://localhost:3000/api/proposals \
  -H "Origin: http://localhost:3000" \
  -F "proposal=La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes" \
  -F "investment=100-500" \
  -F "hid=home_12345" \
  -F "files=@/ruta/a/imagen1.jpg" \
  -F "files=@/ruta/a/documento.pdf"
```

## 2. Ejemplo con JavaScript (Frontend)

### Usando fetch con JSON
```javascript
async function crearPropuesta() {
    try {
        const response = await fetch('http://localhost:3000/api/proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            },
            credentials: 'include',
            body: JSON.stringify({
                proposal: "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes durante las noches de verano",
                investment: "100-500",
                hid: "home_12345"
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Propuesta creada:', data.proposalId);
            console.log('📁 URLs de archivos:', data.fileUrls);
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}
```

### Usando fetch con FormData (archivos)
```javascript
async function crearPropuestaConArchivos() {
    try {
        const formData = new FormData();
        formData.append('proposal', 'La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes');
        formData.append('investment', '100-500');
        formData.append('hid', 'home_12345');

        // Agregar archivos desde un input file
        const fileInput = document.getElementById('fileInput');
        for (let file of fileInput.files) {
            formData.append('files', file);
        }

        const response = await fetch('http://localhost:3000/api/proposals', {
            method: 'POST',
            headers: {
                'Origin': 'http://localhost:3000'
            },
            credentials: 'include',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Propuesta creada:', data.proposalId);
            console.log('📁 URLs de archivos:', data.fileUrls);
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}
```

## 3. Ejemplo con HTML Form

```html
<!DOCTYPE html>
<html>
<head>
    <title>Crear Propuesta</title>
</head>
<body>
    <form id="proposalForm" enctype="multipart/form-data">
        <div>
            <label for="proposal">Propuesta:</label>
            <textarea id="proposal" name="proposal" required minlength="10" 
                placeholder="Describe tu propuesta de mejora (mínimo 10 caracteres)"></textarea>
        </div>
        
        <div>
            <label for="investment">Inversión estimada:</label>
            <select id="investment" name="investment" required>
                <option value="">Selecciona un rango</option>
                <option value="0-100">$0 - $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
            </select>
        </div>
        
        <div>
            <label for="hid">ID del Hogar:</label>
            <input type="text" id="hid" name="hid" required 
                placeholder="Ej: home_12345">
        </div>
        
        <div>
            <label for="files">Archivos adjuntos (máximo 5):</label>
            <input type="file" id="files" name="files" multiple 
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx">
        </div>
        
        <button type="submit">Crear Propuesta</button>
    </form>

    <script>
        document.getElementById('proposalForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('http://localhost:3000/api/proposals', {
                    method: 'POST',
                    headers: {
                        'Origin': 'http://localhost:3000'
                    },
                    credentials: 'include',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(`✅ Propuesta creada exitosamente!\nID: ${data.proposalId}`);
                    e.target.reset();
                } else {
                    alert(`❌ Error: ${data.message}`);
                }
            } catch (error) {
                alert(`❌ Error de red: ${error.message}`);
            }
        });
    </script>
</body>
</html>
```

## 4. Ejemplo con Postman

### Configuración de Headers:
- `Origin`: `http://localhost:3000`
- `Content-Type`: `application/json` (para JSON) o dejar vacío (para FormData)

### Body (JSON):
```json
{
    "proposal": "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes durante las noches de verano",
    "investment": "100-500",
    "hid": "home_12345"
}
```

### Body (Form-data):
- `proposal`: `La piscina debería tener más iluminación nocturna`
- `investment`: `100-500`
- `hid`: `home_12345`
- `files`: [Seleccionar archivos]

## 5. Ejemplo con Axios

```javascript
import axios from 'axios';

// Configurar axios con base URL
const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Origin': 'http://localhost:3000'
    }
});

// Propuesta simple
async function crearPropuestaSimple() {
    try {
        const response = await api.post('/api/proposals', {
            proposal: "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes",
            investment: "100-500",
            hid: "home_12345"
        });
        
        console.log('✅ Propuesta creada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    }
}

// Propuesta con archivos
async function crearPropuestaConArchivos(archivos) {
    try {
        const formData = new FormData();
        formData.append('proposal', 'La piscina debería tener más iluminación nocturna');
        formData.append('investment', '100-500');
        formData.append('hid', 'home_12345');
        
        archivos.forEach(archivo => {
            formData.append('files', archivo);
        });

        const response = await api.post('/api/proposals', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('✅ Propuesta creada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    }
}
```

## 6. Ejemplo con React Hook

```javascript
import { useState } from 'react';

function useProposal() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const crearPropuesta = async (proposalData, archivos = []) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('proposal', proposalData.proposal);
            formData.append('investment', proposalData.investment);
            formData.append('hid', proposalData.hid);

            archivos.forEach(archivo => {
                formData.append('files', archivo);
            });

            const response = await fetch('http://localhost:3000/api/proposals', {
                method: 'POST',
                headers: {
                    'Origin': 'http://localhost:3000'
                },
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { crearPropuesta, loading, error };
}

// Uso en componente
function ProposalForm() {
    const { crearPropuesta, loading, error } = useProposal();
    const [proposal, setProposal] = useState('');
    const [investment, setInvestment] = useState('');
    const [hid, setHid] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await crearPropuesta({ proposal, investment, hid });
            alert(`✅ Propuesta creada: ${result.proposalId}`);
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea 
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Describe tu propuesta..."
                required
            />
            
            <select 
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                required
            >
                <option value="">Selecciona inversión</option>
                <option value="0-100">$0 - $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000+">$5,000+</option>
            </select>
            
            <input 
                type="text"
                value={hid}
                onChange={(e) => setHid(e.target.value)}
                placeholder="ID del hogar (ej: home_12345)"
                required
            />
            
            <button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Propuesta'}
            </button>
            
            {error && <div style={{color: 'red'}}>{error}</div>}
        </form>
    );
}
```

## Respuestas Esperadas

### ✅ Éxito (201):
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

### ❌ Error de validación (400):
```json
{
    "success": false,
    "message": "Datos inválidos",
    "errors": [
        "La propuesta debe tener al menos 10 caracteres"
    ]
}
```

### ❌ Error CORS (403):
```json
{
    "success": false,
    "message": "Acceso denegado por política CORS",
    "error": "CORS: Origin https://unauthorized-domain.com no está permitido",
    "allowedOrigins": [
        "http://localhost:3000",
        "https://hx.vivla.com"
    ],
    "currentOrigin": "https://unauthorized-domain.com"
}
```

## Estructura de datos en Firestore

Las propuestas se guardan en la colección `hx-proposals` con la siguiente estructura:

```json
{
  "proposal": "La piscina debería tener más iluminación nocturna",
  "investment": "100-500",
  "hid": "home_12345",
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
