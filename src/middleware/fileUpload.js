import multer from 'multer';
import path from 'path';

// Configuración de multer para manejo de archivos en memoria
const storage = multer.memoryStorage();

// Función para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten: jpg, png, pdf, doc, docx'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
        files: 5 // máximo 5 archivos
    }
});

// Middleware para validar archivos
export const validateFiles = (req, res, next) => {
    if (req.files && req.files.length > 5) {
        return res.status(400).json({
            success: false,
            message: 'Máximo 5 archivos permitidos'
        });
    }
    
    // Validar tamaño total de archivos
    if (req.files) {
        const totalSize = req.files.reduce((total, file) => total + file.size, 0);
        if (totalSize > 50 * 1024 * 1024) { // 50MB total
            return res.status(413).json({
                success: false,
                message: 'El tamaño total de archivos excede el límite permitido (50MB)'
            });
        }
    }
    
    next();
};

export default upload;
