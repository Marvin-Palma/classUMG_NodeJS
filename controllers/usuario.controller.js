
'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

var Usuario = require('../models/usuario.model');
var Verificacion = require('../models/verificacion.model');

var correoClase = require('../clases/correo');

var phoneToken = require('generate-sms-verification-code');
 
var controller={

    crearUsuario:(req, res)=>{
        //Recoger parámetros por Post
        var params = req.body;

        //Validación de los parametros
        if(validator.isEmpty(params.nombre) || validator.isEmpty(params.avatar) || validator.isEmpty(params.email) || validator.isEmpty(params.password)){
            return res.status(400).send({
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        const usuarioPorCrear = {
            nombre: params.nombre,
            avatar: params.avatar,
            email: params.email,
            password: bcrypt.hashSync(params.password, 10), //Se hace un cifrado hash de la password
            estado: 'V' //Estado de la cuenta, A=Activa; V=Verificación Pendiente; R=Reseteo de Clave;
        }
    
        Usuario.create(usuarioPorCrear).then(usuarioCreado => { //Creación del registro
    
            //Envío de correo para su validación
            var correoTransportador = nodemailer.createTransport({ //Primero se crea la información del correo transportador
                service: 'Gmail',
                auth: {
                    user: 'classumg@gmail.com',
                    pass: 'ClassUMG2020'
                }
            });

            var codigoDeVerificacion=phoneToken(8, {type: 'string'});
            var correo = correoClase.sustituirParametros(codigoDeVerificacion);

            //Info del mensaje
            let info ={
                from: '"ClassUMG" <classumg@gmail.com>', 
                to: params.email, 
                subject: "Bienvenido ✔",
                html: correo
            };
            
            //Envío del mensaje
            correoTransportador.sendMail(info, function(error, info){
                if (error){
                    res.status(500).send({
                        status: false,
                        mensaje: 'Error al enviar el correo.'
                    });
                    console.log(error);
                } else {
                    var registroVerificacion={
                        idUsuario : usuarioCreado._id,
                        codigo : bcrypt.hashSync(codigoDeVerificacion, 10)
                    }
                    Verificacion.create(registroVerificacion).then(registroPorVerificar=>{
                        res.status(200).send({
                            status: true,
                            mensaje: 'Hemos enviado un correo para su verificación.'
                        });
                    }).catch(err=>{
                        res.status(500).send({
                            status: true,
                            mensaje: 'Error al crear registro para verificación.'
                        });
                    });
                    
                }
            });

        }).catch(err => {
            res.status(500).send({
                status: false,
                mensaje: 'Error en la creación de usuario, email en uso.'
            });
        })
        
    }

}

// const tokenUsuario = Token.getJwToken({
//     _id     : usuarioCreado._id,
//     nombre  : usuarioCreado.nombre,
//     email   : usuarioCreado.email,
//     avatar  : usuarioCreado.avatar
// });

module.exports = controller;