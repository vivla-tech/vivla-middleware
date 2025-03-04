import axios from 'axios';


// Función base para realizar peticiones a la API de SheetDB

export async function fetchSheetDbData(endpoint = '') {
    try {
        const response = await axios.get(`https://sheetdb.io/api/v1/u5m680ezu4x1o${endpoint}`);
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