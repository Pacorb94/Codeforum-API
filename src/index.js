'use strict';
const mongoose=require('mongoose');
//Nos permite usar promesas
mongoose.Promise=global.Promise;
//Conexión
mongoose.connect('mongodb://localhost:27017/codeforum', 
    {
        useNewUrlParser:true, 
        useUnifiedTopology:true,
        useFindAndModify:false,
        useCreateIndex:true
    })
    .then(()=>{
        module.exports=mongoose;
        const app=require('../server');
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });        
        //Todas las rutas empezarán por /api/
        app.use('/api/', require('./routes/user'));
        app.use('/api/', require('./routes/topic'));
        app.use('/api/', require('./routes/comment'));
        //Creamos el servidor
        app.listen(app.get('port'), ()=>console.log('El servidor funciona'));
    })
    .catch(error=>console.log(error));