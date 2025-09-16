import axios from 'axios';

const DASHBOARD_API_URL = 'https://dashboard.vivla.com/api/properties';
const DASHBOARD_AUTH = 'Basic ZGV2ZWxvcGVyOmQxZzEwYWly';

/**
 * Obtiene los datos de propiedades del dashboard
 * @returns {Promise<Object>} Respuesta con los datos de propiedades
 */
export async function getDashboardProperties() {
    try {
        console.log('Obteniendo datos del dashboard...');
        
        const response = await axios.get(DASHBOARD_API_URL, {
            headers: {
                'Authorization': DASHBOARD_AUTH,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Datos del dashboard obtenidos: ${response.data.data?.length || 0} propiedades`);
        
        return {
            status: 'success',
            data: response.data.data || [],
            count: response.data.data?.length || 0
        };
    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error.response?.status, error.response?.data || error.message);
        return {
            status: 'error',
            message: 'Error al obtener datos del dashboard',
            error: error.message,
            data: [],
            count: 0
        };
    }
}

/**
 * Combina los datos de Firebase houses con los datos del dashboard
 * @param {Array} firebaseHouses - Array de casas de Firebase
 * @param {Array} dashboardProperties - Array de propiedades del dashboard
 * @returns {Array} Array combinado de casas
 */
export function mergeHouseData(firebaseHouses, dashboardProperties) {
    // Crear un mapa de propiedades del dashboard por foreignId
    const dashboardMap = new Map();
    dashboardProperties.forEach(property => {
        dashboardMap.set(property.foreignId, property);
    });

    // Combinar los datos
    const mergedHouses = firebaseHouses.map(firebaseHouse => {
        const dashboardProperty = dashboardMap.get(firebaseHouse.hid);
        
        if (dashboardProperty) {
            // Si hay match, combinar ambos datos
            return {
                ...firebaseHouse,
                dashboard_name: dashboardProperty.name,
                dashboard_id: dashboardProperty._id,
                dashboard_foreignId: dashboardProperty.foreignId,
                dashboard_image: dashboardProperty.image,
                dashboard_area: dashboardProperty.area,
                dashboard_createdAt: dashboardProperty.createdAt,
                dashboard_updatedAt: dashboardProperty.updatedAt
            };
        } else {
            // Si no hay match, devolver solo datos de Firebase
            return {
                ...firebaseHouse,
                dashboard_name: null,
                dashboard_id: null,
                dashboard_foreignId: null,
                dashboard_image: null,
                dashboard_area: null,
                dashboard_createdAt: null,
                dashboard_updatedAt: null
            };
        }
    });

    // Añadir propiedades del dashboard que no tienen match en Firebase
    const firebaseHids = new Set(firebaseHouses.map(house => house.hid));
    const unmatchedDashboardProperties = dashboardProperties.filter(property => 
        !firebaseHids.has(property.foreignId)
    );

    // Añadir las propiedades no matcheadas
    unmatchedDashboardProperties.forEach(property => {
        mergedHouses.push({
            hid: property.foreignId,
            name: null,
            is_test_home: false,
            zendesk_name: null,
            dashboard_name: property.name,
            dashboard_id: property._id,
            dashboard_foreignId: property.foreignId,
            dashboard_image: property.image,
            dashboard_area: property.area,
            dashboard_createdAt: property.createdAt,
            dashboard_updatedAt: property.updatedAt
        });
    });

    return mergedHouses;
}

