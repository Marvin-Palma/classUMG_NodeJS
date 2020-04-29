

'use strict'

var express = require('express');
var usuarioController = require('../controllers/usuario.controller');

var router = express.Router();

//Rutas útiles
router.post('/crearUsuario', usuarioController.crearUsuario);

module.exports = router;
