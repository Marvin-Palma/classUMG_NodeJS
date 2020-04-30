
'use strict'

var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ReseteoPasswordSchema = new Schema({
    idUsuario: {
        type: String,
        required: [true, 'El id es necesario.']
    },
    email:{
        type: String,
        required: [true, 'El email es necesario.']
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

ReseteoPasswordSchema.methods.compararCodigo = function (codigo) {
    if (bcrypt.compareSync(codigo, this.codigo)) {
        return true;
    }
    else {
        return false;
    }
};


module.exports = mongoose.model('ReseteoPassword', ReseteoPasswordSchema);


