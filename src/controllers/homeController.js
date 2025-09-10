import { getAllHouses } from '../services/firebase/houseService.js';

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

        // Filtrar solo los campos hid, name, is_test_home y zendesk_name de cada casa
        const filteredHouses = housesResult.data.map(house => ({
            hid: house.hid,
            name: house.name,
            is_test_home: house.is_test_home || false,
            zendesk_name: house.zendesk_name || null
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