const dbQuery = require('../db/dbQuery');

const {
  isEmpty,
  empty,
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

const {
  deleteFile
} = require('../helpers/storage');
const { isValidIPaddress, isValidMacAddress } = require('../helpers/utils');


/**
 * Create A Device
 * @param {object} req
 * @param {object} res
 * @returns {object} device object
 */
const createDevice = async (req, res) => {
  const {
    deviceName, ip, mac_address
  } = req.body;
  const { email }  = req.user;


  if (isEmpty(deviceName) || isEmpty(ip) || isEmpty(mac_address)) {
    errorMessage.error = 'Device Name, IP, and MAC Address fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  } else if(!isValidIPaddress(ip)){
    errorMessage.error = 'IP Address is invalid';
    return res.status(status.bad).send(errorMessage);
  } else if(!isValidMacAddress(mac_address)) {
    errorMessage.error = 'MAC Address is invalid';
    return res.status(status.bad).send(errorMessage);
  }

  const createPersonQuery = `INSERT INTO
          devices(owner_id, device_name, ip, mac_address)
          VALUES($1, $2, $3, $4)
          returning *`;
  const values = [
    email,
    deviceName,
    ip,
    mac_address
  ];

  try {
    const { rows } = await dbQuery.query(createPersonQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Unable to create device: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Get Device Info by Id
   * @param {object} req
   * @param {object} res
   * @returns {object} Device object
   */
const getDeviceById = async (req, res) => {
  const { deviceId } = req.query.deviceId;
  const { email } = req.user.email;
  const getPersonQuery = 'SELECT * FROM devices WHERE device_id=$1 AND createdby=$2';
  const values = [deviceId, email]
  
  if(empty(deviceId) || isEmpty(email)){
    errorMessage.error = 'Device Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getPersonQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'No device with given id found';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Get All names of devices associated with a given user
 * @param {object} req
 * @param {object} res
 * @returns {object} names array
 */
const getDeviceNames = async (req, res) => {
  const { email } = req.user
  const getDevicesQuery = `SELECT 
      d.device_name,
      d.device_id 
    FROM 
      devices d
    WHERE
      d.owner_id=$1 
    ORDER BY
      d.device_name ASC,
      d.device_id ASC;`;
  const values = [email]
  try {
    const { rows } = await dbQuery.query(getDevicesQuery, values);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = 'No device with given email found';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Deletes a given device record from S3
 * @param {object} record
 * @returns {object} Error or null
 */
const deleteDeviceRecord = async (record) => {
  try {
    await deleteFile(record);
  } catch (error) {
    throw Error('Record could not be deleted: ' + error.message);
  }
}

/**
 * Deletes a device record given the device record id
 * @param {object} req
 * @param {object} deviceRecordId
 * @returns {object} Error or null
 */
const deleteDeviceRecordsByDeviceId = async (req, deviceRecordId) => {
  const {email} = req.user 
  const deviceRecordsQuery = `SELECT * FROM devicerecords WHERE device_id=$1 AND created_by=$2`;
  const deleteDeviceRecordsQuery = `DELETE FROM devicerecords WHERE device_id=$1 AND created_by=$2 returning *`;
  const values = [
    deviceRecordId,
    email,
  ];
  try {
    const { devices } = await dbQuery.query(deviceRecordsQuery, values);
    let dbResponse = devices[0];
    if (!dbResponse) {
      throw Error('There are no device records related to this given id');
    }
    devices.forEach(async (device) => {
      await deleteDeviceRecord(device.device_record)
    })
    const { rows } = await dbQuery.query(deleteDeviceRecordsQuery, values);
    dbResponse = rows[0];
    if (!dbResponse) {
      throw Error('There were no device records deleted in the database with the given id');
    }
  } catch (error) {
    throw Error('Operation was not successful: ' + error.message);
  }
}

/**
 * Deletes device record associated with a given deviceRecordId
 * @param {object} req
 * @param {object} res
 * @returns {object} Error or null
 */
const deleteDeviceRecordsByDevice = async (req, res) => {
  const {email} = req.user
  const { deviceRecordId } = req.body  
  const deviceRecordsQuery = `SELECT * FROM devicerecords WHERE device_record_id=$1 AND created_by=$2`;
  const deleteDeviceRecordsQuery = `DELETE FROM devicerecords WHERE device_record_id=$1 AND created_by=$2 returning *`;
  const values = [
    deviceRecordId,
    email,
  ];
  
  try {
    const { devices } = await dbQuery.query(deviceRecordsQuery, values);
    let dbResponse = devices[0];
    if (!dbResponse) {
      throw Error('There are no device records related to this given id');
    }
    devices.forEach(async (device) => {
      await deleteDeviceRecord(device.device_record)
    })
    const { rows } = await dbQuery.query(deleteDeviceRecordsQuery, values);
    dbResponse = rows[0];
    if (!dbResponse) {
      throw Error('There were no device records deleted in the database with the given id');
    }
    successMessage.data = {};
    successMessage.data.message = 'Device Record deleted successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = error.message;
    return res.status(status.bad).send(errorMessage);
  }
}

/**
 * delete a device by id
 * @param {object} req
 * @param {object} res
 * @returns {object} return device cancelled successfully
 */
const deleteDeviceById = async (req, res) => {
  const { deviceId } = req.body;
  const { email } = req.user;
  
  try{
    await deleteDeviceRecordsByDeviceId(req, deviceId)
  } catch (error) {
    errorMessage.error = error.message;
    return res.status(status.notfound).send(errorMessage);
  }
  
  const deleteDeviceQuery = `DELETE FROM devices 
  WHERE device_id=$1 AND created_by=$2
  returning *;`;
  const values = [
    deviceId,
    email,
  ];
  try {
    const { rows } = await dbQuery.query(deleteDeviceQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no device with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Device deleted successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};


/**
 * update a device
 * @param {object} req
 * @param {object} res
 * @returns {void} return device updated successfully
 */
const updateDeviceById = async (req, res) => {
  const { deviceId, deviceName, ip, macAddress } = req.body;
  const { email } = req.user;
  
  if (empty(deviceId) || isEmpty(deviceName) || isEmpty(ip) || isEmpty(macAddress)) {
    errorMessage.error = 'Device Name, IP, and MAC Address fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  } else if(!isValidIPaddress(ip)){
    errorMessage.error = 'IP Address is invalid';
    return res.status(status.bad).send(errorMessage);
  } else if(!isValidMacAddress(macAddress)) {
    errorMessage.error = 'MAC Address is invalid';
    return res.status(status.bad).send(errorMessage);
  }

  const updateDeviceQuery = `UPDATE devices
  SET device_name=$1,
      ip=$2,
      mac_address=$3,
  WHERE
    device_id=$4 AND owner_id=$5
  returning *;`;
  const values = [
    deviceName,
    ip,
    macAddress,
    deviceId,
    email
  ];
  try {
    const { rows } = await dbQuery.query(updateDeviceQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no device with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Device updated successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * get device records by date
 * @param {object} req
 * @param {object} res
 * @returns {object} return array of device record objects
 */
const getDeviceRecordsByDate = async (req, res) => {
  const { date } = req.query;
  const { email } = req.user;
  const getDeviceRecordsQuery = `SELECT
  dr.device_record_id,
  dr.device_id,
  dr.video_recording_url,
  dr.record_timestamp,
  dr.favorite,
  dr.duration,
  dr.threat_level,
  dr.created_on,
  dr.created_by, 
  CONCAT(p.first_name, ' ', p.last_name, ', ') as faces_detected
FROM 
  devicerecords dr
  LEFT JOIN peopledevicerecords pdr
  ON dr.device_id = pdr.device_id
  INNER JOIN people p
  ON p.person_id = pdr.person_id 
WHERE
  dr.date=$1 AND p.created_by=$2
GROUP BY
  dr.device_record_id,
  dr.device_id,
  dr.video_recording_url,
  dr.record_timestamp,
  dr.favorite,
  dr.duration,
  dr.threat_level,
  dr.created_on,
  dr.created_by`;
  const values = [date, email];

  if(empty(date) || isEmpty(email)){
    errorMessage.error = 'Date and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getDeviceRecordsQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'No devices with given user email found';
      return res.status(status.error).send(errorMessage);
    }
    successMessage.data = rows;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};


module.exports = {
  createDevice,
  getDeviceById,
  getDeviceNames,
  deleteDeviceRecordsByDevice,
  deleteDeviceById,
  updateDeviceById,
  getDeviceRecordsByDate
};