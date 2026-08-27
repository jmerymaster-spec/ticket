const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/mostrarUsuarios', authenticateToken, usuarioController.getUsuarios);   //Obtener todos los usuario
router.post('/crearUsuario', usuarioController.insUsuario);                         //Crear usuario
router.get('/login', usuarioController.login);                                      //Login
router.get('/logout', authenticateToken, usuarioController.logout);                 //Logout

module.exports = router;
