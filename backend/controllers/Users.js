const dbQuery = require('../db/dbQuery');

const {
  hashPassword,
  comparePassword,
  isValidEmail,
  validatePassword,
  isEmpty,
  generateUserToken,
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

const {
  uploadFile
} = require('../helpers/storage');

/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
const createUser = async (req, res) => {
  const {
    email, firstName, lastName, password, muteNotifications
  } = req.body;

  const { photo } = req.files

  if (isEmpty(email) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(password) || isEmpty(muteNotifications)) {
    errorMessage.error = 'Email, password, first and last name, and mute notifications field cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }
  if (!isValidEmail(email)) {
    errorMessage.error = 'Please enter a valid Email';
    return res.status(status.bad).send(errorMessage);
  }
  if (!validatePassword(password)) {
    errorMessage.error = 'Password must be more than five(5) characters';
    return res.status(status.bad).send(errorMessage);
  }
  const hashedPassword = await hashPassword(password);
  
  let createUserQuery;
  let values = [];
  if(photo){
    try{
      const imageurl = '/users/' + email + '/' + email + '.jpg';
      await uploadFile(photo.data, imageurl);
      createUserQuery = `INSERT INTO
      users(email, first_name, last_name, password, mute_notifications, image_url)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
      values = [
        email,
        firstName,
        lastName,
        hashedPassword,
        muteNotifications,
        imageurl
      ];
    } catch(e) {
      errorMessage.error = 'Photo was given but could not be uploaded: ' + e
      return res.status(status.bad).send()
    }
  } else {
    createUserQuery = `INSERT INTO
    users(email, first_name, last_name, password, mute_notifications)
    VALUES($1, $2, $3, $4, $5, $6)
    returning *`;
    values = [
      email,
      firstName,
      lastName,
      hashedPassword,
      muteNotifications,
    ];
  }

  try {
    const { rows } = await dbQuery.query(createUserQuery, values);
    const dbResponse = rows[0];
    delete dbResponse.password;
    const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.firstname, dbResponse.lastname);
    successMessage.data = dbResponse;
    successMessage.data.token = token;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      errorMessage.error = 'User with that EMAIL already exist';
      return res.status(status.conflict).send(errorMessage);
    }
    errorMessage.error = 'Operation was not successful: ' + error;
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
const signinUser = async (req, res) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    errorMessage.error = 'Email or Password detail is missing';
    return res.status(status.bad).send(errorMessage);
  }
  if (!isValidEmail(email) || !validatePassword(password)) {
    errorMessage.error = 'Please enter a valid Email or Password';
    return res.status(status.bad).send(errorMessage);
  }
  const signinUserQuery = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await dbQuery.query(signinUserQuery, [email]);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'User with this email does not exist';
      return res.status(status.notfound).send(errorMessage);
    }
    const samePw = await comparePassword(dbResponse.password, password)
    if (!samePw) {
      errorMessage.error = 'The password you provided is incorrect';
      return res.status(status.bad).send(errorMessage);
    }
    console.log(dbResponse)
    const token = generateUserToken(dbResponse.email, dbResponse.first_name, dbResponse.last_name);
    delete dbResponse.password;
    successMessage.data = dbResponse;
    successMessage.data.token = token;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Get User
 * @param {object} req
 * @param {object} res
 * @returns {object} User array
 */
const getUser = async (req, res) => {
  const getUserQuery = 'SELECT * FROM users WHERE email=$1';
  const values = [req.user.email]
  
  if(isEmpty(req.user.email)){
    errorMessage.error = 'Person Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getUserQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'No user with given email found';
      return res.status(status.notfound).send(errorMessage);
    }
    delete dbResponse.password;
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};


const updatePhotoOfUser = async (email, photo) => {
  if (isEmpty(email)|| !photo ) {
    throw Error('Email and Photo fields cannot be empty');
  }
  const imageurl = '/users/' + email + '/' + email + '.jpg';
  try{
    return await uploadFile(photo, imageurl)
  } catch (error) {
    throw Error('Operation was not successful: ' + error.message);
  }
}

/**
   * update a user
   * @param {object} req
   * @param {object} res
   * @returns {void} return User updated successfully
   */
  const updateUser = async (req, res) => {
    const { firstName, lastName, muteNotifications } = req.body;
    const userEmail = req.user.email;
    const { photo } = req.files;
    if (isEmpty(userEmail) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(muteNotifications)) {
      errorMessage.error = 'User Email, First Name, Last Name, and Mute Notifications fields cannot be empty';
      return res.status(status.bad).send(errorMessage);
    }

    const updatePersonQuery = `UPDATE people
    SET first_name=$1,
        last_name=$2,
        mute_notifications=$3,
    WHERE
      email=$4
    returning *;`;
    const values = [
      firstName,
      lastName,
      muteNotifications,
      userEmail
    ];
    try {
      if(photo){
        await updatePhotoOfUser(userEmail, photo)
      }
      const { rows } = await dbQuery.query(updatePersonQuery, values);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'There is no user with that email';
        return res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = {};
      successMessage.data.message = 'User updated successfully';
      return res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'Operation was not successful: ' + error.message;
      return res.status(status.error).send(errorMessage);
    }
  };

module.exports = {
  createUser,
  signinUser,
  getUser,
  updateUser
};