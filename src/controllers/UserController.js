'use strict';
const validator=require('validator');
const User=require('../models/User');
const bycript=require('bcrypt-nodejs');
const jwt=require('../services/Jwt');
const fs=require('fs');
const path=require('path');

class UserController{
   
    /**
     * Función que registra un usuario
     * @param req 
     * @param res 
     * @return
     */
    static register(req, res) {
        let request=req.body;
        if (UserController.validateName(request.name)||UserController.validateSurname(request.surname)
        &&UserController.validateEmail(request.email, validator)
        &&UserController.validatePassword(request.password, validator)) {
            //Instanciamos el usuario
            let user=new User();
            user.name=request.name;
            //Si request.surname tiene valor será ese sino vacío
            user.surname=request.surname??'';
            user.email=request.email;
            //Encriptamos la contraseña
            bycript.hash(request.password, null, null, (err, encryptedPass)=>user.password=encryptedPass);
            user.role='User';
            user.image=null;
            user.save((err, userStored)=>{
                if (err||!userStored) return res.status(500).send({message:'El usuario ya existe'});
                //Si se guardó
                if (userStored) return res.status(201).send(userStored);                  
            });                    
        }else{
            return res.status(400).send({message:'Datos incorrectos'});
        }     
    }

    /**
     * Función que inicia sesión
     * @param req 
     * @param res 
     * @return
     */
    static login(req, res){
        let request=req.body;
        if (UserController.validateEmail(request.email, validator)
        &&UserController.validatePassword(request.password, validator)) {
            //Buscamos el usuario por el email
            User.findOne({email:request.email}, (err, userExists)=>{
                if (err) return res.status(500).send({message:err.codeName});
                //Si existe      
                if (userExists) {
                    //Comparamos la contraseña de la petición con la de la base de datos
                    bycript.compare(request.password, userExists.password, (err, checkPassword)=>{
                        //Si las contraseñas con correctas
                        if (checkPassword) {
                            //Si nos llega el parámetro getToken devolvemos el token
                            if (request.getToken) return res.send({token:jwt.createToken(userExists)});                         
                            return res.send(userExists);
                        }else{
                            return res.status(500).send({message:'Inicio de sesión incorrecto'});
                        }
                    });                           
                }else{
                    return res.status(404).send({message:'El usuario no existe'});
                }             
            });
        }else{
            return res.status(400).send({message:'Campos incorrectos'});
        }
    }

    /**
     * Función que modifica un usuario
     * @param req 
     * @param res 
     * @return
     */
    static update(req, res) {
        let request=req.body;
        if (UserController.validateName(request.name)&&UserController.validateSurname(request.surname)
        &&UserController.validateEmail(request.email)) {
            //{new:true} devuelve el registro actualizado
            User.findOneAndUpdate({_id:req.user.sub}, request, {new: true}, (err, userUpdated)=>{
                if (err) return res.status(500).send({message:err.codeName});
                //Si se actualizó
                if (userUpdated) return res.send(userUpdated);
                return res.status(404).send({message:'No existe el usuario'});         
            });                
        }else{
            return res.status(400).send({message:'Campos incorrectos'});
        }
    }

    /**
     * Función que rellena los campos vacíos con los datos 
     * de la base de datos
     * @param req 
     */
      static fillEmptyFields(req) {
        if (!req.body.name) req.body.name=req.user.name;
        if (!req.body.surname) req.body.surname=req.user.surname;  
        if (!req.body.email) req.body.email=req.user.email;
    }

    /**
     * Función que sube la imagen de perfil
     * @param req 
     * @param res 
     * @return
     */
    static uploadProfileImage(req, res) {
        if (UserController.validateImage(req.files.file0)) {
            let filePath=req.files.file0.path;      
            let extensionFile=filePath.split('\.')[1];
            //Si es una imagen sino se borrará del servidor
            if (extensionFile=='png'||extensionFile=='jpg'||extensionFile=='jpeg'
            ||extensionFile=='gif') {        
                let fileName=filePath.split('\\')[2];
                User.findOneAndUpdate({_id:req.user.sub}, {image:fileName}, {new:true}, 
                    (err, userUpdated)=>{
                        if (err) return res.status(500).send({message:err.codeName});
                        if (userUpdated) return res.send(userUpdated);               
                    }
                );
            }else{
                fs.unlink(filePath, err=>{
                    return res.status(400).send({message:'Envía una imagen'});
                });   
            }          
        }else{
            return res.status(400).send({message:'No hay imagen para subir'});
        }
    }

    /**
     * Función que obtiene la imagen de perfil
     * @param req 
     * @param res 
     * @return
     */
    static getProfileImage(req, res) {
        let fileName=req.params.name;
        if (UserController.validateImage(fileName)) {
            let pathFile=`./uploads/user/${fileName}`;
            if(fs.existsSync(pathFile)){
                return res.sendFile(path.resolve(pathFile));
            }else {
                return res.status(404).send({message:'No existe la imagen'});
            }
        }else{
            return res.status(400).send({message:'Falta el nombre de la imagen'});
        }
    }

    /**
     * Función que obtiene los usuarios
     * @param req 
     * @param res 
     */
    static getUsers(req, res) {
        User.find().exec((err, users)=>{
            if (err) return res.status(500).send({message:err.codeName});
            if (users) return res.send(users);
            return res.status(404).send({message:'No hay usuarios'});       
        });
    }

    /**
     * Función que obtiene un usuario
     * @param req 
     * @param res 
     */
    static getUser(req, res) {
        if (req.params.id) {
            let id=req.params.id;
            User.findById(id).exec((err, user)=>{
                if (err||!user) return res.status(500).send({message:'No existe el usuario'});
                if (user) return res.send(user);        
            });   
        } else {
            return res.status(400).send({message:'Falta el id'});
        }     
    }

    /**
     * Función que valida el nombre
     * @param name 
     * @return
     */
    static validateName(name){
        if (name.match(/^[a-zA-ZñáéíóúÑÁÉÍÓÚ\s]*$/)) return true;
        return false;     
    }
    
    /**
     * Función que valida los apellidos
     * @param surname  
     * @return 
     */
    static validateSurname(surname){
        //Como no es obligatorio este campo, la validación se hará si hay apellidos
        if (surname) {
            if (surname.match(/^[a-zA-ZñáéíóúÑÁÉÍÓÚ\s]*$/)) return true;
            return false;
        }   
    }
    
    /**
     * Función que valida el email
     * @param email 
     * @return
     */
    static validateEmail(email){
        if (validator.isEmail(email)) return true;
        return false;
    }
    
    /**
     * Función que valida la contraseña
     * @param password 
     * @return
     */
    static validatePassword(password){
        if (!validator.isEmpty(password)) return true;
        return false;
    }

    /**
     * Función que valida una imagen
     * @param image 
     * @return
     */
    static validateImage(image) {
        if (image) return true;
        return false;
    }
}
module.exports=UserController;