import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Obtiene los datos de una casa específica desde la colección nps-home-data
 * @param {string} hid - ID único de la casa
 * @returns {Promise<Object>} Objeto con los datos de la casa o error
 */
export async function getRoomImagesData(hid) {
    try {
        console.log(`Buscando datos de casa con hid: ${hid} en colección nps-home-data`);

        // Buscar el documento en la colección nps-home-data por hid
        const npsHomeDataRef = collection(db, 'nps-home-data');
        const homeQuery = query(npsHomeDataRef, where('hid', '==', hid));
        const homeSnapshot = await getDocs(homeQuery);

        if (homeSnapshot.empty) {
            return {
                status: 'error',
                message: `No se encontró la casa con hid: ${hid} en la colección nps-home-data`,
                data: null
            };
        }

        // Obtener el primer (y único) documento
        const homeDoc = homeSnapshot.docs[0];
        const homeData = homeDoc.data();

        console.log(`Casa encontrada en nps-home-data: ${homeData.name || 'Sin nombre'}, Hid: ${hid}`);
        console.log(`Campos disponibles: ${Object.keys(homeData).join(', ')}`);

        // Filtrar campos que empiecen por "img" y quitar el prefijo
        const imageFields = {};
        Object.keys(homeData).forEach(key => {
            if (key.toLowerCase().startsWith('img')) {
                // Quitar el prefijo "img" (case insensitive)
                const cleanKey = key.substring(3); // Quita los primeros 3 caracteres
                imageFields[cleanKey] = homeData[key];
            }
        });

        console.log(`Campos de imagen encontrados: ${Object.keys(imageFields).join(', ')}`);

        return {
            status: 'success',
            data: {
                hid: hid,
                documentId: homeDoc.id,
                roomImages: imageFields
            },
            message: 'Imágenes de habitaciones obtenidas exitosamente desde nps-home-data'
        };

    } catch (error) {
        console.error('Error al obtener datos de casa desde nps-home-data:', error);
        return {
            status: 'error',
            message: 'Error al obtener datos de casa desde nps-home-data',
            error: error.message,
            data: null
        };
    }
}
