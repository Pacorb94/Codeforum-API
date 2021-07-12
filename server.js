'use strict';
const express=require('express');
const app=express();
//Tendrá el puerto 3000 o el que esté definido en el sistema
app.set('port', 3000||process.env.PORT);
//A los datos de las respuestas le damos 2 espacios para que sean más legibles
app.set('json spaces', 2);
app.use(express.urlencoded({extended:false}));
//Castea los datos de las peticiones a JSON
app.use(express.json());
//Exportamos
module.exports=app;