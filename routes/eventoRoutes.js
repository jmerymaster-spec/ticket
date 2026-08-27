const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, eventoController.insEvento);                        //Inserta Evento
router.get('/', eventoController.getEventos);                                           //Obtiene todos los eventos
router.get('/:idEvento', eventoController.getEventoById);                               //Obtiene un evento por ID
router.put('/:idEvento', authenticateToken, eventoController.updEventoById);            //Actualiza los datos de un evento por ID
router.patch('/:idEvento', authenticateToken, eventoController.updEstadoEventoById);    //Actualiza el estado de un evento por ID
router.delete('/:idEvento', authenticateToken, eventoController.delEventoById);         //Elimina Evento por ID

module.exports = router; 
