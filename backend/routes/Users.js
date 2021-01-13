const express = require('express');
const { createUser, signinUser } = require('../controllers/Users');

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', signinUser);

module.exports = router