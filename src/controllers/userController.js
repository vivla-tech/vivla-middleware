import { getUserIdByEmail } from '../services/firebase/userService.js';
import { getDealsByUserId } from '../services/firebase/dealService.js';
import { getHouseNameById } from '../services/firebase/houseService.js';

/**
 * Obtiene los deals de un usuario a partir de su email
 * Incluye información de las casas asociadas a cada deal
 */
export async function getUserDealsByEmailController(req, res) {
    try {
        const { email } = req.params;

        // Validar que el email viene correctamente
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el email del usuario'
            });
        }

        // Validar formato básico de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'El formato del email no es válido'
            });
        }

        console.log(`Buscando deals para usuario con email: ${email}`);

        // 1. Buscar el UID del usuario a partir del email
        const uid = await getUserIdByEmail(email);
        
        if (!uid) {
            return res.status(404).json({
                status: 'error',
                message: `No se encontró un usuario con el email: ${email}`
            });
        }

        console.log(`UID encontrado para ${email}: ${uid}`);

        // 2. Buscar los deals del usuario
        const dealsResult = await getDealsByUserId(uid);
        
        if (dealsResult.status === 'error') {
            return res.status(500).json({
                status: 'error',
                message: `Error al obtener deals para el usuario ${email}`,
                error: dealsResult.message
            });
        }

        // Si no hay deals, devolver respuesta vacía
        if (!dealsResult.data || dealsResult.data.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: `No se encontraron deals para el usuario ${email}`,
                data: [],
                count: 0
            });
        }

        console.log(`Encontrados ${dealsResult.data.length} deals para el usuario ${uid}`);

        // 3. Enriquecer cada deal con información de la casa y filtrar campos no deseados
        const enrichedDeals = await Promise.all(
            dealsResult.data.map(async (deal) => {
                try {
                    let houseName = null;
                    
                    // Si el deal tiene un hid, buscar el nombre de la casa
                    if (deal.hid) {
                        try {
                            houseName = await getHouseNameById(deal.hid);
                        } catch (houseError) {
                            console.warn(`No se pudo obtener nombre de casa para hid ${deal.hid}:`, houseError.message);
                            houseName = 'Casa no encontrada';
                        }
                    }

                    // Filtrar campos no deseados y retornar el deal enriquecido
                    const { calendar_status, ge, lock_calendar, ...filteredDeal } = deal;
                    
                    return {
                        ...filteredDeal,
                        house_name: houseName
                    };
                } catch (error) {
                    console.error(`Error al procesar deal ${deal.id}:`, error);
                    // Retornar el deal sin información de casa en caso de error
                    const { calendar_status, ge, lock_calendar, ...filteredDeal } = deal;
                    return {
                        ...filteredDeal,
                        house_name: 'Error al obtener información de casa'
                    };
                }
            })
        );

        console.log(`Deals procesados exitosamente para ${email}`);

        // 4. Devolver respuesta con deals enriquecidos
        return res.status(200).json({
            status: 'success',
            message: `Deals obtenidos exitosamente para ${email}`,
            data: enrichedDeals,
            count: enrichedDeals.length,
            user: {
                email: email,
                uid: uid
            }
        });

    } catch (error) {
        console.error('Error en getUserDealsByEmailController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la solicitud',
            error: error.message
        });
    }
} 