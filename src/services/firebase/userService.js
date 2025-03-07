import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';

// Cache para almacenar el mapeo de nombres a IDs y viceversa
let userIdToNameCache = null;
let userIdToEmailCache = null;

export async function getUserName(uid) {
    try {
        // Si no tenemos el cache, lo inicializamos
        if (!userIdToNameCache) {
            await initializeUserCache();
        }

        const userName = userIdToNameCache[uid];
        if (!userName) {
            // Si no está en caché, intentamos obtenerlo directamente
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const displayName = userDoc.data().display_name || null;
                // Actualizamos el caché
                userIdToNameCache[uid] = displayName;
                return displayName;
            }
            return null;
        }

        return userName;
    } catch (error) {
        console.error(`Error al obtener nombre de usuario para uid ${uid}:`, error);
        return null;
    }
}

export async function getUserEmail(uid) {
    try {
        // Si no tenemos el cache, lo inicializamos
        if (!userIdToEmailCache) {
            await initializeEmailCache();
        }

        const userEmail = userIdToEmailCache[uid];
        if (!userEmail) {
            // Si no está en caché, intentamos obtenerlo directamente
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const email = userDoc.data().email || null;
                // Actualizamos el caché
                userIdToEmailCache[uid] = email;
                return email;
            }
            return null;
        }

        return userEmail;
    } catch (error) {
        console.error(`Error al obtener email de usuario para uid ${uid}:`, error);
        return null;
    }
}

async function initializeUserCache() {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        userIdToNameCache = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.display_name && doc.id) {
                userIdToNameCache[doc.id] = data.display_name;
            }
        });
    } catch (error) {
        console.error('Error al inicializar cache de usuarios:', error);
        throw error;
    }
}

async function initializeEmailCache() {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        userIdToEmailCache = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email && doc.id) {
                userIdToEmailCache[doc.id] = data.email;
            }
        });
    } catch (error) {
        console.error('Error al inicializar cache de emails:', error);
        throw error;
    }
} 