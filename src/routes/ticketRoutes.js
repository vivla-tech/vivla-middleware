import express from 'express';
import { getTicketById, getTickets } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/:id', getTicketById);
router.get('/', getTickets);

export default router; 