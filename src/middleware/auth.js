// Lista de API keys válidas (en producción deberían estar en una base de datos o variables de entorno)
const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['clave-desarrollo-123'];

// Middleware de autenticación simple
export function apiKeyAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            error: 'Se requiere autenticación. Agrega el header "Authorization: Bearer [tu-clave-aquí]"'
        });
    }

    // Comprobar si comienza con "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Formato de autenticación inválido. Usa: "Authorization: Bearer [tu-clave-aquí]"'
        });
    }

    // Extraer el token (quitar "Bearer " del inicio)
    const apiKey = authHeader.substring(7); // "Bearer " tiene 7 caracteres

    if (!apiKey || !API_KEYS.includes(apiKey)) {
        return res.status(403).json({
            error: 'API key inválida.'
        });
    }

    next();
}