/**
 * Servicio para obtener información financiera desde API externa
 * Este servicio realizará llamadas externas a una API financiera
 */

/**
 * Obtiene información de costos y gastos del año
 * @param {string} userId - ID del usuario
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte (ej: '2025')
 * @returns {Promise<Object>} Objeto con información de costos
 */
export async function getCostsInfo(userId, homeId, year) {
    try {
        // TODO: Implementar llamada a API financiera externa
        // const costsData = await getFinancialData(userId, homeId, year);
        
        // Mock data
        const mockCostsData = {
            actual_fee_fixed_expenses: 3500.00,
            actual_fee_usage_expenses: 1800.00,
            actual_fee_administration_cost: 500.00,
            actual_fee_taxes: 1200.00,
            actual_fee_maintenance_expenses: 1500.00,
            actual_fee_total_expenses: 8500.00,
            explanation_gf_comment: 'Gastos fijos incluyen comunidad, seguros y administración',
            explanation_gu_comment: 'Gastos de uso basados en consumo real',
            explanation_maintenance_cost: 'Mantenimiento preventivo y reparaciones menores',
            explanation_gm_comment: 'Gastos de mantenimiento del año',
            estimated_budget_deviation_explanation: 'Desviación mínima del presupuesto estimado',
            explanation_usage_cost: 'Costes de uso calculados según consumo real',
            what_vivla_cover: 'Vivla cubre administración, marketing y gestión de reservas',
            total_adjustment_amount: 500.00,
            vivla_cover: 'Administración, marketing, gestión de reservas'
        };

        return {
            status: 'success',
            data: mockCostsData
        };
    } catch (error) {
        console.error(`Error al obtener costos para usuario ${userId} y casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener los costos`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene el desglose detallado de costos (breakdown)
 * @param {string} userId - ID del usuario
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte
 * @returns {Promise<Object>} Objeto con desglose de costos
 */
export async function getCostsBreakdown(userId, homeId, year) {
    try {
        // TODO: Implementar llamada a API financiera externa
        
        // Mock data
        const mockBreakdownData = {
            actual_fee_community: 2000.00,
            actual_fee_home_insurance: 800.00,
            actual_fee_qonto: 100.00,
            actual_fee_alarm: 300.00,
            actual_fee_wifi: 300.00,
            actual_fee_cleaning: 600.00,
            actual_fee_laundry: 200.00,
            actual_fee_gas: 250.00,
            actual_fee_extra_services: 150.00,
            actual_fee_electricity: 400.00,
            actual_fee_water: 200.00,
            actual_fee_amenities: 100.00,
            actual_fee_interest_withholding_tax: 200.00,
            actual_fee_management_agency: 500.00,
            actual_fee_ibi_and_garbage: 500.00
        };

        return {
            status: 'success',
            data: mockBreakdownData
        };
    } catch (error) {
        console.error(`Error al obtener desglose de costos para usuario ${userId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener el desglose de costos`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene información de ingresos por alquiler
 * @param {string} userId - ID del usuario
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte
 * @returns {Promise<Object>} Objeto con información de ingresos
 */
export async function getRentalIncomeInfo(userId, homeId, year) {
    try {
        // TODO: Implementar llamada a API financiera externa
        
        // Mock data
        const mockIncomeData = {
            rental_income: 15000.00,
            total_rental_weeks: 8,
            average_weekly_income: 1875.00,
            annex_2_prop_pay_total_costs: 8500.00,
            annex_2_prop_pay_income_dues: 15000.00,
            annex_2_prop_pay_total_due: 6500.00
        };

        return {
            status: 'success',
            data: mockIncomeData
        };
    } catch (error) {
        console.error(`Error al obtener ingresos por alquiler para usuario ${userId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener los ingresos por alquiler`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene información de facturas y certificaciones
 * @param {string} userId - ID del usuario
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte
 * @returns {Promise<Object>} Objeto con información de facturas
 */
export async function getInvoicesInfo(userId, homeId, year) {
    try {
        // TODO: Implementar llamada a API financiera externa
        
        // Mock data
        const mockInvoicesData = {
            rental_invoice_number: 'INV-2026-001',
            rental_invoice_number_2: 'INV-2026-002',
            rental_invoice_number_3: 'INV-2026-003',
            rental_invoice_number_4: 'INV-2026-004',
            rental_invoice_complete_client_name: 'Juan Pérez García',
            rental_invoice_complete_client_name_2: 'María López Sánchez',
            rental_invoice_complete_client_name_3: 'Carlos Ruiz Martínez',
            rental_invoice_complete_client_name_4: 'Ana Torres Fernández',
            rental_invoice_client_dni: '12345678A',
            rental_invoice_client_dni_2: '87654321B',
            rental_invoice_client_dni_3: '11223344C',
            rental_invoice_client_dni_4: '44332211D',
            rental_invoice_client_address: 'Calle Principal 123, Madrid',
            rental_invoice_total_invoice: 3750.00,
            rental_invoice_total_invoice_2: 4200.00,
            rental_invoice_total_invoice_3: 3800.00,
            rental_invoice_total_invoice_4: 3250.00,
            rental_invoice_vivla_entity: 'Vivla S.L.',
            rental_invoice_vivla_nif: 'B12345678',
            rental_invoice_vivla_address: 'Avenida Ejemplo 456, Barcelona',
            certification_link: 'https://example.com/cert-1.pdf',
            certification_link_2: 'https://example.com/cert-2.pdf',
            certification_link_3: 'https://example.com/cert-3.pdf',
            certification_link_4: 'https://example.com/cert-4.pdf',
            maintenance_cost_per_owner: 1500.00,
            interest_cost_per_owner: 200.00
        };

        return {
            status: 'success',
            data: mockInvoicesData
        };
    } catch (error) {
        console.error(`Error al obtener facturas para usuario ${userId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener las facturas`,
            error: error.message,
            data: null
        };
    }
}









