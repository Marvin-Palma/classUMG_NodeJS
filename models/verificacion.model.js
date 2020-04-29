

'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const VerificacionSchema = new Schema({
    idUsuario: {
        type: String,
        required: [true, 'El id es necesario.']
    },
    codigo:{
        type: String,
        required: [true, 'El codigo es necesario.']
    },
    estado:{
        type: String,
        default: 'A'
    }
});


module.exports = mongoose.model('Verificacion', VerificacionSchema);


