import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.js';

/**
 * Obtiene la lista de deals para un usuario específico
 * @param {string} uid - El ID único del usuario
 * @returns {Promise<Array>} Array de deals que pertenecen al usuario
 */
export async function getDealsByUserId(uid) {
    try {
        if (!uid) {
            throw new Error('El UID del usuario es requerido');
        }

        // Referencia a la colección de deals
        const dealsRef = collection(db, 'deals');
        
        // Crear query para buscar deals donde el uid coincida
        const dealsQuery = query(
            dealsRef,
            where('uid', '==', uid)
        );

        // Ejecutar la query
        const querySnapshot = await getDocs(dealsQuery);

        // Array para almacenar los deals encontrados
        const deals = [];

        // Iterar sobre los documentos encontrados
        querySnapshot.forEach((doc) => {
            const dealData = doc.data();
            // Añadir el ID del documento a los datos
            deals.push({
                id: doc.id,
                ...dealData
            });
        });

        console.log(`Se encontraron ${deals.length} deals para el usuario ${uid}`);

        return {
            status: 'success',
            data: deals,
            count: deals.length
        };

    } catch (error) {
        console.error(`Error al obtener deals para el usuario ${uid}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener los deals para el usuario ${uid}`,
            error: error.message
        };
    }
}

/**
 * Obtiene todos los deals de la colección (para debugging o administración)
 * @returns {Promise<Array>} Array de todos los deals
 */
export async function getAllDeals() {
    try {
        const dealsRef = collection(db, 'deals');
        const querySnapshot = await getDocs(dealsRef);

        const deals = [];

        querySnapshot.forEach((doc) => {
            const dealData = doc.data();
            deals.push({
                id: doc.id,
                ...dealData
            });
        });

        console.log(`Se encontraron ${deals.length} deals en total`);

        return {
            status: 'success',
            data: deals,
            count: deals.length
        };

    } catch (error) {
        console.error('Error al obtener todos los deals:', error);
        return {
            status: 'error',
            message: 'No se pudieron obtener los deals',
            error: error.message
        };
    }
}

/**
 * Obtiene un deal específico por su ID
 * @param {string} dealId - El ID del deal
 * @returns {Promise<Object>} El deal encontrado
 */
export async function getDealById(dealId) {
    try {
        if (!dealId) {
            throw new Error('El ID del deal es requerido');
        }

        const dealsRef = collection(db, 'deals');
        const dealQuery = query(
            dealsRef,
            where('__name__', '==', dealId)
        );

        const querySnapshot = await getDocs(dealQuery);

        if (querySnapshot.empty) {
            return {
                status: 'error',
                message: `No se encontró el deal con ID: ${dealId}`
            };
        }

        const dealDoc = querySnapshot.docs[0];
        const dealData = dealDoc.data();

        return {
            status: 'success',
            data: {
                id: dealDoc.id,
                ...dealData
            }
        };

    } catch (error) {
        console.error(`Error al obtener el deal ${dealId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener el deal con ID: ${dealId}`,
            error: error.message
        };
    }
} 