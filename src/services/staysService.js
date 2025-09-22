import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Convierte fecha de formato DD/MM/AAAA a YYYY-MM-DD
 * @param {string} dateStr - Fecha en formato DD/MM/AAAA
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function convertDateFormat(dateStr) {
    if (!dateStr) return null;
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Calcula la fecha de la última actuación (estancia completed más reciente ≤ currentDate)
 * @param {Array} booksSnapshot - Snapshot de documentos de books
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {Object} Objeto con la fecha de última actuación
 */
function calculateLastAction(booksSnapshot, currentDate) {
    const currentDateObj = new Date(currentDate);
    
    // Filtrar estancias con status 'booked' y progress 'completed'
    const completedStays = [];
    
    booksSnapshot.forEach((bookDoc) => {
        const bookData = bookDoc.data();
        
        if (bookData.status === 'booked' && bookData.progress === 'completed' && bookData.end_date) {
            const endDateConverted = convertDateFormat(bookData.end_date);
            
            if (endDateConverted) {
                const endDate = new Date(endDateConverted);
                
                // Solo incluir estancias donde end_date <= currentDate
                if (endDate <= currentDateObj) {
                    completedStays.push({
                        endDate: endDateConverted,
                        endDateObj: endDate
                    });
                }
            }
        }
    });
    
    if (completedStays.length === 0) {
        return {
            date: null,
            message: 'No disponible'
        };
    }
    
    // Encontrar la fecha más reciente
    const lastAction = completedStays.reduce((latest, current) => {
        return current.endDateObj > latest.endDateObj ? current : latest;
    });
    
    return {
        date: lastAction.endDate,
        message: `Last action: completed stay on ${lastAction.endDate}`
    };
}

/**
 * Obtiene estadísticas de estancias (books) para una casa específica por su hid
 * @param {string} hid - ID único de la casa
 * @returns {Promise<Object>} Objeto con estadísticas de estancias agrupadas por progress
 */
export async function homeStaysStats(hid) {
    try {
        console.log(`Obteniendo estadísticas de estancias para casa con hid: ${hid}`);

        // Buscar el documento home por hid
        const homesRef = collection(db, 'homes');
        const homeQuery = query(homesRef, where('hid', '==', hid));
        const homeSnapshot = await getDocs(homeQuery);

        if (homeSnapshot.empty) {
            return {
                status: 'error',
                message: `No se encontró la casa con hid: ${hid}`,
                data: null
            };
        }

        // Obtener el primer (y único) documento home
        const homeDoc = homeSnapshot.docs[0];
        const homeData = homeDoc.data();
        const homeDocId = homeDoc.id;

        console.log(`Casa encontrada: ${homeData.name || 'Sin nombre'} (ID: ${homeDocId})`);

        // Acceder a la subcolección 'books' del documento home
        const booksRef = collection(db, 'homes', homeDocId, 'books');
        const booksQuery = query(booksRef, where('status', '==', 'booked'));
        const booksSnapshot = await getDocs(booksQuery);

        console.log(`Se encontraron ${booksSnapshot.size} books con status 'booked'`);

        // Inicializar contadores para los 3 tipos de progress conocidos
        const progressStats = {
            notstarted: 0,
            inprogress: 0,
            completed: 0
        };

        let totalBookedStays = 0;

        // Agrupar y contar por progress
        booksSnapshot.forEach((bookDoc) => {
            const bookData = bookDoc.data();
            const progress = bookData.progress;

            totalBookedStays++;

            // Contar por tipo de progress
            if (progress && progressStats.hasOwnProperty(progress)) {
                progressStats[progress]++;
            } else {
                // Si hay un progress no esperado, lo agregamos dinámicamente
                if (progress) {
                    if (!progressStats[progress]) {
                        progressStats[progress] = 0;
                    }
                    progressStats[progress]++;
                } else {
                    // Si no tiene progress, lo contamos como 'undefined'
                    if (!progressStats['undefined']) {
                        progressStats['undefined'] = 0;
                    }
                    progressStats['undefined']++;
                }
            }
        });

        console.log(`Estadísticas calculadas: Total=${totalBookedStays}, Progress=${JSON.stringify(progressStats)}`);

        // Calcular la última actuación (estancia completed más reciente ≤ currentDate)
        const currentDate = new Date().toISOString().split('T')[0];
        const lastAction = calculateLastAction(booksSnapshot, currentDate);

        return {
            status: 'success',
            data: {
                hid: hid,
                homeName: homeData.name || null,
                homeId: homeDocId,
                totalBookedStays: totalBookedStays,
                progressStats: progressStats,
                lastAction: lastAction
            },
            message: 'Estadísticas de estancias obtenidas exitosamente'
        };

    } catch (error) {
        console.error('Error al obtener estadísticas de estancias:', error);
        return {
            status: 'error',
            message: 'Error al obtener estadísticas de estancias',
            error: error.message,
            data: null
        };
    }
}
