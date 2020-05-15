

var Token = require('../class/jwtoken');


exports.verificaToken = (req, res, next) =>{

    const userToken = req.get('x-token') || '';

    Token.comprobarToken( userToken ).then( (decoded) =>{

        req.usuario = decoded.usuario;
        next(); //Permite el paso libre al siguiente paso que quiera realizar

    }).catch( err => {

        res.status(200).send({
            status: false,
            mensaje: 'Token inválido.'
        });

    });
}