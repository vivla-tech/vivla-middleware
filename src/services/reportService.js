import { getReportData, getReportDataByHomeId, getReportDataByUserId, getBreakdownData, getReportData2025, getReportData2025ByUserId, getBreakdownData2025 } from '../api/sheetDbApi.js';

export async function getReportList() {
    try {
        const reportData = await getReportData();


        return {
            status: 'success',
            data: reportData
        };
    } catch (error) {
        console.error('Error al obtener lista de reportes:', error);
        return {
            status: 'error',
            message: 'No se pudo obtener la lista de reportes',
            error: error.message
        };
    }
}

export async function getReportByHomeId(homeId) {
    try {
        const reportData = await getReportDataByHomeId(homeId);

        // Si no hay datos, retornar un mensaje específico
        if (!reportData || reportData.length === 0) {
            return {
                status: 'error',
                message: `No se encontraron reportes para la casa con ID: ${homeId}`
            };
        }

        return {
            status: 'success',
            data: reportData
        };
    } catch (error) {
        console.error(`Error al obtener reportes para la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener reportes para la casa con ID: ${homeId}`,
            error: error.message
        };
    }
}

export async function getReportByUserId(userId) {
    try {
        // Obtener reportes básicos por userId
        const reportData = await getReportDataByUserId(userId);

        // Si no hay datos, retornar un mensaje específico
        if (!reportData || reportData.length === 0) {
            return {
                status: 'error',
                message: `No se encontraron reportes para el usuario con ID: ${userId}`
            };
        }

        // Obtener datos detallados de la pestaña Detail
        const detailData = await getBreakdownData();

        // Filtrar los detalles que coincidan exactamente con el user_id
        const matchingDetails = detailData.filter(detail => detail.user_id === userId);

        // Enriquecer los datos del reporte con los detalles o mensaje informativo
        const enrichedData = reportData.map(report => {
            if (matchingDetails.length > 0) {
                // Si hay coincidencia, incluir los datos de desglose
                return {
                    ...report,
                    breakdown: matchingDetails[0]
                };
            } else {
                // Si no hay coincidencia, incluir mensaje informativo
                return {
                    ...report,
                    breakdown: { message: "No se encontró desglose" }
                };
            }
        });

        return {
            status: 'success',
            data: enrichedData
        };
    } catch (error) {
        console.error(`Error al obtener reportes para el usuario ${userId}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener reportes para el usuario con ID: ${userId}`,
            error: error.message
        };
    }
}


export async function getReport2025() {
    try {
        const reportData = await getReportData2025();

        return {
            status: 'success',
            data: reportData
        };
    }
    catch (error) {
        console.error('Error al obtener reportes 2025:', error);
        return {
            status: 'error',
            message: 'No se pudo obtener los reportes 2025',
            error: error.message
        };
    }
}

export async function getReport2025ByUserId(userId) {
    try {
        const reportData = await getReportData2025ByUserId(userId);

        const breakdownData = await getBreakdownData2025();

        const enrichedData = reportData.map(report => {
            const breakdown = breakdownData.find(detail => detail.user_id === report.user_id);
            return {
                ...report,
                breakdown: breakdown || { message: "No se encontró desglose" }
            };
        });

        return {
            status: 'success',
            data: enrichedData
        };
    }
    catch (error) {
        console.error('Error al obtener reportes 2025 por usuario:', error);
        return {
            status: 'error',
            message: 'No se pudo obtener los reportes 2025 por usuario',
            error: error.message
        };
    }
}

