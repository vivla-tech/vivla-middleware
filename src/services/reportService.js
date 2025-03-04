import { getReportData, getReportDataByHomeId, getReportDataByUserId } from '../api/sheetDbApi.js';

export async function getReportList() {
    try {
        const reportData = await getReportData();


        return {
            status: 'success',
            data: reportData
        };
    } catch (error) {
        console.error('Error al obtener lista de reportes:', error);
        return {
            status: 'error',
            message: 'No se pudo obtener la lista de reportes',
            error: error.message
        };
    }
}

export async function getReportByHomeId(homeId) {
    try {
        const reportData = await getReportDataByHomeId(homeId);

        // Si no hay datos, retornar un mensaje específico
        if (!reportData || reportData.length === 0) {
            return {
                status: 'error',
                message: `No se encontraron reportes para la casa con ID: ${homeId}`
            };
        }

        return {
            status: 'success',
            data: reportData
        };
    } catch (error) {
        console.error(`Error al obtener reportes para la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener reportes para la casa con ID: ${homeId}`,
            error: error.message
        };
    }
}

export async function getReportByUserId(userId) {
    try {
        const reportData = await getReportDataByUserId(userId);

        // Si no hay datos, retornar un mensaje específico
        if (!reportData || reportData.length === 0) {
            return {
                status: 'error',
                message: `No se encontraron reportes para el usuario con ID: ${userId}`
            };
        }

        return {
            status: 'success',
            data: reportData
        };
    } catch (error) {
        console.error(`Error al obtener reportes para el usuario ${userId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener reportes para el usuario con ID: ${userId}`,
            error: error.message
        };
    }
} 