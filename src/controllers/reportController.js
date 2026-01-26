import { getReportList, getReportByHomeId, getReportByUserId, getReport2025, getReport2025ByUserId, getReport2026, getReport2026ByUserAndHome } from '../services/reportService.js';

export async function getReportListController(req, res) {
    try {
        const result = await getReportList();

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReportByHomeIdController(req, res) {
    try {
        const { homeId } = req.params;

        if (!homeId) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el ID de la casa'
            });
        }

        const result = await getReportByHomeId(homeId);

        if (result.status === 'error') {
            // Si no se encontraron datos, devolver 404
            if (result.message.includes('No se encontraron')) {
                return res.status(404).json(result);
            }
            // Otros errores son 500
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes por casa:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReportByUserIdController(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el ID del usuario'
            });
        }

        const result = await getReportByUserId(userId);

        if (result.status === 'error') {
            // Si no se encontraron datos, devolver 404
            if (result.message.includes('No se encontraron')) {
                return res.status(404).json(result);
            }
            // Otros errores son 500
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes por usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReport2025Controller(req, res) {
    try {
        const result = await getReport2025();

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes 2025:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReportData2025ByUserIdController(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el ID del usuario'
            });
        }

        const result = await getReport2025ByUserId(userId);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes 2025 por usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReport2026Controller(req, res) {
    try {
        const result = await getReport2026();

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes 2026:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getReportData2026ByUserIdController(req, res) {
    try {
        const { userId: encodedToken } = req.params;

        if (!encodedToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el token de identificación'
            });
        }

        // Decodificar el token base64
        let decodedData;
        try {
            decodedData = Buffer.from(encodedToken, 'base64').toString('utf-8');
        } catch (decodeError) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido: no se pudo decodificar el base64',
                error: decodeError.message
            });
        }

        // Separar userId y homeId del formato "userId;homeId"
        const parts = decodedData.split(';');
        if (parts.length !== 2) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido: formato incorrecto. Se espera "userId;homeId"',
                decodedData: decodedData
            });
        }

        const [userEmail, homeName] = parts;

        if (!userEmail || !homeName) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido: userId y homeId son requeridos'
            });
        }

        const result = await getReport2026ByUserAndHome(userEmail, homeName);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de reportes 2026 por usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}
