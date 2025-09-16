import { getAllHouses, getAllHousesWithZendeskNames } from '../services/firebase/houseService.js';
import { getDashboardProperties, mergeHouseData } from '../services/npsService.js';

/**
 * Obtiene el listado de todas las casas con solo los campos hid y name
 */
export async function getHousesListController(req, res) {
    try {
        console.log('Obteniendo listado de casas...');

        // Obtener todas las casas del servicio
        const housesResult = await getAllHouses();

        if (housesResult.status === 'error') {
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener el listado de casas',
                error: housesResult.message
            });
        }

        // Si no hay casas, devolver respuesta vacía
        if (!housesResult.data || housesResult.data.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No se encontraron casas',
                data: [],
                count: 0
            });
        }

        console.log(`Procesando ${housesResult.data.length} casas...`);

        // Filtrar solo los campos hid, name e is_test_home de cada casa
        const filteredHouses = housesResult.data.map(house => ({
            hid: house.hid,
            name: house.name,
            is_test_home: house.is_test_home || false
        }));

        console.log(`Listado de casas procesado exitosamente`);

        // Devolver respuesta con casas filtradas
        return res.status(200).json({
            status: 'success',
            message: 'Listado de casas obtenido exitosamente',
            data: filteredHouses,
            count: filteredHouses.length
        });

    } catch (error) {
        console.error('Error en getHousesListController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener el listado de casas',
            error: error.message
        });
    }
}

/**
 * Obtiene el listado de todas las casas combinando datos de Firebase y Dashboard
 */
export async function getHousesWithDashboardController(req, res) {
    try {
        console.log('Obteniendo listado de casas con datos del dashboard...');

        // Obtener datos de Firebase y Dashboard en paralelo
        const [firebaseResult, dashboardResult] = await Promise.all([
            getAllHousesWithZendeskNames(),
            getDashboardProperties()
        ]);

        // Verificar errores en Firebase
        if (firebaseResult.status === 'error') {
            console.error('Error al obtener datos de Firebase:', firebaseResult.message);
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener datos de Firebase',
                error: firebaseResult.message
            });
        }

        // Verificar errores en Dashboard (pero no fallar si hay error, solo logear)
        if (dashboardResult.status === 'error') {
            console.warn('Error al obtener datos del dashboard:', dashboardResult.message);
        }

        const firebaseHouses = firebaseResult.data || [];
        const dashboardProperties = dashboardResult.data || [];

        console.log(`Procesando ${firebaseHouses.length} casas de Firebase y ${dashboardProperties.length} propiedades del dashboard...`);

        // Combinar los datos
        const mergedHouses = mergeHouseData(firebaseHouses, dashboardProperties);

        // Filtrar solo los campos necesarios de Firebase (como en la función original)
        const filteredMergedHouses = mergedHouses.map(house => ({
            hid: house.hid,
            name: house.name,
            is_test_home: house.is_test_home || false,
            zendesk_name: house.zendesk_name || null,
            main_image: house.main_img_path || null,
            // Campos del dashboard
            dashboard_name: house.dashboard_name,
            dashboard_id: house.dashboard_id,
            dashboard_foreignId: house.dashboard_foreignId,
            dashboard_image: house.dashboard_image,
            dashboard_area: house.dashboard_area,
            dashboard_createdAt: house.dashboard_createdAt,
            dashboard_updatedAt: house.dashboard_updatedAt,
            // Campos de estado
            is_home_in_zendesk: house.zendesk_name !== null,
            is_home_in_nps_dashboard: house.dashboard_name !== null
        }));

        console.log(`Listado de casas combinado procesado exitosamente: ${filteredMergedHouses.length} casas`);

        // Devolver respuesta con casas combinadas
        return res.status(200).json({
            status: 'success',
            message: 'Listado de casas con datos del dashboard obtenido exitosamente',
            data: filteredMergedHouses,
            count: filteredMergedHouses.length,
            sources: {
                firebase_count: firebaseHouses.length,
                dashboard_count: dashboardProperties.length,
                merged_count: filteredMergedHouses.length
            }
        });

    } catch (error) {
        console.error('Error en getHousesWithDashboardController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener el listado de casas con datos del dashboard',
            error: error.message
        });
    }
}