
var jwt = require('jsonwebtoken');

var seed = "Educacion-Gratis-Para-Todo-El-Mundo";
var caducidad = "30d";

var jwToken={


    getJWToken: (payload)=>{

        return jwt.sign({
            usuario:payload
        }, seed, {expiresIn: caducidad});

    },

    comprobarToken: (usuarioToken)=>{
        return new Promise ( (resolve, reject) => {
            jwt.verify(usuarioToken, seed, (err, decoded)=>{
                if(err){
                    reject();
                }else{
                    resolve(decoded);
                }
            })
        })
    }
}


module.exports = jwToken;