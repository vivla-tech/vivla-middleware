import axios from 'axios';


// Función base para realizar peticiones a la API de SheetDB

export async function fetchSheetDbData(endpoint = '') {
    try {
        const response = await axios.get(`https://sheetdb.io/api/v1/u5m680ezu4x1o${endpoint}`);

        // Limpieza de datos - eliminar campo import_range_cell de todos los objetos
        if (Array.isArray(response.data)) {
            return response.data.map(item => {
                const { import_range_cell, ...cleanItem } = item;
                return cleanItem;
            });
        }

        // Si la respuesta no es un array, devolverla sin modificar
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos de SheetDB:', error);
        throw error;
    }
}


export async function getReportData() {
    return fetchSheetDbData();
}


export async function getReportDataByHomeId(homeId) {
    return fetchSheetDbData(`/search?home_id=${homeId}`);
}


export async function getReportDataByUserId(userId) {
    return fetchSheetDbData(`/search?user_id=${userId}`);
}


export async function getBreakdownData() {
    return fetchSheetDbData('?sheet=sync-detail');
}
