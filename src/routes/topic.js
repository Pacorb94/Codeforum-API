'use strict';
//Importamos el enrutador
const router=require('express').Router();
const topicController=require('../controllers/TopicController');
const auth=require('../middlewares/Authorization');
router.post('/topics', auth.checkUserAuth, topicController.create);
//Parámetro opcional con ?
router.get('/topics/:page?', topicController.getTopics);
router.get('/users/:id/topics', topicController.getUserTopics);
router.get('/topics/:id', topicController.getTopic);
router.get('/topics/search/:text', topicController.searchTopics);
router.put('/topics/:id', auth.checkUserAuth, topicController.update);
router.delete('/topics/:id', auth.checkUserAuth, topicController.delete);
//Exportamos
module.exports=router;