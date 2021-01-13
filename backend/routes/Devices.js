const express = require('express');
const { createDevice, getDeviceById, getDeviceNames, deleteDeviceRecordsByDevice, updateDeviceById, getDeviceRecordsByDate, deleteDeviceById } = require('../controllers/Devices');
const { verifyToken } = require('../middleware/verifyAuth') 

const router = express.Router();

router.post('/createDevice', verifyToken, createDevice);
router.get('/getDeviceById', verifyToken, getDeviceById);
router.get('/getDeviceNames', verifyToken, getDeviceNames);
router.delete('/deleteDeviceRecordsByDevice', verifyToken, deleteDeviceRecordsByDevice);
router.delete('/deleteDeviceById', verifyToken, deleteDeviceById);
router.put('/updateDeviceById', verifyToken, updateDeviceById);
router.get('/getDeviceRecordsByDate', verifyToken, getDeviceRecordsByDate);

module.exports = router