const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', ticketController.getTicket);                                       //Obtiene todos los tickets
router.post('/', authenticateToken, ticketController.insTicket);                   //Inserta Ticket
router.delete('/:_id', authenticateToken, ticketController.cancelarTicket);        //Anular Ticket
router.patch('/:_id', authenticateToken, ticketController.updEstadoTicketById);    //Actualiza el estado de un ticket por ID
router.get('/misTickets', authenticateToken, ticketController.misTickets);         //Consulta todos mis tickets

module.exports = router; 