export async function getReport2026() {
    try {
        // Mock data para el reporte 2026
        const mockReportData = [
            {
                // ReportHeader
                user_name: 'Juan Pérez',
                home_main_img: 'https://example.com/home-main.jpg',
                
                // YearSummarySection
                last_year_total_days_enjoyed: 45,
                last_year_total_market_price: 12500.00,
                last_year_market_price_per_night: 277.78,
                last_year_exchanges_number: 3,
                last_year_market_exchange_price: 8500.00,
                last_year_your_weeks_listed_for_rent: 8,
                last_year_rental_income: 15000.00,
                last_year_price_increase_percentage_sales: 5.2,
                last_year_national_cpi_percentage: 3.1,
                last_year_total_occupancy: 78.5,
                last_year_total_stays_number: 12,
                last_year_expected_expenses: 8500.00,
                
                // HomeEvolutionSection
                last_year_purchase_price: 250000.00,
                last_year_estimated_value: 275000.00,
                last_year_revaluation: 10.0,
                
                // ImprovementsSection
                home_id: 'HOME001',
                last_year_stay_valoration: 4.8,
                last_year_experience_valoration: 4.9,
                last_year_last_comments: 'Excelente experiencia, la casa está en perfecto estado',
                last_year_resolved_tickets: 5,
                last_year_pending_tickets: 1,
                last_year_in_valoration_tickets: 0,
                improvements_made_total_number: 3,
                repairs_total_number: 2,
                improvements_made_breakdown: 'Renovación baño, Instalación aire acondicionado, Mejora iluminación',
                repairs_made_breakdown: 'Reparación caldera, Sustitución persianas',
                home_repairs_img: 'https://example.com/repairs.jpg',
                
                // CostsSection - Del objeto principal
                last_year_actual_fee_fixed_expenses: 3500.00,
                last_year_actual_fee_usage_expenses: 1800.00,
                last_year_actual_fee_administration_cost: 500.00,
                last_year_actual_fee_taxes: 1200.00,
                last_year_actual_fee_maintenance_expenses: 1500.00,
                last_year_actual_fee_total_expenses: 8500.00,
                last_year_explanation_gf_comment: 'Gastos fijos incluyen comunidad, seguros y administración',
                last_year_explanation_gu_comment: 'Gastos de uso basados en consumo real',
                last_year_explanation_maintenance_cost: 'Mantenimiento preventivo y reparaciones menores',
                last_year_explanation_gm_comment: 'Gastos de mantenimiento del año',
                last_year_estimated_budget_deviation_explanation: 'Desviación mínima del presupuesto estimado',
                last_year_explanation_usage_cost: 'Costes de uso calculados según consumo real',
                last_year_what_vivla_cover: 'Vivla cubre administración, marketing y gestión de reservas',
                last_year_total_adjustment_amount: 500.00,
                last_year_rental_income: 15000.00,
                annex_2_prop_pay_total_costs: 8500.00,
                annex_2_prop_pay_income_dues: 15000.00,
                annex_2_prop_pay_total_due: 6500.00,
                vivla_cover: 'Administración, marketing, gestión de reservas',
                bank_account: 'ES91 2100 0418 4502 0005 1332',
                annex_1_rental_invoice_vivla_entity: 'Vivla S.L.',
                maintenance_cost_per_owner: 1500.00,
                interest_cost_per_owner: 200.00,
                
                // CostsSection - Del breakdown (se incluirá en el objeto breakdown)
                
                // InvoicesSection
                annex_1_rental_invoice_number: 'INV-2026-001',
                annex_1_rental_invoice_number_2: 'INV-2026-002',
                annex_1_rental_invoice_number_3: 'INV-2026-003',
                annex_1_rental_invoice_number_4: 'INV-2026-004',
                annex_1_rental_invoice_complete_client_name: 'Juan Pérez García',
                annex_1_rental_invoice_complete_client_name_2: 'María López Sánchez',
                annex_1_rental_invoice_complete_client_name_3: 'Carlos Ruiz Martínez',
                annex_1_rental_invoice_complete_client_name_4: 'Ana Torres Fernández',
                annex_1_rental_invoice_client_dni: '12345678A',
                annex_1_rental_invoice_client_dni_2: '87654321B',
                annex_1_rental_invoice_client_dni_3: '11223344C',
                annex_1_rental_invoice_client_dni_4: '44332211D',
                annex_1_rental_invoice_client_address: 'Calle Principal 123, Madrid',
                annex_1_rental_invoice_total_invoice: 3750.00,
                annex_1_rental_invoice_total_invoice_2: 4200.00,
                annex_1_rental_invoice_total_invoice_3: 3800.00,
                annex_1_rental_invoice_total_invoice_4: 3250.00,
                annex_1_rental_invoice_vivla_entity: 'Vivla S.L.',
                annex_1_rental_invoice_vivla_nif: 'B12345678',
                annex_1_rental_invoice_vivla_address: 'Avenida Ejemplo 456, Barcelona',
                report_date: '2026-01-15',
                certification_link: 'https://example.com/cert-1.pdf',
                certification_link_2: 'https://example.com/cert-2.pdf',
                certification_link_3: 'https://example.com/cert-3.pdf',
                certification_link_4: 'https://example.com/cert-4.pdf',
                
                // FullscreenCarousel / slides.ts
                destination: 'Costa Brava',
                video_url: 'https://example.com/video.mp4',
                
                // FeedbackModal
                user_id: 'USER001',
                user_panel_email: 'juan.perez@example.com',
                
                // Breakdown para CostsSection
                breakdown: {
                    last_year_actual_fee_community: 2000.00,
                    last_year_actual_fee_home_insurance: 800.00,
                    last_year_actual_fee_qonto: 100.00,
                    last_year_actual_fee_alarm: 300.00,
                    last_year_actual_fee_wifi: 300.00,
                    last_year_actual_fee_cleaning: 600.00,
                    last_year_actual_fee_laundry: 200.00,
                    last_year_actual_fee_gas: 250.00,
                    last_year_actual_fee_extra_services: 150.00,
                    last_year_actual_fee_electricity: 400.00,
                    last_year_actual_fee_water: 200.00,
                    last_year_actual_fee_amenities: 100.00,
                    last_year_actual_fee_interest_withholding_tax: 200.00,
                    last_year_actual_fee_management_agency: 500.00,
                    last_year_actual_fee_ibi_and_garbage: 500.00
                }
            }
        ];

        return {
            status: 'success',
            data: mockReportData
        };
    }
    catch (error) {
        console.error('Error al obtener reportes 2026:', error);
        return {
            status: 'error',
            message: 'No se pudo obtener los reportes 2026',
            error: error.message
        };
    }
}

