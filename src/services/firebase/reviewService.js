import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { getHouseNameById } from './houseService.js';

// Función auxiliar para obtener el nombre del usuario
async function getUserName(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().display_name || null;
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener nombre de usuario para uid ${uid}:`, error);
        return null;
    }
}

export async function getAllReviews() {
    try {
        const reviewsRef = collection(db, 'nps-booking');
        const q = query(
            reviewsRef,
            where('round', 'in', ['home', 'stay'])
        );
        const querySnapshot = await getDocs(q);

        const reviewsData = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            try {
                const [homeName, userName] = await Promise.all([
                    getHouseNameById(data.hid),
                    getUserName(data.uid)
                ]);

                reviewsData.push({
                    id: doc.id,
                    home: homeName || null,
                    user: userName || null,
                    ...data,
                });
            } catch (error) {
                console.error(`Error al obtener datos para review ${doc.id}:`, error);
                reviewsData.push({
                    id: doc.id,
                    ...data,
                    home: null,
                    user: null
                });
            }
        }

        return {
            status: 'success',
            data: reviewsData
        };
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

        const q = query(reviewsRef, ...conditions);
        const querySnapshot = await getDocs(q);

        const reviewsData = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            try {
                const [homeName, userName] = await Promise.all([
                    getHouseNameById(data.hid),
                    getUserName(data.uid)
                ]);

                reviewsData.push({
                    id: doc.id,
                    ...data,
                    home: homeName || null,
                    user: userName || null
                });
            } catch (error) {
                console.error(`Error al obtener datos para review ${doc.id}:`, error);
                reviewsData.push({
                    id: doc.id,
                    ...data,
                    home: null,
                    user: null
                });
            }
        }

        return {
            status: 'success',
            data: reviewsData
        };
    } catch (error) {
        console.error('Error al obtener las reviews filtradas:', error);
        throw error;
    }
} 