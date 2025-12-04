// Datos estáticos de revisiones anuales de las casas
const ANNUAL_REVISION_DATA = [
  {"HomeName": "Fir", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "Nheu", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "Naut", "AnnualRevisionDate": "2025-09-09"},
  {"HomeName": "Pinere", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "1500", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "Ruda", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "Nin", "AnnualRevisionDate": "2025-08-21"},
  {"HomeName": "Arties", "AnnualRevisionDate": "2025-09-09"},
  {"HomeName": "Garona", "AnnualRevisionDate": "2025-08-25"},
  {"HomeName": "Tanau", "AnnualRevisionDate": "2025-05-05"},
  {"HomeName": "Oyambre", "AnnualRevisionDate": "2025-05-14"},
  {"HomeName": "Deveses", "AnnualRevisionDate": "2025-05-21"},
  {"HomeName": "Tosalet", "AnnualRevisionDate": "2025-09-22"},
  {"HomeName": "Gades", "AnnualRevisionDate": "2025-09-22"},
  {"HomeName": "Sidonia", "AnnualRevisionDate": "2025-09-22"},
  {"HomeName": "Nara", "AnnualRevisionDate": "2025-09-22"},
  {"HomeName": "Tuna", "AnnualRevisionDate": "2025-09-01"},
  {"HomeName": "Valderrama", "AnnualRevisionDate": "2025-09-08"},
  {"HomeName": "Saona", "AnnualRevisionDate": "2025-06-09"},
  {"HomeName": "Ribes", "AnnualRevisionDate": "2025-06-09"},
  {"HomeName": "Coves", "AnnualRevisionDate": "2025-07-14"},
  {"HomeName": "Bini", "AnnualRevisionDate": "2025-08-18"},
  {"HomeName": "Son_Parc_", "AnnualRevisionDate": "2025-07-14"},
  {"HomeName": "Son_Parc_II", "AnnualRevisionDate": "2025-07-14"}
];

/**
 * Ajusta las fechas de los datos al año actual si es necesario
 * Si estamos en un año diferente a 2025, usa los datos de 2025 pero ajusta el año
 * @param {Array} data - Array de datos con fechas
 * @param {number} currentYear - Año actual
 * @returns {Array} Array de datos con fechas ajustadas al año actual
 */
function adjustDatesToCurrentYear(data, currentYear) {
    const BASE_YEAR = 2025; // Año de los datos mockeados
    
    // Si estamos en el año base, devolver los datos tal cual
    if (currentYear === BASE_YEAR) {
        return data;
    }
    
    // Si estamos en otro año, ajustar las fechas al año actual
    return data.map(house => {
        const originalDate = new Date(house.AnnualRevisionDate);
        const adjustedDate = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
        const adjustedDateStr = adjustedDate.toISOString().split('T')[0];
        
        return {
            ...house,
            AnnualRevisionDate: adjustedDateStr
        };
    });
}

/**
 * Calcula el estado de la revisión anual basándose en la fecha actual
 * @param {string} revisionDate - Fecha de revisión en formato YYYY-MM-DD
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {string} Estado: "completed", "inProgress" o "pending"
 */
function calculateRevisionStatus(revisionDate, currentDate) {
    const today = new Date(currentDate);
    const revision = new Date(revisionDate);
    const todayStr = currentDate;
    
    if (revision < today) {
        return "completed";
    } else if (revisionDate === todayStr) {
        return "inProgress";
    } else {
        return "pending";
    }
}

/**
 * Calcula los datos agregados de las revisiones anuales
 * @param {Array} filteredData - Array de casas filtradas
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @returns {Object} Objeto con conteos de completadas, en curso, pendientes y totales
 */
function calculateAggregatedStatus(filteredData, currentDate) {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    
    filteredData.forEach(house => {
        if (!house.AnnualRevisionDate) {
            return;
        }
        
        const status = calculateRevisionStatus(house.AnnualRevisionDate, currentDate);
        
        if (status === "completed") {
            completed++;
        } else if (status === "inProgress") {
            inProgress++;
        } else {
            pending++;
        }
    });
    
    return {
        completed,
        inProgress,
        pending,
        total: filteredData.length
    };
}

/**
 * Controlador para obtener las revisiones anuales de las casas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAnnualRevisionController(req, res) {
    try {
        // Obtener la fecha actual en formato YYYY-MM-DD
        const currentDate = new Date().toISOString().split('T')[0];
        const currentYear = new Date().getFullYear();
        
        // Ajustar las fechas al año actual si es necesario (usar datos de 2025 si no hay del año actual)
        const adjustedData = adjustDatesToCurrentYear(ANNUAL_REVISION_DATA, currentYear);
        
        // Obtener el parámetro de filtro por nombre de casa
        const { homeName } = req.query;
        
        // Filtrar datos si se proporciona un nombre de casa
        let filteredData = adjustedData;
        if (homeName) {
            const searchTerm = homeName.toLowerCase();
            
            // Primero buscar coincidencias exactas (case-insensitive)
            const exactMatches = adjustedData.filter(house => 
                house.HomeName.toLowerCase() === searchTerm
            );
            
            if (exactMatches.length > 0) {
                // Si hay coincidencias exactas, usar solo esas
                filteredData = exactMatches;
            } else {
                // Si no hay coincidencias exactas, buscar coincidencias parciales
                filteredData = adjustedData.filter(house => 
                    house.HomeName.toLowerCase().includes(searchTerm)
                );
            }
            
            // Si no se encuentra ninguna casa, devolver respuesta vacía
            if (filteredData.length === 0) {
                return res.status(200).json({
                    status: 'success',
                    data: [],
                    count: 0,
                    aggregated: {
                        completed: 0,
                        inProgress: 0,
                        pending: 0,
                        total: 0
                    },
                    currentDate: currentDate,
                    message: `No se encontraron casas con el nombre: ${homeName}`,
                    filter: { homeName }
                });
            }
        }
        
        // Agregar el estado a cada casa
        const dataWithStatus = filteredData.map(house => {
            const status = calculateRevisionStatus(house.AnnualRevisionDate, currentDate);
            return {
                ...house,
                status: status
            };
        });
        
        // Calcular datos agregados (solo para las casas filtradas)
        const aggregated = calculateAggregatedStatus(filteredData, currentDate);
        
        // Preparar respuesta
        const response = {
            status: 'success',
            data: dataWithStatus,
            count: filteredData.length,
            aggregated: aggregated,
            currentDate: currentDate,
            message: homeName 
                ? `Revisión anual de las casas filtradas por nombre "${homeName}" obtenida exitosamente`
                : 'Revisiones anuales de las casas obtenidas exitosamente'
        };
        
        // Agregar información del filtro si se aplicó
        if (homeName) {
            response.filter = { homeName };
        }
        
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error en el controlador de revisiones anuales:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