import { getHouseInfo, getHouseStats } from './report/houseReportService.js';
import { getUserInfo, getUserStaysInfo, getUserExchangesInfo } from './report/userStaysReportService.js';
import { getHouseTicketsInfo, getImprovementsAndRepairsInfo, getStayValorationsInfo } from './report/ticketsReportService.js';
import { getCostsInfo, getCostsBreakdown, getRentalIncomeInfo, getInvoicesInfo } from './report/financialReportService.js';

export async function getReport2026ByUserAndHome(userEmail, homeName) {
    try {
        const year = '2025'; // Año del reporte (último año completado)

        // Llamadas paralelas a todos los servicios auxiliares
        const [
            houseInfoResult,
            houseStatsResult,
            userInfoResult,
            userStaysResult,
            userExchangesResult,
            ticketsResult,
            improvementsResult,
            valorationsResult,
            costsResult,
            costsBreakdownResult,
            rentalIncomeResult,
            invoicesResult
        ] = await Promise.all([
            getHouseInfo(homeName),
            getHouseStats(homeName, year),
            getUserInfo(userEmail),
            getUserStaysInfo(userEmail, homeName, year),
            getUserExchangesInfo(userEmail, homeName, year),
            getHouseTicketsInfo(homeName, year),
            getImprovementsAndRepairsInfo(homeName, year),
            getStayValorationsInfo(homeName, year),
            getCostsInfo(userEmail, homeName, year),
            getCostsBreakdown(userEmail, homeName, year),
            getRentalIncomeInfo(userEmail, homeName, year),
            getInvoicesInfo(userEmail, homeName, year)
        ]);

        // Validar que todos los servicios respondieron correctamente
        const servicesResults = [
            houseInfoResult, houseStatsResult, userInfoResult, userStaysResult,
            userExchangesResult, ticketsResult, improvementsResult, valorationsResult,
            costsResult, costsBreakdownResult, rentalIncomeResult, invoicesResult
        ];

        const failedServices = servicesResults.filter(result => result.status === 'error');
        if (failedServices.length > 0) {
            console.error('Algunos servicios fallaron:', failedServices);
            // Continuar con los datos disponibles, pero loguear el error
        }

        // Extraer datos de cada servicio (usar datos mock si hay error)
        const houseInfo = houseInfoResult.data || {};
        const houseStats = houseStatsResult.data || {};
        const userInfo = userInfoResult.data || {};
        const userStays = userStaysResult.data || {};
        const userExchanges = userExchangesResult.data || {};
        const tickets = ticketsResult.data || {};
        const improvements = improvementsResult.data || {};
        const valorations = valorationsResult.data || {};
        const costs = costsResult.data || {};
        const costsBreakdown = costsBreakdownResult.data || {};
        const rentalIncome = rentalIncomeResult.data || {};
        const invoices = invoicesResult.data || {};

        // Construir el objeto de respuesta combinando todos los datos
        const reportData = {
            // ReportHeader
            user_name: userInfo.user_name || 'Usuario desconocido',
            home_main_img: houseInfo.home_main_img || '',
            
            // YearSummarySection
            last_year_total_days_enjoyed: houseStats.total_days_enjoyed || 0,
            last_year_total_market_price: houseStats.total_market_price || 0,
            last_year_market_price_per_night: houseStats.market_price_per_night || 0,
            last_year_exchanges_number: userExchanges.total_exchanges || 0,
            last_year_market_exchange_price: userExchanges.total_exchange_value || 0,
            last_year_your_weeks_listed_for_rent: rentalIncome.total_rental_weeks || 0,
            last_year_rental_income: rentalIncome.rental_income || 0,
            last_year_price_increase_percentage_sales: houseStats.price_increase_percentage_sales || 0,
            last_year_national_cpi_percentage: houseStats.national_cpi_percentage || 0,
            last_year_total_occupancy: houseStats.total_occupancy || 0,
            last_year_total_stays_number: houseStats.total_stays_number || 0,
            last_year_expected_expenses: houseStats.expected_expenses || 0,
            
            // HomeEvolutionSection
            last_year_purchase_price: houseInfo.purchase_price || 0,
            last_year_estimated_value: houseInfo.estimated_value || 0,
            last_year_revaluation: houseInfo.revaluation || 0,
            
            // ImprovementsSection
            home_id: homeName,
            last_year_stay_valoration: valorations.stay_valoration || 0,
            last_year_experience_valoration: valorations.experience_valoration || 0,
            last_year_last_comments: valorations.last_comments || '',
            last_year_resolved_tickets: tickets.resolved_tickets || 0,
            last_year_pending_tickets: tickets.pending_tickets || 0,
            last_year_in_valoration_tickets: tickets.in_valoration_tickets || 0,
            improvements_made_total_number: improvements.improvements_made_total_number || 0,
            repairs_total_number: improvements.repairs_total_number || 0,
            improvements_made_breakdown: improvements.improvements_made_breakdown || '',
            repairs_made_breakdown: improvements.repairs_made_breakdown || '',
            home_repairs_img: houseInfo.home_repairs_img || '',
            
            // CostsSection - Del objeto principal
            last_year_actual_fee_fixed_expenses: costs.actual_fee_fixed_expenses || 0,
            last_year_actual_fee_usage_expenses: costs.actual_fee_usage_expenses || 0,
            last_year_actual_fee_administration_cost: costs.actual_fee_administration_cost || 0,
            last_year_actual_fee_taxes: costs.actual_fee_taxes || 0,
            last_year_actual_fee_maintenance_expenses: costs.actual_fee_maintenance_expenses || 0,
            last_year_actual_fee_total_expenses: costs.actual_fee_total_expenses || 0,
            last_year_explanation_gf_comment: costs.explanation_gf_comment || '',
            last_year_explanation_gu_comment: costs.explanation_gu_comment || '',
            last_year_explanation_maintenance_cost: costs.explanation_maintenance_cost || '',
            last_year_explanation_gm_comment: costs.explanation_gm_comment || '',
            last_year_estimated_budget_deviation_explanation: costs.estimated_budget_deviation_explanation || '',
            last_year_explanation_usage_cost: costs.explanation_usage_cost || '',
            last_year_what_vivla_cover: costs.what_vivla_cover || '',
            last_year_total_adjustment_amount: costs.total_adjustment_amount || 0,
            last_year_rental_income: rentalIncome.rental_income || 0,
            annex_2_prop_pay_total_costs: rentalIncome.annex_2_prop_pay_total_costs || 0,
            annex_2_prop_pay_income_dues: rentalIncome.annex_2_prop_pay_income_dues || 0,
            annex_2_prop_pay_total_due: rentalIncome.annex_2_prop_pay_total_due || 0,
            vivla_cover: costs.vivla_cover || '',
            bank_account: 'ES91 2100 0418 4502 0005 1332', // TODO: Obtener de servicio financiero
            annex_1_rental_invoice_vivla_entity: invoices.rental_invoice_vivla_entity || 'Vivla S.L.',
            maintenance_cost_per_owner: invoices.maintenance_cost_per_owner || 0,
            interest_cost_per_owner: invoices.interest_cost_per_owner || 0,
            
            // InvoicesSection
            annex_1_rental_invoice_number: invoices.rental_invoice_number || '',
            annex_1_rental_invoice_number_2: invoices.rental_invoice_number_2 || '',
            annex_1_rental_invoice_number_3: invoices.rental_invoice_number_3 || '',
            annex_1_rental_invoice_number_4: invoices.rental_invoice_number_4 || '',
            annex_1_rental_invoice_complete_client_name: invoices.rental_invoice_complete_client_name || '',
            annex_1_rental_invoice_complete_client_name_2: invoices.rental_invoice_complete_client_name_2 || '',
            annex_1_rental_invoice_complete_client_name_3: invoices.rental_invoice_complete_client_name_3 || '',
            annex_1_rental_invoice_complete_client_name_4: invoices.rental_invoice_complete_client_name_4 || '',
            annex_1_rental_invoice_client_dni: invoices.rental_invoice_client_dni || '',
            annex_1_rental_invoice_client_dni_2: invoices.rental_invoice_client_dni_2 || '',
            annex_1_rental_invoice_client_dni_3: invoices.rental_invoice_client_dni_3 || '',
            annex_1_rental_invoice_client_dni_4: invoices.rental_invoice_client_dni_4 || '',
            annex_1_rental_invoice_client_address: invoices.rental_invoice_client_address || '',
            annex_1_rental_invoice_total_invoice: invoices.rental_invoice_total_invoice || 0,
            annex_1_rental_invoice_total_invoice_2: invoices.rental_invoice_total_invoice_2 || 0,
            annex_1_rental_invoice_total_invoice_3: invoices.rental_invoice_total_invoice_3 || 0,
            annex_1_rental_invoice_total_invoice_4: invoices.rental_invoice_total_invoice_4 || 0,
            annex_1_rental_invoice_vivla_nif: invoices.rental_invoice_vivla_nif || '',
            annex_1_rental_invoice_vivla_address: invoices.rental_invoice_vivla_address || '',
            report_date: new Date().toISOString().split('T')[0],
            certification_link: invoices.certification_link || '',
            certification_link_2: invoices.certification_link_2 || '',
            certification_link_3: invoices.certification_link_3 || '',
            certification_link_4: invoices.certification_link_4 || '',
            
            // FullscreenCarousel / slides.ts
            destination: houseInfo.destination || '',
            video_url: 'https://example.com/video.mp4', // TODO: Obtener de servicio de casa
            
            // FeedbackModal
            user_id: userEmail,
            user_panel_email: userInfo.user_panel_email || '',
            
            // Breakdown para CostsSection
            breakdown: {
                last_year_actual_fee_community: costsBreakdown.actual_fee_community || 0,
                last_year_actual_fee_home_insurance: costsBreakdown.actual_fee_home_insurance || 0,
                last_year_actual_fee_qonto: costsBreakdown.actual_fee_qonto || 0,
                last_year_actual_fee_alarm: costsBreakdown.actual_fee_alarm || 0,
                last_year_actual_fee_wifi: costsBreakdown.actual_fee_wifi || 0,
                last_year_actual_fee_cleaning: costsBreakdown.actual_fee_cleaning || 0,
                last_year_actual_fee_laundry: costsBreakdown.actual_fee_laundry || 0,
                last_year_actual_fee_gas: costsBreakdown.actual_fee_gas || 0,
                last_year_actual_fee_extra_services: costsBreakdown.actual_fee_extra_services || 0,
                last_year_actual_fee_electricity: costsBreakdown.actual_fee_electricity || 0,
                last_year_actual_fee_water: costsBreakdown.actual_fee_water || 0,
                last_year_actual_fee_amenities: costsBreakdown.actual_fee_amenities || 0,
                last_year_actual_fee_interest_withholding_tax: costsBreakdown.actual_fee_interest_withholding_tax || 0,
                last_year_actual_fee_management_agency: costsBreakdown.actual_fee_management_agency || 0,
                last_year_actual_fee_ibi_and_garbage: costsBreakdown.actual_fee_ibi_and_garbage || 0
            }
        };

        return {
            status: 'success',
            data: [reportData]
        };
    }
    catch (error) {
        console.error(`Error al obtener reportes 2026 para el usuario ${userEmail} y casa ${homeName}:`, error);
        return {
            status: 'error',
            message: `No se pudo obtener los reportes 2026 para el usuario con ID: ${userEmail} y casa: ${homeName}`,
            error: error.message
        };
    }
}


