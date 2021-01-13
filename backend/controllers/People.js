const dbQuery = require('../db/dbQuery');

const {
  isEmpty,
  empty,
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

const {
  uploadFile, deleteFile
} = require('../helpers/storage');

/**
 * Uploads a person's photo to S3
 * @param {object} photo
 * @param {object} phototype
 * @param {object} personId
 * @param {object} email
 * @returns {object} photo object
 */
const createPersonPhoto = async (photo, phototype, personId, email) => {
  let createPhotoQuery;
  let values = [];
  try {
    const imageurl = '/users/' + email + '/person/' + personId + '/' + phototype + '.jpg';
    await uploadFile(photo.data, imageurl);
    createPhotoQuery = `INSERT INTO
    photos(person_id, photo_type, image_url, created_by)
    VALUES($1, $2, $3, $4)
    returning *`;
    values = [
      personId,
      phototype,
      imageurl,
      email
    ];
  } catch (error) {
    throw Error('Photo could not be uploaded: ' + error);
  }
  try {
    const { rows } = await dbQuery.query(createPhotoQuery, values);
    const dbResponse = rows[0];
    return dbResponse;
  } catch (error) {
    throw Error('Unable to create photo in database');
  }
}

/**
 * Uploads a person's photos to S3
 * @param {object} req
 * @param {object} res
 * @returns {object} array of photo objects
 */
const createPersonPhotos = async (req, personId) => {
  const {front, top, left, right} = req.files
  const {email} = req.user 
  console.log(req.user, personId)
  if (!front || !top || !left || !right || empty(personId)) {
    throw Error('Front Photo, Top Photo, Left Photo, Right Photo, and Person Id, field cannot be empty');
  }
  let photoMsg = [];
  let photoResponse;
  for(let photoType in req.files){
    photoResponse = await createPersonPhoto(req.files[photoType], photoType, personId, email)
    photoMsg.push(photoResponse)
  }  
  return photoMsg;
}

/**
 * Create A Person
 * @param {object} req
 * @param {object} res
 * @returns {object} person object
 */
const createPerson = async (req, res) => {
  let {
    firstName, lastName, email, phoneNumber, sendMessages, messageType
  } = req.body;
  const {
    front, top, left, right
  } = req.files;
  const userEmail  = req.user.email;

  if (isEmpty(firstName) || isEmpty(lastName) || !front || !top || !left || !right) {
    errorMessage.error = 'First Name, Last Name, Front, Top, Left, and Right fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }
  if(sendMessages===true && (isEmpty(email) && isEmpty(phoneNumber) && isEmpty(messageType))){
    errorMessage.error = 'Send Messages is set to true. Email, Phone Number, and Message Type fields cannot not be empty';
    return res.status(status.bad).send(errorMessage);
  } else {
    sendMessages=false; 
  }

  const createPersonQuery = `INSERT INTO
          people(first_name, last_name, email, phone_number, send_messages, message_type, created_by)
          VALUES($1, $2, $3, $4, $5, $6, $7)
          returning *`;
  const values = [
    firstName,
    lastName,
    email,
    phoneNumber,
    sendMessages,
    messageType,
    userEmail
  ];

  try {
    const { rows } = await dbQuery.query(createPersonQuery, values);
    const dbResponse = rows[0];
    const personId = dbResponse.person_id; 
    const photosResponse = await createPersonPhotos(req, personId);
    successMessage.data = {person: dbResponse, photos: photosResponse};
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Unable to create person: ' + error;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Get a person by id
 * @param {object} req
 * @param {object} res
 * @returns {object} person object
 */
const getPersonById = async (req, res) => {
  const getPersonQuery = 'SELECT * FROM people WHERE person_id=$1 AND created_by=$2';
  const values = [req.query.personId, req.user.email]
  
  if(empty(req.query.personId) || isEmpty(req.user.email)){
    errorMessage.error = 'Person Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getPersonQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'No person with given id found';
      return res.status(status.notfound).send(errorMessage);
    }
    const photo = await getProfilePhotoOfPerson(req.query.personId, req.user.email)
    successMessage.data = {...dbResponse, photo: photo};
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Get All people in a given group
 * @param {object} req
 * @param {object} res
 * @returns {object} names array
 */
const getNamesByGroupId = async (req, res) => {
  const getPersonQuery = `SELECT 
      CONCAT(first_name, ' ', last_name),
      p.person_id 
    FROM 
      people p
      INNER JOIN grouppeople gp
      ON p.person_id = gp.person_id
    WHERE
      gp.group_id=$1 AND p.created_by=$2
    ORDER BY
      p.last_name ASC,
      p.first_name ASC;`;
  const values = [req.params.groupId, req.user.email]
  try {
    const { rows } = await dbQuery.query(getPersonQuery, values);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = 'No group with given id found';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

const deletePersonPhoto = async (imageurl) => {
  try {
    await deleteFile(imageurl);
  } catch (error) {
    throw Error('Photo could not be deleted: ' + error.message);
  }
}
  
const deletePersonPhotos = async (req, personId) => {
  const {email} = req.user 
  const photosQuery = `SELECT * FROM photos WHERE person_id=$1 AND created_by=$2`;
  const values = [
    personId,
    email,
  ];
  try {
    const { rows } = await dbQuery.query(photosQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      throw Error('There are no photos related to this given id');
    }
    rows.forEach(async (photo) => {
      await deletePersonPhoto(photo.image_url)
    })
  } catch (error) {
    throw Error('Operation was not successful: ' + error.message);
  }
}

/**
   * delete A Person
   * @param {object} req
   * @param {object} res
   * @returns {void} return Person cancelled successfully
   */
const deletePersonById = async (req, res) => {
  const { personId } = req.body;
  const { email } = req.user;
  
  try{
    await deletePersonPhotos(req, personId)
  } catch (error) {
    errorMessage.error = error.message;
    return res.status(status.notfound).send(errorMessage);
  }
  
  const deletePersonQuery = `DELETE FROM people 
  WHERE people.person_id=$1 AND people.created_by=$2
  returning *;`;
  const values = [
    personId,
    email,
  ];
  try {
    const { rows } = await dbQuery.query(deletePersonQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no person with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Person cancelled successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};


/**
 * update a person
 * @param {object} req
 * @param {object} res
 * @returns {void} return person updated successfully
 */
const updatePersonById = async (req, res) => {
  let { firstName, lastName, email, phoneNumber, sendMessages, messageType, personId } = req.body;
  const userEmail = req.user.email;
  
  if (empty(personId) || isEmpty(userEmail) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(sendMessages)) {
    errorMessage.error = 'Person ID, User Email, First Name, Last Name, and Send Messages fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }
  if(sendMessages===true && (isEmpty(email) && isEmpty(phoneNumber) && isEmpty(messageType))){
    errorMessage.error = 'Send Messages is set to true. Email, Phone Number, and Message Type fields cannot not be empty';
    return res.status(status.bad).send(errorMessage);
  } else {
    sendMessages=false; 
  }

  const updatePersonQuery = `UPDATE people
  SET first_name=$1,
      last_name=$2,
      email=$3,
      phone_number=$4,
      send_messages=$5,
      message_type=$6
  WHERE
    people.person_id=$7 AND people.created_by=$8
  returning *;`;
  const values = [
    firstName,
    lastName,
    email,
    phoneNumber,
    sendMessages,
    messageType,
    personId,
    userEmail
  ];
  try {
    const { rows } = await dbQuery.query(updatePersonQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no person with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Person updated successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * get the profile photo of a given person
 * @param {object} personId
 * @param {object} email
 * @returns {void} return photo object
 */
const getProfilePhotoOfPerson = async (personId, email) => {
  const getPhotosQuery = `SELECT * FROM photos WHERE person_id=$1 AND created_by=$2 AND photo_type='front'`;
  const values = [personId, email];
  if(empty(personId) || isEmpty(email)){
    throw Error('Person Id and Email fields are required.');
  }

  try {
    const { rows } = await dbQuery.query(getPhotosQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      throw Error('No photo with given person id found');
    }
    const photo = dbResponse.imageurl
    return photo
  } catch (error) {
    console.log(error)
    throw Error(error.message)
  }
};

/**
 * get the photos of a given person
 * @param {object} personId
 * @param {object} email
 * @returns {void} return array of photo object
 */
const getPhotosOfPerson = async (req, res) => {
  const getPhotosQuery = 'SELECT * FROM photos WHERE person_id=$1 AND created_by=$2';
  const values = [req.query.personId, req.user.email]
  
  if(empty(req.query.personId) || isEmpty(req.user.email)){
    errorMessage.error = 'Person Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getPhotosQuery, values);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = 'No person with given id found';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = rows 
    return res.status(status.success).send(successMessage)
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};
  
/**
 * update the photo of a given person
 * @param {object} req
 * @param {object} res
 * @returns {void} return photo updated successfully
 */
const updatePhotoOfPerson = async (req, res) => {
  const { photoType, personId } = req.body;
  const { photo } = req.files
  const { email } = req.user;
  
  if (empty(personId) || isEmpty(photoType) || !photo ) {
    errorMessage.error = 'Person ID, Photo Type, and Photo fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }

  const imageurl = '/users/' + email + '/person/' + personId + '/' + photoType + '.jpg';
  const updatePhotoQuery = `UPDATE photos
  SET image_url=$1
  WHERE
    photo_type=$2 AND person_id=$3 AND created_by=$4
  returning *;`;
  const values = [
    imageurl,
    photoType,
    personId,
    email,
  ];

  try{
    await uploadFile(photo, imageurl)
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(updatePhotoQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no photo with the specified photo type, person id, and creator';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Photo updated successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};


  module.exports = {
    createPerson,
    getPersonById,
    getNamesByGroupId,
    deletePersonById,
    updatePersonById,
    updatePhotoOfPerson,
    getPhotosOfPerson,
    getProfilePhotoOfPerson
  };