'use strict';
//Importamos el enrutador
const router=require('express').Router();
const topicController=require('../controllers/TopicController');
const auth=require('../middlewares/Authorization');
router.post('/topic/create', auth.checkUserAuth, topicController.create);
//Parámetro opcional con ?
router.get('/topics/:page?', topicController.getTopics);
router.get('/topics/users/:id', topicController.getUserTopics);
router.get('/topic/:id', topicController.getTopic);
router.get('/topics/search/:text', topicController.searchTopics);
router.put('/topics/:id/update', auth.checkUserAuth, topicController.update);
router.delete('/topics/:id/delete', auth.checkUserAuth, topicController.delete);
//Exportamos
module.exports=router;