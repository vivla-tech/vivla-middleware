import express from 'express';
import { getTicketById, getTickets, getTicketsStats } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/stats', getTicketsStats);
router.get('/:id', getTicketById);
router.get('/', getTickets);


export default router; 