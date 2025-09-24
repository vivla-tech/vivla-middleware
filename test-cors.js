#!/usr/bin/env node

/**
 * Script para probar la configuración de CORS
 * Ejecutar con: node test-cors.js
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

const testOrigins = [
    'http://localhost:3000',
    'https://hx.vivla.com',
    'https://unauthorized-domain.com' // Este debería fallar
];

async function testCORS(origin) {
    console.log(`\n🧪 Probando CORS para origin: ${origin}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/proposals`, {
            method: 'OPTIONS',
            headers: {
                'Origin': origin,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, X-API-Key'
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
        const formData = new FormData();
        formData.append('proposal', 'Test proposal from CORS test');
        formData.append('investment', '100-500');

        const response = await fetch(`${API_BASE_URL}/api/proposals`, {
            method: 'POST',
            headers: {
                'Origin': origin,
                'X-API-Key': 'test-key' // Ajusta según tu configuración
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Request exitoso');
            console.log('📋 Response:', data);
        } else {
            console.log('❌ Request falló');
            console.log('📋 Status:', response.status);
            console.log('📋 Error:', data);
        }

    } catch (error) {
        console.log('❌ Error en request:', error.message);
    }
}

async function runTests() {
    console.log('🔧 Iniciando pruebas de CORS...');
    console.log(`🌐 API URL: ${API_BASE_URL}`);
    
    for (const origin of testOrigins) {
        await testCORS(origin);
        
        // Solo probar request real para origins permitidos
        if (origin !== 'https://unauthorized-domain.com') {
            await testActualRequest(origin);
        }
        
        // Pausa entre pruebas
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✨ Pruebas completadas');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { testCORS, testActualRequest };
