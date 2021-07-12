'use strict';
const mongoose=require('../index');
const commentSchema=require('./Comment');
const mongoosePaginate=require('mongoose-paginate-v2');
//Hacemos un schema que tendrá las propiedades del modelo
let topicSchema=mongoose.Schema({
   title:{type:String, required:true},
   content:{type:String, required:true},
   code:String,
   lang:{type:String, required:true},
   user_id:{type:mongoose.Schema.ObjectId, ref:'User'},
   comments:[commentSchema]
}, {timestamps:true});
//Añadir paginación
topicSchema.plugin(mongoosePaginate);
module.exports=mongoose.model('Topic', topicSchema);
