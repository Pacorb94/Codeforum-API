'use strict';
//Importamos el enrutador
const router=require('express').Router();
const commentController=require('../controllers/CommentController');
const auth=require('../middlewares/Authorization');
router.post('/:topic_id/comment/create', auth.checkUserAuth, commentController.create);
router.put('/comments/:id/update', auth.checkUserAuth, commentController.update);
router.delete('/:topic_id/comments/:id/delete', auth.checkUserAuth, commentController.delete);
//Exportamos
module.exports=router;