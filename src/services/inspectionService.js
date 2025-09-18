import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Configuración de fechas de inspección por tipo de casa
 */
const INSPECTION_DATES_CONFIG = {
    beach: [
        { date: '2025-06-01', description: 'Inspección de verano' },
        { date: '2025-12-01', description: 'Inspección de invierno' }
    ],
    ski: [
        { date: '2025-11-01', description: 'Inspección pre-temporada' },
        { date: '2025-04-01', description: 'Inspección post-temporada' }
    ],
    city: [
        { date: '2025-02-01', description: 'Inspección pre-temporada' },
        { date: '2025-08-01', description: 'Inspección post-temporada' }
    ]
};

/**
 * Clasifica una fecha como past, now o future basándose en la fecha actual
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {string} 'past', 'now' o 'future'
 */
function classifyDate(dateStr, currentDate) {
    const targetDate = new Date(dateStr);
    const today = new Date(currentDate);
    
    // Comparar solo las fechas (sin hora)
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (targetDate < today) {
        return 'past';
    } else if (targetDate.getTime() === today.getTime()) {
        return 'now';
    } else {
        return 'future';
    }
}

/**
 * Calcula estadísticas globales de todas las fechas de inspección configuradas
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {Object} Objeto con estadísticas globales
 */
function calculateGlobalStats(currentDate) {
    let totalDates = 0;
    let totalPast = 0;
    let totalNow = 0;
    let totalFuture = 0;
    let lastInspectionDate = null;
    
    // Array para almacenar todas las fechas pasadas
    const pastDates = [];
    
    // Iterar sobre todos los tipos de casa y sus fechas
    Object.keys(INSPECTION_DATES_CONFIG).forEach(houseType => {
        const dates = INSPECTION_DATES_CONFIG[houseType];
        
        dates.forEach(inspection => {
            totalDates++;
            const classification = classifyDate(inspection.date, currentDate);
            
            switch (classification) {
                case 'past':
                    totalPast++;
                    pastDates.push(inspection.date);
                    break;
                case 'now':
                    totalNow++;
                    break;
                case 'future':
                    totalFuture++;
                    break;
            }
        });
    });
    
    // Encontrar la fecha más reciente entre las fechas pasadas
    if (pastDates.length > 0) {
        // Ordenar fechas en orden descendente y tomar la primera (más reciente)
        pastDates.sort((a, b) => new Date(b) - new Date(a));
        lastInspectionDate = pastDates[0];
    }
    
    return {
        totalDates,
        totalPast,
        totalNow,
        totalFuture,
        lastInspectionDate
    };
}

/**
 * Obtiene las fechas de inspección para una casa específica basándose en su tipo
 * @param {string} hid - ID único de la casa
 * @returns {Promise<Object>} Objeto con fechas de inspección clasificadas
 */
export async function getInspectionDates(hid) {
    try {
        console.log(`Obteniendo fechas de inspección para casa con hid: ${hid}`);

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
        const homeType = homeData.type;

        console.log(`Casa encontrada: ${homeData.name || 'Sin nombre'}, Tipo: ${homeType}`);

        // Validar que el tipo existe en la configuración
        if (!INSPECTION_DATES_CONFIG.hasOwnProperty(homeType)) {
            return {
                status: 'error',
                message: `Tipo de casa no válido: ${homeType}. Tipos válidos: ${Object.keys(INSPECTION_DATES_CONFIG).join(', ')}`,
                data: null
            };
        }

        // Obtener fechas de inspección para el tipo de casa
        const inspectionDates = INSPECTION_DATES_CONFIG[homeType];

        // Si no hay fechas configuradas para este tipo
        if (!inspectionDates || inspectionDates.length === 0) {
            // Calcular estadísticas globales incluso si esta casa no tiene fechas
            const currentDate = new Date().toISOString().split('T')[0];
            const globalStats = calculateGlobalStats(currentDate);
            
            return {
                status: 'success',
                message: `No hay fechas de inspección configuradas para casas de tipo: ${homeType}`,
                data: {
                    hid: hid,
                    homeName: homeData.name || null,
                    homeType: homeType,
                    dates: [],
                    past: [],
                    now: [],
                    future: [],
                    currentDate: currentDate,
                    globalStats: globalStats
                }
            };
        }

        // Obtener fecha actual
        const currentDate = new Date().toISOString().split('T')[0];

        // Clasificar fechas
        const past = [];
        const now = [];
        const future = [];

        inspectionDates.forEach(inspection => {
            const classification = classifyDate(inspection.date, currentDate);
            const dateInfo = {
                date: inspection.date,
                description: inspection.description
            };

            switch (classification) {
                case 'past':
                    past.push(dateInfo);
                    break;
                case 'now':
                    now.push(dateInfo);
                    break;
                case 'future':
                    future.push(dateInfo);
                    break;
            }
        });

        console.log(`Fechas clasificadas: Past=${past.length}, Now=${now.length}, Future=${future.length}`);

        // Calcular estadísticas globales
        const globalStats = calculateGlobalStats(currentDate);
        console.log(`Estadísticas globales: Total=${globalStats.totalDates}, Past=${globalStats.totalPast}, Now=${globalStats.totalNow}, Future=${globalStats.totalFuture}`);

        return {
            status: 'success',
            data: {
                hid: hid,
                homeName: homeData.name || null,
                homeType: homeType,
                dates: inspectionDates,
                past: past,
                now: now,
                future: future,
                currentDate: currentDate,
                globalStats: globalStats
            },
            message: 'Fechas de inspección obtenidas exitosamente'
        };

    } catch (error) {
        console.error('Error al obtener fechas de inspección:', error);
        return {
            status: 'error',
            message: 'Error al obtener fechas de inspección',
            error: error.message,
            data: null
        };
    }
}
