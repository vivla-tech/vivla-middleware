import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export async function getAllReviews() {
    try {
        const reviewsRef = collection(db, 'nps-booking');
        const q = query(
            reviewsRef,
            where('round', 'in', ['home', 'stay'])
        );
        const querySnapshot = await getDocs(q);

        const reviewsData = [];
        querySnapshot.forEach((doc) => {
            reviewsData.push({
                id: doc.id,
                ...doc.data()
            });
        });

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
        querySnapshot.forEach((doc) => {
            reviewsData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            status: 'success',
            data: reviewsData
        };
    } catch (error) {
        console.error('Error al obtener las reviews filtradas:', error);
        throw error;
    }
} 