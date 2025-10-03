#!/usr/bin/env node

/**
 * Script para probar CORS específicamente para report.vivla.com
 * Ejecutar con: node test-cors-report.js
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

const testOrigins = [
    'https://report.vivla.com',
    'https://www.report.vivla.com',
    'https://hx.vivla.com',
    'https://www.hx.vivla.com',
    'http://localhost:3000',
    'https://unauthorized-domain.com' // Este debería fallar
];

async function testCORS(origin) {
    console.log(`\n🧪 Probando CORS para origin: ${origin}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/v1/report/2025/list`, {
            method: 'OPTIONS',
            headers: {
                'Origin': origin,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'X-API-Key, Content-Type'
            }
        });

        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        };

        if (response.status === 200) {
            console.log('✅ CORS permitido');
            console.log('📋 Headers CORS:', corsHeaders);
        } else {
            console.log('❌ CORS denegado');
            console.log('📋 Status:', response.status);
        }

    } catch (error) {
        console.log('❌ Error en la prueba:', error.message);
    }
}

async function testActualRequest(origin) {
    console.log(`\n🚀 Probando request real desde: ${origin}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/v1/report/2025/list`, {
            method: 'GET',
            headers: {
                'Origin': origin,
                'X-API-Key': 'test-key', // Ajusta según tu configuración
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Request exitoso');
            console.log('📋 Status:', response.status);
            console.log('📋 Data count:', data.data ? data.data.length : 'N/A');
        } else {
            console.log('❌ Request falló');
            console.log('📋 Status:', response.status);
            console.log('📋 Error:', data.message || 'Sin mensaje de error');
        }

    } catch (error) {
        console.log('❌ Error en request:', error.message);
    }
}

async function testReportEndpoints(origin) {
    console.log(`\n📊 Probando endpoints de reportes desde: ${origin}`);
    
    const endpoints = [
        '/v1/report/2024/list',
        '/v1/report/2025/list',
        '/v1/report/2024/user/test-user-123',
        '/v1/report/2025/user/test-user-123'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Origin': origin,
                    'X-API-Key': 'test-key',
                    'Content-Type': 'application/json'
                }
            });

            console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log(`    Error: ${errorData.message || 'Sin mensaje'}`);
            }
        } catch (error) {
            console.log(`  ${endpoint}: Error - ${error.message}`);
        }
    }
}

async function runTests() {
    console.log('🔧 Iniciando pruebas de CORS para report.vivla.com...');
    console.log(`🌐 API URL: ${API_BASE_URL}`);
    
    // Verificar que el servidor esté funcionando
    try {
        const healthCheck = await fetch(`${API_BASE_URL}/`);
        if (!healthCheck.ok) {
            console.log('❌ El servidor no está respondiendo. Asegúrate de que esté ejecutándose en el puerto correcto.');
            return;
        }
        console.log('✅ Servidor respondiendo correctamente');
    } catch (error) {
        console.log('❌ No se puede conectar al servidor:', error.message);
        console.log('💡 Asegúrate de ejecutar: npm start o npm run dev');
        return;
    }

    // Probar CORS para cada origin
    for (const origin of testOrigins) {
        await testCORS(origin);
        
        // Solo probar request real para origins permitidos
        if (origin !== 'https://unauthorized-domain.com') {
            await testActualRequest(origin);
            await testReportEndpoints(origin);
        }
        
        // Pausa entre pruebas
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✨ Pruebas completadas');
    console.log('\n📚 Si report.vivla.com funciona correctamente, deberías ver:');
    console.log('   ✅ CORS permitido para https://report.vivla.com');
    console.log('   ✅ Request exitoso desde https://report.vivla.com');
    console.log('   ✅ Endpoints de reportes respondiendo correctamente');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { testCORS, testActualRequest, testReportEndpoints };
