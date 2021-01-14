const express = require('express');
const { addPersonToGroup, createGroup, deleteGroupById, deletePersonFromGroup, updateGroupById, getGroupById, getGroups,  } = require('../controllers/Groups');
const { verifyToken } = require('../middleware/verifyAuth') 

const router = express.Router();

router.post('/createGroup', verifyToken, createGroup);
router.put('/updateGroupById', verifyToken, updateGroupById);
router.delete('/deleteGroupById', verifyToken, deleteGroupById);
router.delete('/deletePersonFromGroup', verifyToken, deletePersonFromGroup);
router.post('/addPersonToGroup', verifyToken, addPersonToGroup);
router.get('/getGroupById', verifyToken, getGroupById);
router.get('/getGroups', verifyToken, getGroups);

module.exports = router