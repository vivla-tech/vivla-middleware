/**
 * Utilidades para comparación de similitud entre strings
 */

/**
 * Encuentra el string más similar de una lista comparando si uno contiene al otro
 * @param {string} target - String objetivo a comparar
 * @param {string[]} candidates - Lista de strings candidatos
 * @returns {string|null} - El string más similar o null si no hay coincidencias
 */
export function findMostSimilarString(target, candidates) {
    if (!target || !candidates || candidates.length === 0) {
        return null;
    }

    // Normalizar el string objetivo (minúsculas y sin espacios extra)
    const normalizedTarget = target.toLowerCase().trim();
    
    // Si el target está vacío después de normalizar, retornar null
    if (!normalizedTarget) {
        return null;
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates) {
        if (!candidate) continue;

        const normalizedCandidate = candidate.toLowerCase().trim();
        
        // Calcular score de similitud
        const score = calculateSimilarityScore(normalizedTarget, normalizedCandidate);
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate; // Mantener el string original (no normalizado)
        }
    }

    // Solo retornar si hay una coincidencia mínima
    return bestScore > 0 ? bestMatch : null;
}

/**
 * Calcula el score de similitud entre dos strings
 * @param {string} target - String objetivo
 * @param {string} candidate - String candidato
 * @returns {number} - Score de similitud (0-1)
 */
function calculateSimilarityScore(target, candidate) {
    // Caso 1: Coincidencia exacta
    if (target === candidate) {
        return 1.0;
    }

    // Caso 2: El candidato contiene al target
    if (candidate.includes(target)) {
        // Score basado en qué porcentaje del candidato es el target
        return target.length / candidate.length;
    }

    // Caso 3: El target contiene al candidato
    if (target.includes(candidate)) {
        // Score basado en qué porcentaje del target es el candidato
        return candidate.length / target.length;
    }

    // Caso 4: Verificar si hay palabras comunes
    const targetWords = target.split(/\s+/).filter(word => word.length > 2);
    const candidateWords = candidate.split(/\s+/).filter(word => word.length > 2);
    
    let commonWords = 0;
    for (const targetWord of targetWords) {
        for (const candidateWord of candidateWords) {
            if (targetWord.includes(candidateWord) || candidateWord.includes(targetWord)) {
                commonWords++;
                break;
            }
        }
    }

    if (commonWords > 0) {
        // Score basado en palabras comunes
        return commonWords / Math.max(targetWords.length, candidateWords.length) * 0.5;
    }

    return 0;
}

/**
 * Encuentra el string más similar ignorando palabras comunes como "casa"
 * @param {string} target - String objetivo
 * @param {string[]} candidates - Lista de candidatos
 * @returns {string|null} - El string más similar
 */
export function findMostSimilarStringIgnoringCommonWords(target, candidates) {
    if (!target || !candidates || candidates.length === 0) {
        return null;
    }

    // Palabras comunes a ignorar
    const commonWords = ['casa', 'home', 'house'];
    
    // Normalizar removiendo palabras comunes
    const normalizedTarget = normalizeString(target, commonWords);
    
    if (!normalizedTarget) {
        return null;
    }

    // Verificar si el target tiene "II" o "ii"
    const hasII = /ii/i.test(target);
    
    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates) {
        if (!candidate) continue;

        const normalizedCandidate = normalizeString(candidate, commonWords);
        
        if (!normalizedCandidate) continue;

        let score = calculateSimilarityScore(normalizedTarget, normalizedCandidate);
        
        // Si el target tiene "II" y el candidato también tiene "ii", dar prioridad
        if (hasII && /ii/i.test(candidate)) {
            score += 0.3; // Bonus por coincidencia de "II"
        }
        // Si el target tiene "II" pero el candidato no tiene "ii", reducir score
        else if (hasII && !/ii/i.test(candidate)) {
            score *= 0.5; // Penalización por no tener "II"
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    return bestScore > 0 ? bestMatch : null;
}

/**
 * Normaliza un string removiendo palabras comunes y espacios extra
 * @param {string} str - String a normalizar
 * @param {string[]} wordsToRemove - Palabras a remover
 * @returns {string} - String normalizado
 */
function normalizeString(str, wordsToRemove = []) {
    let normalized = str.toLowerCase().trim();
    
    // Remover palabras comunes
    for (const word of wordsToRemove) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        normalized = normalized.replace(regex, '').trim();
    }
    
    // Limpiar espacios múltiples
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
}
