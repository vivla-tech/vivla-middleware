/**
 * Configuración de CORS para diferentes entornos
 * Basado en el dominio de producción: https://hx.vivla.com/
 */

export const getCorsConfig = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    // Dominios base permitidos
    const baseOrigins = [
        'https://hx.vivla.com',
        'https://www.hx.vivla.com',
        'https://report.vivla.com',
        'https://www.report.vivla.com'
    ];

    // En desarrollo, agregar localhost y variaciones
    if (isDevelopment) {
        baseOrigins.push(
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://localhost:8080',
            'http://localhost:5173', // Vite default
            'http://localhost:4200', // Angular default
            'http://localhost:8000'  // Python/Django default
        );
    }

    // Agregar dominios adicionales desde variables de entorno
    const additionalOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [];

    const allowedOrigins = [...baseOrigins, ...additionalOrigins];

    return {
        origin: function (origin, callback) {
            // Permitir requests sin origin (Postman, curl, etc.)
            if (!origin) return callback(null, true);

            // Verificar si el origin está permitido
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.warn(`🚫 CORS bloqueado para origin: ${origin}`);
                if (isDevelopment) {
                    console.log(`✅ Dominios permitidos: ${allowedOrigins.join(', ')}`);
                }
                callback(new Error(`CORS: Origin ${origin} no está permitido`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma',
            'X-API-Key',
            'X-Requested-With'
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        optionsSuccessStatus: 200,
        maxAge: isDevelopment ? 0 : 86400 // No cache en desarrollo, 24h en producción
    };
};

export default getCorsConfig;
