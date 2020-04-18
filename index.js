
'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/classUMG', { useUnifiedTopology: true, useNewUrlParser:true }).then(()=>{
    console.log('La conexión a la base de datos se ha realizado correctamente!!!');

    app.listen(port, ()=>{
        console.log('Servidor corriendo en http://localhost:'+port);
    });
}).catch((err)=>{
    console.log("No se pudo conectar a la base de datos!!!");
    console.log(err);
});



