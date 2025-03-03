import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.js';

// Cache para almacenar el mapeo de nombres a IDs y viceversa
let houseNameToIdCache = null;
let houseIdToNameCache = null;

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