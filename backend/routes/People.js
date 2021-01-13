const express = require('express');
const { createPerson, updatePersonById, getPersonById, deletePersonById, getPhotosOfPerson, updatePhotoOfPerson, getProfilePhotoOfPerson } = require('../controllers/People');
const { verifyToken } = require('../middleware/verifyAuth') 

const router = express.Router();

router.post('/createPerson', verifyToken, createPerson);
router.put('/updatePersonById', verifyToken, updatePersonById);
router.get('/getPersonById', verifyToken, getPersonById);
router.get('/getPhotosOfPerson', verifyToken, getPhotosOfPerson);
router.put('/updatePhotoOfPerson', verifyToken, updatePhotoOfPerson);
router.get('/getProfileOfPerson', verifyToken, getProfilePhotoOfPerson);
router.delete('/deletePersonById', verifyToken, deletePersonById);

module.exports = router