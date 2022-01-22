'use strict';
//Importamos el enrutador
const router=require('express').Router();
const commentController=require('../controllers/CommentController');
const auth=require('../middlewares/Authorization');
router.post('/topics/:topic_id/comment', auth.checkUserAuth, commentController.create);
router.put('/comments/:id', auth.checkUserAuth, commentController.update);
router.delete('/topics/:topic_id/comments/:id', auth.checkUserAuth, commentController.delete);
//Exportamos
module.exports=router;