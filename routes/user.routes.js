

'use strict'

var express = require('express');

var usuarioController = require('../controllers/usuario.controller');

var router = express.Router();
var middleware = require('../middleware/validacionJWT');

//Rutas útiles
router.post('/crearUsuario', usuarioController.crearUsuario);
router.post('/login', usuarioController.login);
router.post('/verificacion', usuarioController.verificacion);
router.post('/reseteo-password', usuarioController.resetPassword);
router.post('/nuevas-credenciales', middleware.verificaToken, usuarioController.restablecerCredenciales);
router.post('/info-usuario', middleware.verificaToken, usuarioController.infoUsuarioToken);
router.post('/cambio-nombre-avatar', middleware.verificaToken, usuarioController.cambiarNombreAvatar);
router.post('/cambio-password', middleware.verificaToken, usuarioController.cambioPassword);
router.post('/cambio-pregunta', middleware.verificaToken, usuarioController.cambioPregunta);


module.exports = router;
