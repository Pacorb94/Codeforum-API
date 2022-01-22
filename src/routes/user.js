'use strict';
//Importamos el enrutador
const router=require('express').Router();
const userController=require('../controllers/UserController');
const auth=require('../middlewares/Authorization');
const multipart=require('connect-multiparty');
//Establecemos el directorio del usuario
const userDirectory=multipart({uploadDir:'./uploads/user'});
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/users/:id', auth.checkUserAuth, userController.update);
//Varios middlewares es con []
router.post('/profile-images', [auth.checkUserAuth, userDirectory], userController.uploadProfileImage);
router.get('/profile-images/:name', userController.getProfileImage);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);
//Exportamos
module.exports=router;