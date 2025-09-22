import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Configuración de fechas de inspección por tipo de casa
 * Formato: mes-día (MM-DD) - el año se ajustará dinámicamente
 */
const INSPECTION_DATES_CONFIG = {
    beach: [
        { monthDay: '06-01', description: 'Inspección de verano' },
        { monthDay: '12-01', description: 'Inspección de invierno' }
    ],
    ski: [
        { monthDay: '11-01', description: 'Inspección pre-temporada' },
        { monthDay: '04-01', description: 'Inspección post-temporada' }
    ],
    city: [
        { monthDay: '02-01', description: 'Inspección pre-temporada' },
        { monthDay: '08-01', description: 'Inspección post-temporada' }
    ]
};

/**
 * Genera fechas de inspección dinámicas basándose en el año actual
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @param {Array} inspectionConfig - Configuración de inspecciones para un tipo de casa
 * @returns {Array} Array de objetos con fechas completas para el año actual
 */
function generateDynamicInspectionDates(currentDate, inspectionConfig) {
    const currentYear = new Date(currentDate).getFullYear();
    
    return inspectionConfig.map(inspection => ({
        date: `${currentYear}-${inspection.monthDay}`,
        description: inspection.description
    }));
}

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
 * Calcula la fecha de la última actuación (inspección más reciente ≤ currentDate)
 * @param {Array} inspectionDates - Array de fechas de inspección
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {Object} Objeto con la fecha de última actuación
 */
function calculateLastAction(inspectionDates, currentDate) {
    const currentDateObj = new Date(currentDate);
    
    // Filtrar fechas que sean ≤ currentDate y convertir a objetos Date para comparación
    const validDates = inspectionDates
        .map(inspection => ({
            ...inspection,
            dateObj: new Date(inspection.date)
        }))
        .filter(inspection => inspection.dateObj <= currentDateObj);
    
    if (validDates.length === 0) {
        return {
            date: null,
            description: null,
            message: 'No actions performed until current date'
        };
    }
    
    // Encontrar la fecha más reciente
    const lastAction = validDates.reduce((latest, current) => {
        return current.dateObj > latest.dateObj ? current : latest;
    });
    
    return {
        date: lastAction.date,
        description: lastAction.description,
        message: `Last action: ${lastAction.description} on ${lastAction.date}`
    };
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
        const inspectionConfig = INSPECTION_DATES_CONFIG[houseType];
        // Generar fechas dinámicas para el año actual
        const dynamicDates = generateDynamicInspectionDates(currentDate, inspectionConfig);
        
        dynamicDates.forEach(inspection => {
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

        // Obtener configuración de inspecciones para el tipo de casa
        const inspectionConfig = INSPECTION_DATES_CONFIG[homeType];

        // Si no hay fechas configuradas para este tipo
        if (!inspectionConfig || inspectionConfig.length === 0) {
            // Calcular estadísticas globales incluso si esta casa no tiene fechas
            const currentDate = new Date().toISOString().split('T')[0];
            const globalStats = calculateGlobalStats(currentDate);
            const lastAction = calculateLastAction([], currentDate);
            
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
                    globalStats: globalStats,
                    lastAction: lastAction
                }
            };
        }

        // Obtener fecha actual
        const currentDate = new Date().toISOString().split('T')[0];

        // Generar fechas dinámicas para el año actual
        const inspectionDates = generateDynamicInspectionDates(currentDate, inspectionConfig);

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

        // Calcular la última actuación (inspección más reciente ≤ currentDate)
        const lastAction = calculateLastAction(inspectionDates, currentDate);

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
                globalStats: globalStats,
                lastAction: lastAction
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
