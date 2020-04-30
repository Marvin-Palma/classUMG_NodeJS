
'use strict'

var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario.']
    },
    avatar:{
        type: String,
        required: [true, 'El avatar es necesario.']
    },
    email:{
        type: String,
        unique: true,
        required: [true, 'El correo es necesario.']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesaria.']
    },
    pregunta: {
        type: String,
        required: [true, 'La pregunta de seguridad es necesaria.']
    },
    respuestaPregunta: {
        type: String,
        required: [true, 'La respuesta de pregunta de seguridad es necesaria.']
    },
    stars:{
        type: Number,
        default: 0
    },
    estado:{
        type: String
    }
});

UsuarioSchema.methods.compararPassword = function (password) {
    if (bcrypt.compareSync(password, this.password)) {
        return true;
    }
    else {
        return false;
    }
};

UsuarioSchema.methods.compararRespuestaPreguntaSeguridad = function (respuesta) {
    if (bcrypt.compareSync(respuesta, this.respuestaPregunta)) {
        return true;
    }
    else {
        return false;
    }
};

module.exports = mongoose.model('Usuario', UsuarioSchema);


