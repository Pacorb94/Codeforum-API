'use strict';
const mongoose=require('../index');
//Hacemos un schema que tendrá las propiedades del modelo
let commentSchema=mongoose.Schema({
   content:{type:String, required: true},
   user_id:{type:mongoose.Schema.ObjectId, ref:'User'}
}, {timestamps: true});
/*model() creará una colección Commments (la primera letra la convierte a minúsculas y pone en plural la 
palabra) con el esquema de antes*/
mongoose.model('Comment', commentSchema);
module.exports=commentSchema;
