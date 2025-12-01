import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { homeStatsHelpers } from '../../helpers/homeStatsHelpers.js';
import { findMostSimilarStringIgnoringCommonWords } from '../../utils/similarityUtils.js';

// Cache para almacenar el mapeo de nombres a IDs y viceversa
let houseNameToIdCache = null;
let houseIdToNameCache = null;

// Cache para valores de casas de Zendesk
let zendeskHomeValuesCache = null;
// Promesa compartida para evitar múltiples inicializaciones simultáneas (race condition)
let zendeskCacheInitializationPromise = null;

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
    // Si ya hay una inicialización en curso, esperar a que termine
    if (zendeskCacheInitializationPromise) {
        console.log('⏳ Esperando a que termine la inicialización del cache de Zendesk en curso...');
        return await zendeskCacheInitializationPromise;
    }
    
    // Si el cache ya está inicializado correctamente, no hacer nada
    if (zendeskHomeValuesCache !== null && Array.isArray(zendeskHomeValuesCache) && zendeskHomeValuesCache.length > 0) {
        console.log(`✅ Cache de Zendesk ya inicializado con ${zendeskHomeValuesCache.length} valores`);
        return;
    }
    
    // Crear una promesa compartida para la inicialización (evita race conditions)
    zendeskCacheInitializationPromise = (async () => {
        try {
            console.log('🔄 Inicializando cache de valores de casas de Zendesk...');
            console.log('🔍 URL de Zendesk configurada:', process.env.ZENDESK_URL ? '✓' : '✗');
            console.log('🔍 Email de Zendesk configurado:', process.env.ZENDESK_EMAIL ? '✓' : '✗');
            console.log('🔍 Token de Zendesk configurado:', process.env.ZENDESK_TOKEN ? '✓' : '✗');
            
            const startTime = Date.now();
            // getAllZendeskHomeValues ahora tiene retry logic incorporado
            const result = await homeStatsHelpers.getAllZendeskHomeValues();
            const duration = Date.now() - startTime;
            
            if (result.status === 'success') {
                zendeskHomeValuesCache = result.data;
                console.log(`✅ Cache de Zendesk inicializado exitosamente con ${zendeskHomeValuesCache.length} valores (${duration}ms)`);
            } else {
                console.error('❌ Error al obtener valores de Zendesk después de todos los reintentos:', result.message);
                console.error('❌ Detalles del error:', result.error);
                if (result.errorDetails) {
                    console.error('❌ Reintentos intentados:', result.errorDetails.retriesAttempted);
                    console.error('❌ Error transitorio:', result.errorDetails.isTransientError ? 'Sí' : 'No');
                }
                // Mantener null para permitir reintentos en la próxima llamada
                zendeskHomeValuesCache = null;
            }
        } catch (error) {
            console.error('❌ Error al inicializar cache de valores de Zendesk:', error);
            console.error('❌ Tipo de error:', error.constructor.name);
            console.error('❌ Mensaje de error:', error.message);
            if (error.response) {
                console.error('❌ Status HTTP:', error.response.status);
                console.error('❌ Datos de respuesta:', error.response.data);
            }
            if (error.code) {
                console.error('❌ Código de error:', error.code);
            }
            // Mantener null para permitir reintentos en la próxima llamada
            zendeskHomeValuesCache = null;
        } finally {
            // Limpiar la promesa para permitir nuevos intentos si falló
            zendeskCacheInitializationPromise = null;
        }
    })();
    
    return await zendeskCacheInitializationPromise;
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
        
        // Verificar estado del cache después de la inicialización
        if (!zendeskHomeValuesCache || !Array.isArray(zendeskHomeValuesCache) || zendeskHomeValuesCache.length === 0) {
            console.log(`⚠️ No hay valores de Zendesk disponibles para comparar (cache: ${zendeskHomeValuesCache === null ? 'null' : 'vacío'})`);
            return null;
        }

        // Buscar el nombre más similar
        const mostSimilar = findMostSimilarStringIgnoringCommonWords(
            firebaseHouseName, 
            zendeskHomeValuesCache
        );

        if (mostSimilar) {
            console.log(`✅ Casa "${firebaseHouseName}" -> Zendesk: "${mostSimilar}"`);
        } else {
            console.log(`ℹ️ No se encontró coincidencia para casa: "${firebaseHouseName}"`);
        }

        return mostSimilar;
    } catch (error) {
        console.error('❌ Error al encontrar nombre de Zendesk para casa:', error);
        console.error('❌ Casa:', firebaseHouseName);
        return null;
    }
}

/**
 * Obtiene todas las casas de la colección homes (versión básica sin zendesk_name)
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

        return {
            status: 'success',
            data: houses,
            count: houses.length
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

/**
 * Obtiene todas las casas de la colección homes con el campo zendesk_name incluido
 * @returns {Promise<Object>} Objeto con status, data y count de todas las casas con zendesk_name
 */
export async function getAllHousesWithZendeskNames() {
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
        console.log(`🔄 Procesando nombres de Zendesk para ${houses.length} casas...`);
        
        // Asegurar que el cache esté inicializado antes de procesar todas las casas
        await initializeZendeskHomeValuesCache();
        
        const housesWithZendeskNames = await Promise.all(
            houses.map(async (house) => {
                const zendeskName = await findZendeskNameForHouse(house.name);
                return {
                    ...house,
                    zendesk_name: zendeskName
                };
            })
        );

        // Contar cuántas casas tienen zendesk_name
        const housesWithZendeskName = housesWithZendeskNames.filter(h => h.zendesk_name !== null).length;
        console.log(`✅ Procesamiento de nombres de Zendesk completado: ${housesWithZendeskName}/${houses.length} casas tienen zendesk_name`);

        return {
            status: 'success',
            data: housesWithZendeskNames,
            count: housesWithZendeskNames.length
        };

    } catch (error) {
        console.error('Error al obtener todas las casas con nombres de Zendesk:', error);
        return {
            status: 'error',
            message: 'No se pudieron obtener las casas con nombres de Zendesk',
            error: error.message
        };
    }
}

/**
 * Obtiene una casa específica por su hid
 * @param {string} hid - ID de la casa a buscar
 * @returns {Promise<Object>} Objeto con status, data de la casa encontrada
 */
export async function getHouseByHid(hid) {
    try {
        const homesRef = collection(db, 'homes');
        const q = query(homesRef, where('hid', '==', hid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return {
                status: 'error',
                message: `No se encontró la casa con hid: ${hid}`,
                data: null
            };
        }

        const doc = querySnapshot.docs[0];
        const houseData = doc.data();
        const house = {
            id: doc.id,
            ...houseData
        };

        console.log(`Casa encontrada: ${house.name} (hid: ${hid})`);

        return {
            status: 'success',
            data: house
        };

    } catch (error) {
        console.error('Error al obtener casa por hid:', error);
        return {
            status: 'error',
            message: 'Error al obtener la casa',
            error: error.message,
            data: null
        };
    }
} 