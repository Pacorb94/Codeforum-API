'use strict';
const validator=require('validator');
const Topic=require('../models/Topic');

class TopicController{

    /**
     * Función que crea un tema
     * @param req 
     * @param res 
     * @return
     */
    static create(req, res){
        let request=req.body;
        if (TopicController.validateTitle(request.title)&&TopicController.validateContent(request.content)
        &&TopicController.validateLang(request.lang)) {
            //Instanciamos el tema
            let topic=new Topic();
            topic.title=request.title;
            topic.content=request.content;
            //Si request.code tiene valor será ese sino vacío
            topic.code=request.code??'';
            topic.lang=request.lang;
            topic.user_id=req.user.sub;
            topic.save((err, topicSaved)=>{
                if (err||!topicSaved) return res.status(500).send({message:err.codeName});
                if (topicSaved) return res.status(201).send(topicSaved);
            });
        } else {
            return res.status(500).send({message:'Campos incorrectos'});
        }
    }

    /**
     * Función que devuelve los temas paginados
     * @param req 
     * @param res 
     * @return
     */
    static getTopics(req, res){
        if (TopicController.validatePage(req.params.page)) {
            let page=Number.parseInt(req.params.page??1);
            let options={
                //Orden descendente
                sort:{date:-1},
                //Por cúal campo buscar
                populate:'user_id',
                //Límite de temas por página
                limit:5,
                //Página actual
                page:page
            };
            Topic.paginate({}, options, (err, topics)=>{
                if (err) return res.status(500).send({message:err.codeName});
                if (topics) {
                    return res.send(
                        {
                            //Temas
                            topics:topics.docs,
                            //Total de temas
                            totalTopics:topics.totalDocs,
                            //Total de páginas
                            totalPages:topics.totalPages
                        }
                    );
                }
                return res.status(404).send({message:'No hay temas'});      
            });
        } else {
            return res.status(400).send({message:'Página incorrecta'});
        }     
    }

    /**
     * Función que valida el parámetro de la página
     * @param page 
     * @return
     */
    static validatePage(page){
        if (!Number.isNaN(page)&&page!='0') return true;        
        return false;
    }

    /**
     * Función que obtiene los temas del usuario
     * @param req 
     * @param res 
     */
    static getUserTopics(req, res){
        if (req.params.id) {
            let id=req.params.id;
            Topic.find({user_id:id})
            //Ordenados
            .sort([['createdAt', 'descending']])
            .exec((err, userTopics)=>{
                if (err) return res.status(500).send({message:'El usuario no existe'});
                if (userTopics) return res.send(userTopics);
                return res.status(404).send({message:'El usuario no tiene temas'});                     
            });         
        }else{
            res.status(400).send({message:'Falta el id'});
        }
    }

    /**
     * Función que obtiene un tema
     * @param req 
     * @param res 
     */
    static getTopic(req, res){
        if (req.params.id) {
            let id=req.params.id;
            Topic.find({_id:id})
                //Populamos el usuario del tema para tener sus datos
                .populate('user_id')
                //Lo mismo para el comentario
                .populate('comments.user_id')
                //Ordenados
                .sort([['comments.timestamp', 'descending']])
                .exec((err, topic)=>{
                    if (err) return res.status(500).send({message:'El tema no existe'});
                    if (topic) return res.send(topic);                    
                });       
        } else {
            res.status(400).send({message:'Falta el id'});
        }
    }

    /**
     * Función que modifica un tema
     * @param req 
     * @param res 
     */
    static update(req, res){
        if (req.params.id) {
            let id=req.params.id;
            let request=req.body;
            if (TopicController.validateTitle(request.title)
            ||TopicController.validateContent(request.content)
            ||TopicController.validateLang(request.lang)) {
                //Sólo se modificará si el usuario es el creador del tema
                Topic.findOneAndUpdate({_id:id, user_id:req.user.sub}, request, {new:true}, 
                (err, topicUpdated)=>{
                    if (err) return res.status(500).send({message:'No existe ese tema'});
                    if (topicUpdated) return res.send(topicUpdated);
                    return res.status(500).send({message:'No puedes modificar temas de otros usuarios'});                           
                });
            } else {
                res.status(400).send({message:'Campos incorrectos'});
            }      
        }else{
            res.status(400).send({message:'Falta el id'});
        }
    }

    /**
     * Función que borra un tema
     * @param req 
     * @param res 
     */
    static delete(req, res){
        if (req.params.id) {
            let id=req.params.id;
            //Sólo se borrará si el usuario es el creador del tema
            Topic.findOneAndDelete({_id:id, user_id:req.user.sub}).exec((err, topicDeleted)=>{
                if (err) return res.status(500).send({message:'No existe ese tema'});
                if (topicDeleted) return res.send(topicDeleted);
                return res.status(500)
                    .send({message:'No puedes borrar temas de otros usuarios'});        
            })
        } else {
            res.status(400).send({message:'Falta el id'});
        }
    }

    /**
     * Función que busca temas
     * @param req 
     * @param res 
     */
    static searchTopics(req, res){
        if (req.params.text) {
            let text=req.params.text;
            Topic.find(
                {
                    //$or es un operador que busca por las condiciones
                    "$or":[
                        /*Si coincide el título con el texto ($regex) y que no distingua
                        de mayus y minus ($options)*/
                        {"title":{"$regex":text, "$options":"i"}},
                        {"content":{"$regex":text, "$options":"i"}},
                        {"lang":{"$regex":text, "$options":"i"}},
                        {"code":{"$regex":text, "$options":"i"}}
                    ]
                }
            )
            .populate('user_id')
            .sort([['createdAt', 'descending']])
            .exec((err, topics)=>{
                if (err) return res.status(500).send({message:err.codeName});
                if (topics[0]) return res.send(topics);  
                return res.status(404).send({message:'No hay coincidencias'});
            })
        } else {
            res.status(400).send({message:'Falta la palabra para buscar'});
        }
    }

    /**
     * Función que valida el título
     * @param title 
     * @return
     */
    static validateTitle(title){
        if (!validator.isEmpty(title)) return true;
        return false;
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

    /**
     * Función que valida el lenguaje de programación
     * @param lang
     * @return
     */
    static validateLang(lang){
        if (!validator.isEmpty(lang)) return true;
        return false;
    }
}
module.exports=TopicController;