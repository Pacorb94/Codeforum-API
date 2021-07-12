'use strict';
const validator=require('validator');
const Topic=require('../models/Topic');

class CommentController{

    /**
     * Función que crea un comentario
     * @param req 
     * @param res 
     * @return
     */
    static create(req, res){
        if (req.params.topic_id) {
            if (CommentController.validateContent(req.body.content)) {
                let topicId=req.params.topic_id;
                Topic.find({_id:topicId}).exec((err, topic)=>{
                    if (err) return res.status(500).send({message:'El tema no existe'});
                    if (topic) {
                        topic[0].comments.push(
                            {
                                content:req.body.content,
                                user_id:req.user.sub
                            }
                        );
                        //Para que se reflejen los cambios hay que guardar el nuevo tema
                        topic[0].save((err, topicSaved)=>{
                            if (topicSaved) {
                                Topic.find({_id:topicSaved._id})
                                //Populamos el usuario del tema para tener sus datos
                                .populate('user_id')
                                //Lo mismo para el comentario
                                .populate('comments.user_id')
                                //Ordenados
                                .sort([['comments.timestamp', 'descending']])
                                .exec((err, topic)=>{
                                    if (err) return res.status(500).send({message:'El tema no existe'});
                                    if (topic[0]) return res.send(topic[0]);                                                
                                });       
                            }
                            if (err) return res.status(500).send({message:err.codeName});                                                                                    
                        });                     
                    }
                });
            } else {
                res.status(400).send({message:'El contenido es obligatorio'});
            }
        }else{
            return res.status(400).send({message:'Falta el id'});
        }      
    }

    /**
     * Función que modifica un comentario
     * @param req 
     * @param res 
     * @return
     */
    static update(req, res){
        if (req.params.id) {
            let id=req.params.id;
            if (CommentController.validateContent(req.body.content)) {
                let request=req.body.content;
                Topic.findOneAndUpdate(
                    {"comments._id":id, user_id:req.user.sub}, 
                    //$set es un operador para modificar subdocumentos y recibe el valor a modificar
                    {"$set":{"comments.$.content":request}}, 
                    {new:true}, 
                    (err, topicUpdated)=>{
                        if (err) return res.status(500).send({message:'El tema no existe'});
                        if (topicUpdated) return res.send(topicUpdated);
                        return res.status(500)
                            .send({message:'No puedes modificar comentarios de otros usuarios'}); 
                    }
                );
            }else{
                res.status(400).send({message:'El contenido es obligatorio'});
            }     
        } else {
            return res.status(400).send({message:'Falta el id'});
        }
    }

    /**
     * Función que borra un comentario
     * @param req 
     * @param res 
     * @return
     */
    static delete(req, res){
        if (req.params.topic_id&&req.params.id) {
            let topicId=req.params.topic_id;
            let id=req.params.id;
            Topic.find({_id:topicId, user_id:req.user.sub}).exec((err, topic)=>{
                if (err) return res.status(500).send({message:'El tema no existe'});
                if (topic) {
                    //Buscamos el cometario para borrar
                    let commentToDelete=topic[0].comments.id(id);
                    if (commentToDelete) {
                        commentToDelete.remove();
                        //Para que se reflejen los cambios hay que guardar el nuevo tema
                        topic[0].save((err, topicSaved)=>{
                            if (err) return res.status(500).send({message:err.codeName});
                            if (topicSaved) {
                                Topic.find({_id:topicSaved._id})
                                //Populamos el usuario del tema para tener sus datos
                                .populate('user_id')
                                //Lo mismo para el comentario
                                .populate('comments.user_id')
                                .exec((err, topic)=>{
                                    if (err) return res.status(500).send({message:'El tema no existe'});
                                    if (topic[0]) return res.send(topic[0]);                                   
                                });       
                            }      
                        });
                    }else{
                        return res.status(404).send({message:'El comentario no existe'});  
                    }                  
                }
            });
        } else {
            return res.status(400).send({message:'Falta algún id'});
        }
    }

    /**
     * Función que valida el contenido
     * @param content 
     * @return
     */
    static validateContent(content){
        if (!validator.isEmpty(content)) return true;
        return false;
    }
}
module.exports=CommentController;