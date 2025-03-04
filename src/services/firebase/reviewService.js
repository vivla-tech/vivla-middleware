import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { getHouseNameById } from './houseService.js';
import { getUserName, getUserEmail } from './userService.js';

// Función auxiliar para procesar los resultados
async function processReviewResults(querySnapshot) {
    // Obtener todos los IDs únicos de usuarios y casas
    const userIds = new Set();
    const houseIds = new Set();
    querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        userIds.add(data.uid);
        houseIds.add(data.hid);
    });

    // Obtener todos los nombres de usuarios, emails y casas en paralelo
    const [userNames, userEmails, houseNames] = await Promise.all([
        Promise.all([...userIds].map(uid => getUserName(uid))),
        Promise.all([...userIds].map(uid => getUserEmail(uid))),
        Promise.all([...houseIds].map(hid => getHouseNameById(hid)))
    ]);

    // Crear mapas para acceso rápido
    const userMap = new Map([...userIds].map((uid, index) => [uid, userNames[index]]));
    const emailMap = new Map([...userIds].map((uid, index) => [uid, userEmails[index]]));
    const houseMap = new Map([...houseIds].map((hid, index) => [hid, houseNames[index]]));

    const reviewsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            home: houseMap.get(data.hid) || null,
            user: userMap.get(data.uid) || null,
            email: emailMap.get(data.uid) || null,
            ...data,
        };
    });

    return {
        status: 'success',
        data: reviewsData,
        hasMore: querySnapshot.docs.length === 50
    };
}

export async function getAllReviews() {
    try {
        const reviewsRef = collection(db, 'nps-booking');

        // Primero intentamos con la consulta optimizada
        try {
            const q = query(
                reviewsRef,
                where('round', 'in', ['home', 'stay']),
                orderBy('created_at', 'desc'),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            return await processReviewResults(querySnapshot);
        } catch (indexError) {
            // Si falla por falta de índice, hacemos una consulta más simple
            console.warn('Índice no disponible, usando consulta alternativa:', indexError);

            const q = query(
                reviewsRef,
                where('round', 'in', ['home', 'stay']),
                limit(50)
            );
            const querySnapshot = await getDocs(q);

            // Ordenamos los resultados en memoria
            const sortedDocs = querySnapshot.docs.sort((a, b) => {
                return b.data().created_at?.toMillis() - a.data().created_at?.toMillis();
            });

            return await processReviewResults({
                ...querySnapshot,
                docs: sortedDocs
            });
        }
    } catch (error) {
        console.error('Error al obtener todas las reviews:', error);
        throw error;
    }
}

export async function getFilteredReviews(filters = {}) {
    try {
        const reviewsRef = collection(db, 'nps-booking');
        let conditions = [];

        // Aplicar filtro por tipo (home/stay)
        if (filters.type) {
            conditions.push(where('round', '==', filters.type));
        } else {
            conditions.push(where('round', 'in', ['home', 'stay']));
        }

        // Aplicar filtro por casa
        if (filters.houseId) {
            conditions.push(where('hid', '==', filters.houseId));
        }

        // Agregar límite
        conditions.push(limit(50));

        // Intentar primero con la consulta optimizada
        try {
            conditions.push(orderBy('created_at', 'desc'));
            const q = query(reviewsRef, ...conditions);
            const querySnapshot = await getDocs(q);
            return await processReviewResults(querySnapshot);
        } catch (indexError) {
            // Si falla por falta de índice, hacemos una consulta más simple
            console.warn('Índice no disponible, usando consulta alternativa:', indexError);

            const q = query(reviewsRef, ...conditions.filter(c => c.type !== 'orderBy'));
            const querySnapshot = await getDocs(q);

            // Ordenamos los resultados en memoria
            const sortedDocs = querySnapshot.docs.sort((a, b) => {
                return b.data().created_at?.toMillis() - a.data().created_at?.toMillis();
            });

            return await processReviewResults({
                ...querySnapshot,
                docs: sortedDocs
            });
        }
    } catch (error) {
        console.error('Error al obtener las reviews filtradas:', error);
        throw error;
    }
} 