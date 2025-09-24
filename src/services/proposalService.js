import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

class ProposalService {
    constructor() {
        this.collectionName = 'hx-proposals';
    }

    /**
     * Valida los datos de entrada de una propuesta
     * @param {Object} data - Datos de la propuesta
     * @returns {Object} - Resultado de la validación
     */
    validateProposalData(data) {
        const errors = [];

        // Validar proposal
        if (!data.proposal || typeof data.proposal !== 'string') {
            errors.push('La propuesta es requerida');
        } else if (data.proposal.trim().length < 10) {
            errors.push('La propuesta debe tener al menos 10 caracteres');
        }

        // Validar investment
        const validInvestments = ['0-100', '100-500', '500-1000', '1000-5000', '5000+'];
        if (!data.investment || !validInvestments.includes(data.investment)) {
            errors.push('La inversión debe ser uno de los valores válidos: ' + validInvestments.join(', '));
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Sube archivos a Firebase Storage
     * @param {Array} files - Array de archivos
     * @param {string} proposalId - ID de la propuesta
     * @returns {Promise<Array>} - Array de URLs de los archivos subidos
     */
    async uploadFiles(files, proposalId) {
        if (!files || files.length === 0) {
            return [];
        }

        const uploadPromises = files.map(async (file) => {
            try {
                // Generar nombre único para el archivo
                const fileExtension = this.getFileExtension(file.originalname);
                const fileName = `${uuidv4()}.${fileExtension}`;
                
                // Crear referencia en Storage
                const storageRef = ref(storage, `proposals/${proposalId}/files/${fileName}`);
                
                // Subir archivo
                const snapshot = await uploadBytes(storageRef, file.buffer);
                
                // Obtener URL de descarga
                const downloadURL = await getDownloadURL(snapshot.ref);
                
                return {
                    fileName: fileName,
                    originalName: file.originalname,
                    url: downloadURL,
                    size: file.size,
                    mimeType: file.mimetype
                };
            } catch (error) {
                console.error('Error subiendo archivo:', error);
                throw new Error(`Error subiendo archivo ${file.originalname}: ${error.message}`);
            }
        });

        return await Promise.all(uploadPromises);
    }

    /**
     * Obtiene la extensión de un archivo
     * @param {string} filename - Nombre del archivo
     * @returns {string} - Extensión del archivo
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Crea una nueva propuesta
     * @param {Object} proposalData - Datos de la propuesta
     * @param {Array} files - Archivos adjuntos
     * @returns {Promise<Object>} - Resultado de la creación
     */
    async createProposal(proposalData, files = []) {
        try {
            // Validar datos
            const validation = this.validateProposalData(proposalData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                };
            }

            // Generar ID único para la propuesta
            const proposalId = uuidv4();

            // Subir archivos si existen
            let fileUrls = [];
            if (files && files.length > 0) {
                fileUrls = await this.uploadFiles(files, proposalId);
            }

            // Preparar datos para Firestore
            const proposalDoc = {
                proposal: proposalData.proposal.trim(),
                investment: proposalData.investment,
                files: fileUrls,
                createdAt: serverTimestamp(),
                status: 'pending',
                proposalId: proposalId
            };

            // Guardar en Firestore
            const docRef = await addDoc(collection(db, this.collectionName), proposalDoc);

            return {
                success: true,
                proposalId: proposalId,
                documentId: docRef.id,
                fileUrls: fileUrls.map(file => file.url),
                message: 'Propuesta creada exitosamente'
            };

        } catch (error) {
            console.error('Error creando propuesta:', error);
            return {
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            };
        }
    }

    /**
     * Obtiene todas las propuestas
     * @returns {Promise<Object>} - Lista de propuestas
     */
    async getAllProposals() {
        try {
            const { getDocs, query, orderBy } = await import('firebase/firestore');
            const proposalsRef = collection(db, this.collectionName);
            const q = query(proposalsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const proposals = [];
            querySnapshot.forEach((doc) => {
                proposals.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                proposals: proposals
            };
        } catch (error) {
            console.error('Error obteniendo propuestas:', error);
            return {
                success: false,
                message: 'Error obteniendo propuestas',
                error: error.message
            };
        }
    }
}

export default new ProposalService();
