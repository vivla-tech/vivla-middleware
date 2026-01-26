/**
 * Servicio para obtener información de la casa desde Firestore
 * Este servicio se conectará a Firestore para obtener datos de la casa
 */

import { getHouseByHid, getHouseIdByName } from '../firebase/houseService.js';

/**
 * Obtiene información básica de la casa por homeId
 * @param {string} homeName - ID de la casa
 * @returns {Promise<Object>} Objeto con status y data de la casa
 */
export async function getHouseInfo(homeName) {
    try {
        const houseId = await getHouseIdByName(homeName);
        // Llamada real a Firestore
        const houseResult = await getHouseByHid(houseId);

        // Si hay error, devolver error
        if (houseResult.status === 'error') {
            console.error(`Error al obtener casa ${homeName}:`, houseResult.message);
            return {
                status: 'error',
                message: houseResult.message || `No se pudo obtener la información de la casa`,
                error: houseResult.error,
                data: null
            };
        }

        const houseData = houseResult.data;

        // Mapear datos reales de Firestore al formato esperado
        // Usar valores por defecto si algún campo no existe
        const mappedHouseData = {
            home_id: houseData.hid,
            home_name: houseData.name || 'Casa sin nombre',
            destination: houseData.location || '',
            home_main_img: houseData.main_image || houseData.image || '',
            home_repairs_img: houseData.repairs_image || houseData.repairs_img || '',
            purchase_price: houseData.purchase_price || houseData.purchasePrice || 0,
            estimated_value: houseData.estimated_value || houseData.estimatedValue || 0,
            revaluation: houseData.revaluation || houseData.revaluation_percentage || 0
        };

        // Calcular revaluación si tenemos purchase_price y estimated_value
        if (mappedHouseData.purchase_price > 0 && mappedHouseData.estimated_value > 0) {
            mappedHouseData.revaluation = ((mappedHouseData.estimated_value - mappedHouseData.purchase_price) / mappedHouseData.purchase_price) * 100;
        }

        return {
            status: 'success',
            data: mappedHouseData
        };
    } catch (error) {
        console.error(`Error al obtener información de la casa ${homeName}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener la información de la casa`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene estadísticas de la casa (ocupación, estancias, etc.)
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte (ej: '2025')
 * @returns {Promise<Object>} Objeto con estadísticas de la casa
 */
export async function getHouseStats(homeId, year) {
    try {
        // TODO: Implementar llamada a Firestore para obtener estadísticas
        
        // Mock data
        const mockStats = {
            total_days_enjoyed: 451,
            total_market_price: 12500.00,
            market_price_per_night: 277.78,
            exchanges_number: 3,
            market_exchange_price: 38500.00,
            weeks_listed_for_rent: 8,
            rental_income: 15000.00,
            price_increase_percentage_sales: 5.2,
            national_cpi_percentage: 3.1,
            total_occupancy: 78.5,
            total_stays_number: 12,
            expected_expenses: 18501.00
        };

        return {
            status: 'success',
            data: mockStats
        };
    } catch (error) {
        console.error(`Error al obtener estadísticas de la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener las estadísticas de la casa`,
            error: error.message,
            data: null
        };
    }
}



