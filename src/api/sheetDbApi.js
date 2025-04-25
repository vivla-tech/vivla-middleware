import axios from 'axios';


// Función base para realizar peticiones a la API de SheetDB

export async function fetchSheetDbData(endpoint = '') {
    try {
        const response = await axios.get(`https://sheetdb.io/api/v1/u5m680ezu4x1o${endpoint}`);

        // Limpieza de datos - eliminar campo import_range_cell de todos los objetos
        if (Array.isArray(response.data)) {
            return response.data.map(item => {
                const { import_range_cell, ...cleanItem } = item;
                return cleanItem;
            });
        }

        // Si la respuesta no es un array, devolverla sin modificar
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos de SheetDB:', error);
        throw error;
    }
}


export async function getReportData() {
    return fetchSheetDbData();
}


export async function getReportDataByHomeId(homeId) {
    return fetchSheetDbData(`/search?home_id=${homeId}`);
}


export async function getReportDataByUserId(userId) {
    return fetchSheetDbData(`/search?user_id=${userId}`);
}


export async function getBreakdownData() {
    return fetchSheetDbData('?sheet=sync-detail');
}

// Función auxiliar para seleccionar campos específicos
function selectFields(data, fields) {
    if (!Array.isArray(data)) return data;

    return data.map(item => {
        const filteredItem = {};
        fields.forEach(field => {
            if (item.hasOwnProperty(field)) {
                filteredItem[field] = item[field];
            }
        });
        return filteredItem;
    });
}

export async function getReportData2025() {
    const selectedFields = [
        'user_id',
        'home_id',
        'user_name',
        'destination',
        'fraction_number',
        'number_of_fractions',
        'total_adjustment_amount_2024',
        'fixed_expenses',
        'usage_expenses',
        'total_expenses',
        'fee',
        'overdue_fees_january_april',
        'overdue_fees_comment',
        'annual_tax_payment',
        'annual_tax_payment_per_client',
        'special_assessments',
        'improvements',
        'overdue_fees_2025',
        'total_to_pay_12_31_2024',
        'referrals_and_others',
        'referrals_and_others_comment',
        'total_to_pay_04_30_2025',
        'bank_account',
        'stripe_link_monthly_fee'
    ];

    const data = await fetchSheetDbData('?sheet=report-2025');
    return selectFields(data, selectedFields);
}


export async function getReportData2025ByUserId(userId) {
    const selectedFields = [
        'user_id',
        'home_id',
        'user_name',
        'destination',
        'fraction_number',
        'number_of_fractions',
        'total_adjustment_amount_2024',
        'fixed_expenses',
        'usage_expenses',
        'total_expenses',
        'fee',
        'overdue_fees_january_april',
        'overdue_fees_comment',
        'annual_tax_payment',
        'annual_tax_payment_per_client',
        'special_assessments',
        'improvements',
        'overdue_fees_2025',
        'total_to_pay_12_31_2024',
        'referrals_and_others',
        'referrals_and_others_comment',
        'total_to_pay_04_30_2025',
        'bank_account',
        'stripe_link_monthly_fee'
    ];

    // Obtener todos los datos
    const allData = await fetchSheetDbData('?sheet=report-2025');

    // Filtrar por userId
    const filteredData = allData.filter(item => item.user_id === userId);

    // Aplicar la selección de campos
    return selectFields(filteredData, selectedFields);
}



export async function getBreakdownData2025() {
    const selectedFields = [
        'user_id',
        'next_year_fixed_expenses_total',
        'next_year_budget_community',
        'next_year_budget_vivla_community',
        'next_year_budget_home_insurance',
        'next_year_budget_qonto',
        'next_year_budget_alarm',
        'next_year_budget_wifi',
        'next_year_budget_total_usage_expenses',
        'next_year_budget_cleaning',
        'next_year_budget_laundry',
        'next_year_budget_gas',
        'next_year_budget_extra_services',
        'next_year_budget_electricity',
        'next_year_budget_water',
        'next_year_budget_amenities',
        'next_year_budget_maintenance',
        'next_year_budget_total_expenses',
        'next_year_budget_total_taxes',
        'next_year_budget_interest_withholding_tax',
        'next_year_budget_management_agency',
        'next_year_budget_ibi_and_garbage'
    ]

    const data = await fetchSheetDbData('?sheet=report-2025-details');
    return selectFields(data, selectedFields);
}

