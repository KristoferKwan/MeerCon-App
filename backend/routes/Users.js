const express = require('express');
const { createUser, signinUser, getUser, updateUser } = require('../controllers/Users');
const { verifyToken } = require('../middleware/verifyAuth') 

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', signinUser);
router.get('/getUser', verifyToken, getUser);
router.put('/updateUser', verifyToken, updateUser);

module.exports = router