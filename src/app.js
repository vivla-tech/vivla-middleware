import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const { PORT } = process.env;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ruta principal
app.get('/', (req, res) => {
    res.send('Middleware OK');
});

// Rutas
app.use('/v1/tickets', ticketRoutes);
app.use('/v1/reviews', reviewRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT || 3000, () => {
        console.log(`Servidor en puerto ${PORT || 3000}`);
    });
}

export default app; 