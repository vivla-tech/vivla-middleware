import cors from 'cors';
import { getCorsConfig } from '../config/cors.js';

/**
 * Configuración CORS personalizada para el middleware
 * Permite acceso desde localhost:3000 y hx.vivla.com
 */
export const corsOptions = getCorsConfig();

/**
 * Middleware para manejar errores de CORS de manera más amigable
 */
export const corsErrorHandler = (err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado por política CORS',
            error: err.message,
            allowedOrigins: [
                'http://localhost:3000',
                'https://hx.vivla.com'
            ],
            currentOrigin: req.get('Origin') || 'No origin header'
        });
    }
    next(err);
};

export default cors;
