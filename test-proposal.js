#!/usr/bin/env node

/**
 * Script de prueba para el endpoint de propuestas
 * Ejecutar con: node test-proposal.js
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Función para crear una propuesta simple (JSON)
async function testSimpleProposal() {
    console.log('\n🧪 Probando propuesta simple (JSON)...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            },
            body: JSON.stringify({
                proposal: "La piscina debería tener más iluminación nocturna para mejorar la experiencia de los huéspedes durante las noches de verano. Esto incluiría luces LED sumergibles y iluminación perimetral.",
                investment: "100-500"
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Propuesta creada exitosamente');
            console.log('📋 ID:', data.proposalId);
            console.log('📋 Mensaje:', data.message);
        } else {
            console.log('❌ Error:', data.message);
            if (data.errors) {
                console.log('📋 Errores:', data.errors);
            }
        }
        
        return data;
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        return null;
    }
}

// Función para crear una propuesta con archivos (FormData)
async function testProposalWithFiles() {
    console.log('\n🧪 Probando propuesta con archivos (FormData)...');
    
    try {
        const formData = new FormData();
        formData.append('proposal', 'Instalación de sistema de riego automático en el jardín para mantener las plantas siempre hidratadas y reducir el trabajo manual.');
        formData.append('investment', '500-1000');

        // Crear archivos de prueba si no existen
        const testFiles = await createTestFiles();
        
        if (testFiles.length > 0) {
            testFiles.forEach(filePath => {
                formData.append('files', fs.createReadStream(filePath));
            });
            console.log(`📁 Agregando ${testFiles.length} archivos de prueba`);
        }

        const response = await fetch(`${API_BASE_URL}/api/proposals`, {
            method: 'POST',
            headers: {
                'Origin': 'http://localhost:3000',
                ...formData.getHeaders()
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Propuesta con archivos creada exitosamente');
            console.log('📋 ID:', data.proposalId);
            console.log('📋 URLs de archivos:', data.fileUrls);
        } else {
            console.log('❌ Error:', data.message);
            if (data.errors) {
                console.log('📋 Errores:', data.errors);
            }
        }
        
        return data;
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        return null;
    }
}

// Función para crear archivos de prueba
async function createTestFiles() {
    const testDir = './test-files';
    const files = [];
    
    try {
        // Crear directorio si no existe
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }

        // Crear archivo de texto de prueba
        const textFile = path.join(testDir, 'test-proposal.txt');
        fs.writeFileSync(textFile, 'Este es un archivo de prueba para la propuesta de mejora del hogar.');
        files.push(textFile);

        // Crear archivo JSON de prueba
        const jsonFile = path.join(testDir, 'test-data.json');
        fs.writeFileSync(jsonFile, JSON.stringify({
            proposal: 'Datos adicionales de la propuesta',
            timestamp: new Date().toISOString()
        }, null, 2));
        files.push(jsonFile);

        console.log(`📁 Archivos de prueba creados en ${testDir}`);
        
    } catch (error) {
        console.log('⚠️ No se pudieron crear archivos de prueba:', error.message);
    }
    
    return files;
}

// Función para probar validaciones
async function testValidations() {
    console.log('\n🧪 Probando validaciones...');
    
    const testCases = [
        {
            name: 'Propuesta muy corta',
            data: { proposal: 'Corto', investment: '100-500' },
            expectedError: 'La propuesta debe tener al menos 10 caracteres'
        },
        {
            name: 'Inversión inválida',
            data: { proposal: 'Esta es una propuesta válida con suficiente texto', investment: 'invalid' },
            expectedError: 'La inversión debe ser uno de los valores válidos'
        },
        {
            name: 'Propuesta vacía',
            data: { proposal: '', investment: '100-500' },
            expectedError: 'La propuesta es requerida'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n🔍 Probando: ${testCase.name}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'http://localhost:3000'
                },
                body: JSON.stringify(testCase.data)
            });

            const data = await response.json();
            
            if (!data.success) {
                console.log('✅ Validación funcionando correctamente');
                console.log('📋 Error esperado:', testCase.expectedError);
                console.log('📋 Error recibido:', data.message);
            } else {
                console.log('❌ Validación falló - debería haber rechazado la propuesta');
            }
        } catch (error) {
            console.log('❌ Error de red:', error.message);
        }
    }
}

// Función para obtener todas las propuestas
async function testGetProposals() {
    console.log('\n🧪 Probando GET /api/proposals...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/proposals`, {
            method: 'GET',
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Propuestas obtenidas exitosamente');
            console.log('📋 Total de propuestas:', data.count);
            console.log('📋 Primeras 3 propuestas:');
            data.proposals.slice(0, 3).forEach((prop, index) => {
                console.log(`   ${index + 1}. ${prop.proposal.substring(0, 50)}... (${prop.investment})`);
            });
        } else {
            console.log('❌ Error:', data.message);
        }
        
        return data;
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        return null;
    }
}

// Función principal
async function runAllTests() {
    console.log('🚀 Iniciando pruebas del endpoint de propuestas...');
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

    // Ejecutar todas las pruebas
    await testSimpleProposal();
    await testProposalWithFiles();
    await testValidations();
    await testGetProposals();
    
    console.log('\n✨ Todas las pruebas completadas');
    console.log('\n📚 Para más ejemplos, revisa el archivo EJEMPLOS_POST.md');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { testSimpleProposal, testProposalWithFiles, testValidations, testGetProposals };
