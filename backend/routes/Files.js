const express = require('express');
const { uploadSpecifiedFile, getSpecifiedFile } = require('../controllers/Files');

const router = express.Router();

router.post('/uploadSpecifiedFile', uploadSpecifiedFile);
router.get('/getSpecifiedFile', getSpecifiedFile);

module.exports = router