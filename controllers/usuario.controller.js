'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var phoneToken = require('generate-sms-verification-code');
var generatorPassword = require('generate-password');

var Usuario = require('../models/usuario.model');
var Verificacion = require('../models/verificacion.model');
var ReseteoPassword = require('../models/reseteoPassword.model');

var correoDeVerificacion = require('../class/correoVerificacion');
var correoResetPassword = require('../class/correoReseteoPassword');
var jwTokenClase = require('../class/jwtoken');


var controller = {

    crearUsuario: (req, res) => {
        //Recoger parámetros por Post
        var params = req.body;

        //Validación de los parametros
        if (validator.isEmpty(params.nombre) || validator.isEmpty(params.avatar) || validator.isEmpty(params.email) || validator.isEmpty(params.password) || validator.isEmpty(params.pregunta) || validator.isEmpty(params.respuestaPregunta)) {
            return res.status(200).send({
                codigo:201,
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        const usuarioPorCrear = {
            nombre: params.nombre,
            avatar: params.avatar,
            email: params.email,
            password: bcrypt.hashSync(params.password, 10), //Se hace un cifrado hash de la password
            pregunta: params.pregunta,
            respuestaPregunta: bcrypt.hashSync(params.respuestaPregunta, 10), //Se hace un cifrado hash 
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

            var codigoDeVerificacion = phoneToken(8, {
                type: 'string'
            });
            var correo = correoDeVerificacion.sustituirParametros(codigoDeVerificacion);

            //Info del mensaje
            let info = {
                from: '"ClassUMG" <classumg@gmail.com>',
                to: params.email,
                subject: "Bienvenido ✔",
                html: correo
            };

            //Envío del mensaje
            correoTransportador.sendMail(info, function (error, info) {
                if (error) {
                    res.status(200).send({
                        status: false,
                        mensaje: 'Error al enviar el correo.'
                    });
                } else {
                    var registroVerificacion = {
                        idUsuario: usuarioCreado._id,
                        email: usuarioCreado.email,
                        codigo: bcrypt.hashSync(codigoDeVerificacion, 10)
                    }
                    Verificacion.create(registroVerificacion).then(registroPorVerificar => {
                        res.status(200).send({
                            codigo:200,
                            status: true,
                            mensaje: 'Hemos enviado un correo para su verificación.'
                        });
                    }).catch(err => {
                        res.status(200).send({
                            codigo:202,
                            status: false,
                            mensaje: 'Error al crear registro para verificación.'
                        });
                    });

                }
            });

        }).catch(err => {
            res.status(200).send({
                codigo:204,
                status: false,
                mensaje: 'Error en la creación de usuario, email en uso.'
            });
        });

    },

    login: (req, res) => {

        var params = req.body;

        //Validación de los parametros
        if (validator.isEmpty(params.usuario) || validator.isEmpty(params.password)) {
            return res.status(200).send({
                codigo:400,
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        var correoUsuario = params.usuario + "@miumg.edu.gt";

        Usuario.findOne({
            email: correoUsuario
        }, (err, usuario) => {

            if (err) throw err;

            if (!usuario) {
                return res.status(200).send({
                    codigo:201,
                    status: false,
                    mensaje: 'Usuario/Contraseña no son correctos.'
                });
            }

            if (usuario.estado == "A") {

                if (usuario.compararPassword(params.password)) {

                    const tokenUser = jwTokenClase.getJWToken({
                        _id: usuario._id,
                        nombre: usuario.nombre,
                        email: usuario.email,
                        avatar: usuario.avatar
                    });

                    return res.status(200).send({
                        codigo:200,
                        status: true,
                        jwt: tokenUser,
                        mensaje: 'Bienvenido.'
                    });

                } else {
                    return res.status(200).send({
                        codigo:201,
                        status: false,
                        mensaje: 'Usuario/Contraseña no son correctos'
                    });
                }
            } else if (usuario.estado == "V") {

                if (usuario.compararPassword(params.password)) {
                    return res.status(200).send({
                        codigo:210,
                        status: false,
                        mensaje: "Ingresa el código de verificación."
                    });
                }else{
                    return res.status(200).send({
                        codigo:201,
                        status: false,
                        mensaje: 'Usuario/Contraseña no son correctos.'
                    });
                }

            } else if (usuario.estado == "R") {

                ReseteoPassword.findOne({
                    email: correoUsuario,
                    estado: "A"
                }, (err, usuarioReseteado) => {

                    if (usuarioReseteado.compararCodigo(params.password)) {

                        const tokenUser = jwTokenClase.getJWToken({
                            _id: usuario._id,
                            nombre: usuario.nombre,
                            email: usuario.email,
                            avatar: usuario.avatar
                        });

                        return res.status(200).send({
                            codigo:202,
                            status: true,
                            jwt: tokenUser,
                            mensaje: 'Ingresa tus nuevas credenciales.'
                        });

                    } else {
                        return res.status(200).send({
                            codigo:203,
                            status: false,
                            mensaje: 'Contraseña incorrecta, usuario con clave reseteada, por favor verifica tu email.'
                        });
                    }

                })


            }
        });
    },

    verificacion: (req, res) => {

        var params = req.body;

        //Validación de los parametros
        if (validator.isEmpty(params.email) || validator.isEmpty(params.codigo)) {
            return res.status(200).send({
                codigo:400,
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        Verificacion.findOne({
            email: params.email,
            estado: "A"
        }, (err, registroPorVerificar) => {

            if (err) throw err;

            if (!registroPorVerificar) {
                return res.status(200).send({
                    codigo:201,
                    status: false,
                    mensaje: 'Email no encontrado.'
                });
            }
            
            if (registroPorVerificar.compararPassword(params.codigo)) {
                

                Verificacion.findOneAndUpdate({
                    email: params.email,
                    estado: "A"
                }, {
                    estado: "U"
                }, {
                    new: true
                }, (err, registroVerificado) => {

                    if (err || !registroVerificado) {
                        return res.status(200).send({
                            codigo:202,
                            status: false,
                            mensaje: 'No se encontró el registro para actualizar.'
                        });
                    }

                    Usuario.findOneAndUpdate({
                        email: params.email
                    }, {
                        estado: "A"
                    }, {
                        new: true
                    }, (err, usuarioAutorizado) => {
                        if (err || !usuarioAutorizado) {
                            return res.status(200).send({
                                codigo:203,
                                status: false,
                                mensaje: 'No se encontró el usuario para actualizar.'
                            });
                        } else {
                            return res.status(200).send({
                                codigo: 200,
                                status: true,
                                mensaje: 'Usuario autorizado, Ingresa.'
                            });
                        }

                    });
                });
            } else {
                
                return res.status(200).send({
                    codigo: 204,
                    status: false,
                    mensaje: 'Código de verificación inválido.'
                });
            }
        });

    },

    resetPassword: (req, res) => {

        var params = req.body;

        //Validación de los parametros
        if (validator.isEmpty(params.email) || validator.isEmpty(params.opcion)) {
            return res.status(200).send({
                codigo:201,
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        switch (params.opcion) {
            case "1":
                Usuario.findOne({
                    email: params.email
                }, (err, usuarioPorResetear) => {

                    if (err) throw err;

                    if (!usuarioPorResetear) {
                        return res.status(200).send({
                            codigo:202,
                            status: false,
                            mensaje: 'Email no encontrado.'
                        });
                    }

                    return res.status(200).send({
                        codigo:200,
                        status: true,
                        pregunta: usuarioPorResetear.pregunta
                    });

                });
                break;
            case "2":
                if (validator.isEmpty(params.respuestaPregunta)) {
                    return res.status(200).send({
                        codigo:203,
                        status: false,
                        mensaje: 'Datos incompletos.'
                    });
                }
                Usuario.findOne({
                    email: params.email
                }, (err, usuarioPorResetear) => {
                    if (err) throw err;

                    if (!usuarioPorResetear) {
                        return res.status(200).send({
                            codigo:204,
                            status: false,
                            mensaje: 'Email no encontrado.'
                        });
                    }

                    if (usuarioPorResetear.estado == "R") {
                        return res.status(200).send({
                            codigo: 205,
                            status: false,
                            mensaje: 'Usuario reseteado, por favor valida tu email.'
                        });
                    } else {


                        if (usuarioPorResetear.compararRespuestaPreguntaSeguridad(params.respuestaPregunta)) {
                            usuarioPorResetear.estado = "R";
                            usuarioPorResetear.save();
                            var passwordTemporary = generatorPassword.generate({
                                length: 15,
                                numbers: true
                            });
                            var registroReseteo = {
                                idUsuario: usuarioPorResetear._id,
                                email: usuarioPorResetear.email,
                                codigo: bcrypt.hashSync(passwordTemporary, 10)
                            }
                            ReseteoPassword.create(registroReseteo).then(registroCreado => {

                                //Envío de correo para su validación
                                var correoTransportador = nodemailer.createTransport({ //Primero se crea la información del correo transportador
                                    service: 'Gmail',
                                    auth: {
                                        user: 'classumg@gmail.com',
                                        pass: 'ClassUMG2020'
                                    }
                                });

                                var correo = correoResetPassword.sustituirParametros(passwordTemporary);

                                //Info del mensaje
                                let info = {
                                    from: '"ClassUMG" <classumg@gmail.com>',
                                    to: params.email,
                                    subject: "Hemos restablecido tu contraseña ✔",
                                    html: correo
                                };

                                correoTransportador.sendMail(info, function (error, info) {
                                    if (error) {
                                        res.status(200).send({
                                            codigo:210,
                                            status: false,
                                            mensaje: 'Error al enviar el correo.'
                                        });
                                    } else {
                                        res.status(200).send({
                                            codigo:200,
                                            status: true,
                                            mensaje: 'Hemos enviado una contraseña temporal a tu correo.'
                                        });
                                    }
                                });

                            }).catch(err => {
                                res.status(200).send({
                                    codigo:211,
                                    status: false,
                                    mensaje: 'Error al crear registro de reseteo de clave.'
                                });
                            });

                        } else {
                            res.status(200).send({
                                codigo:212,
                                status: false,
                                mensaje: 'Respuesta Incorrecta.'
                            });
                        }
                    }
                })

                break;
            default:
                return res.status(200).send({
                    codigo:299,
                    status: false,
                    mensaje: 'Opcion inválida.'
                });
        }
    },

    restablecerCredenciales: (req, res) => {
        var params = req.body;

        if (validator.isEmpty(params.password) || validator.isEmpty(params.email)) {
            return res.status(200).send({
                codigo:201,
                status: false,
                mensaje: 'Datos incompletos.'
            });
        }

        var nuevaPassword = bcrypt.hashSync(params.password, 10);
        Usuario.findOneAndUpdate({
            email: params.email, 
            estado: "R"
        }, {
            password: nuevaPassword,
            estado: "A"
        }, {
            new: true
        }, (err, usuarioActualizado) => {

            if (err || !usuarioActualizado) {
                return res.status(200).send({
                    codigo:202,
                    status: false,
                    mensaje: 'No se encontró el registro para actualizar.'
                });
            }

            ReseteoPassword.findOneAndUpdate({
                email: params.email
            }, {
                estado: "U"
            }, () => {});
            return res.status(200).send({
                codigo:200,
                status: true,
                mensaje: 'Credenciales actualizadas con éxito.'
            });
        });

    }

}

module.exports = controller;