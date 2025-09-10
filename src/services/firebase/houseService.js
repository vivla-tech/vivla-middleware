import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { homeStatsHelpers } from '../../helpers/homeStatsHelpers.js';
import { findMostSimilarStringIgnoringCommonWords } from '../../utils/similarityUtils.js';

// Cache para almacenar el mapeo de nombres a IDs y viceversa
let houseNameToIdCache = null;
let houseIdToNameCache = null;

// Cache para valores de casas de Zendesk
let zendeskHomeValuesCache = null;

export async function getHouseIdByName(houseName) {
    try {
        // Si no tenemos el cache, lo inicializamos
        if (!houseNameToIdCache) {
            await initializeHouseCache();
        }

        // Convertimos el nombre de búsqueda a minúsculas
        const normalizedSearchName = houseName.toLowerCase();

        // Buscamos el ID por el nombre (ignorando 'casa' al inicio)
        const matchingHouse = Object.entries(houseNameToIdCache).find(([cachedName]) => {
            // Removemos 'casa' del inicio si existe
            const nameWithoutCasa = cachedName.replace(/^casa\s+/, '');
            return nameWithoutCasa.includes(normalizedSearchName);
        });

        if (!matchingHouse) {
            throw new Error(`No se encontró la casa con nombre: ${houseName}`);
        }

        return matchingHouse[1]; // Retornamos el ID (segundo elemento del array)
    } catch (error) {
        console.error('Error al obtener ID de casa por nombre:', error);
        throw error;
    }
}

export async function getHouseNameById(houseId) {
    try {
        // Si no tenemos el cache, lo inicializamos
        if (!houseIdToNameCache) {
            await initializeHouseCache();
        }

        const houseName = houseIdToNameCache[houseId];
        if (!houseName) {
            throw new Error(`No se encontró la casa con ID: ${houseId}`);
        }

        return houseName;
    } catch (error) {
        console.error('Error al obtener nombre de casa por ID:', error);
        throw error;
    }
}

async function initializeHouseCache() {
    try {
        const homesRef = collection(db, 'homes');
        const querySnapshot = await getDocs(homesRef);

        houseNameToIdCache = {};
        houseIdToNameCache = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.name && data.hid) {
                // Guardamos el nombre en minúsculas para la búsqueda
                houseNameToIdCache[data.name.toLowerCase()] = data.hid;
                // Guardamos el mapeo inverso con el nombre original
                houseIdToNameCache[data.hid] = data.name;
            }
        });
    } catch (error) {
        console.error('Error al inicializar cache de casas:', error);
        throw error;
    }
}

async function initializeZendeskHomeValuesCache() {
    try {
        if (!zendeskHomeValuesCache) {
            console.log('Inicializando cache de valores de casas de Zendesk...');
            const result = await homeStatsHelpers.getAllZendeskHomeValues();
            
            if (result.status === 'success') {
                zendeskHomeValuesCache = result.data;
                console.log(`Cache de Zendesk inicializado con ${zendeskHomeValuesCache.length} valores`);
            } else {
                console.error('Error al obtener valores de Zendesk:', result.message);
                zendeskHomeValuesCache = [];
            }
        }
    } catch (error) {
        console.error('Error al inicializar cache de valores de Zendesk:', error);
        zendeskHomeValuesCache = [];
    }
}

/**
 * Encuentra el nombre más similar en Zendesk para una casa de Firebase
 * @param {string} firebaseHouseName - Nombre de la casa en Firebase
 * @returns {string|null} - Nombre más similar en Zendesk o null si no se encuentra
 */
export async function findZendeskNameForHouse(firebaseHouseName) {
    try {
        // Inicializar cache si es necesario
        await initializeZendeskHomeValuesCache();
        
        if (!zendeskHomeValuesCache || zendeskHomeValuesCache.length === 0) {
            console.log('No hay valores de Zendesk disponibles para comparar');
            return null;
        }

        // Buscar el nombre más similar
        const mostSimilar = findMostSimilarStringIgnoringCommonWords(
            firebaseHouseName, 
            zendeskHomeValuesCache
        );

        if (mostSimilar) {
            console.log(`Casa "${firebaseHouseName}" -> Zendesk: "${mostSimilar}"`);
        } else {
            console.log(`No se encontró coincidencia para casa: "${firebaseHouseName}"`);
        }

        return mostSimilar;
    } catch (error) {
        console.error('Error al encontrar nombre de Zendesk para casa:', error);
        return null;
    }
}

/**
 * Obtiene todas las casas de la colección homes con el campo zendesk_name incluido
 * @returns {Promise<Object>} Objeto con status, data y count de todas las casas
 */
export async function getAllHouses() {
    try {
        const homesRef = collection(db, 'homes');
        const querySnapshot = await getDocs(homesRef);

        const houses = [];

        querySnapshot.forEach((doc) => {
            const houseData = doc.data();
            houses.push({
                id: doc.id,
                ...houseData
            });
        });

        console.log(`Se encontraron ${houses.length} casas en total`);

        // Agregar zendesk_name a cada casa
        console.log('Procesando nombres de Zendesk para cada casa...');
        const housesWithZendeskNames = await Promise.all(
            houses.map(async (house) => {
                const zendeskName = await findZendeskNameForHouse(house.name);
                return {
                    ...house,
                    zendesk_name: zendeskName
                };
            })
        );

        console.log('Procesamiento de nombres de Zendesk completado');

        return {
            status: 'success',
            data: housesWithZendeskNames,
            count: housesWithZendeskNames.length
        };

    } catch (error) {
        console.error('Error al obtener todas las casas:', error);
        return {
            status: 'error',
            message: 'No se pudieron obtener las casas',
            error: error.message
        };
    }
} 