
'use strict'

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
    stars:{
        type: Number,
        default: 0
    },
    estado:{
        type: String
    }
});


module.exports = mongoose.model('Usuario', UsuarioSchema);


