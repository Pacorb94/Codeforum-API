'use strict';
const mongoose=require('../index');
//Hacemos un schema que tendrá las propiedades del modelo
let userSchema=mongoose.Schema({
    name:{type:String, required: true},
    surname:String,
    email:{type:String, required: true, unique:true},
    password:{type:String, required: true},
    image:String,
    role:String
}, {timestamps: true});
//Quitamos la contraseña para que no se envie
userSchema.methods.toJSON=function(){
    let obj=this.toObject();
    obj.password=undefined;
    return obj;
}
/*model() creará una colección Users (la primera letra la convierte a minúsculas y pone en plural la 
palabra) con el esquema de antes*/
module.exports=mongoose.model('User', userSchema);

