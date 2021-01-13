const dbQuery = require('../db/dbQuery');

const {
  isEmpty,
  empty,
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');


/**
 * Create A Group
 * @param {object} req
 * @param {object} res
 * @returns {object} group object
 */
const createGroup = async (req, res) => {
  let {
    groupName
  } = req.body;
  const { email }  = req.user;

  if (isEmpty(groupName)) {
    errorMessage.error = 'Group Name cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }

  const createPersonQuery = `INSERT INTO
          groups(group_name, created_by)
          VALUES($1, $2)
          returning *`;
  const values = [
    groupName,
    email
  ];

  try {
    const { rows } = await dbQuery.query(createPersonQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Unable to create group: ' + error;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * Associate A Person with a Group
 * @param {object} req
 * @param {object} res
 * @returns {object} group object
 */
const addPersonToGroup = async (req, res) => {
  let {
    groupId,
    personId
  } = req.body;
  const { email }  = req.user;

  if (empty(groupId) || empty(personId) || isEmpty(email) ) {
    errorMessage.error = 'Group Id, Person Id, and Email fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }

  const createPersonQuery = `INSERT INTO
          grouppeople(group_id, person_id, created_by)
          VALUES($1, $2, $3)
          returning *`;
  const values = [
    groupId,
    personId,
    email
  ];

  try {
    const { rows } = await dbQuery.query(createPersonQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Unable to create group: ' + error;
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * delete a person from a group
 * @param {object} req
 * @param {object} res
 * @returns {void} return the person deleted successfully
 */
const deletePersonFromGroup = async (req, res) => {
  const { personId, groupId } = req.body;
  const { email } = req.user;
  
  if(empty(groupId) || empty(personId) || isEmpty(email)){
    errorMessage.error = 'Group Id, Person Id, and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  const deleteGroupPersonQuery = `DELETE FROM grouppeople
  WHERE group_id=$1 AND person_id=$2 AND created_by=$3
  returning *;`;
  const values = [
    groupId,
    personId,
    email
  ];
  try {
    const { rows } = await dbQuery.query(deleteGroupPersonQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no person in the given group OR group with the given id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Group deleted successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};
  

/**
 * Get all people in a given group by their names
 * @param {object} req
 * @param {object} res
 * @returns {object} names array
 */
const getNamesByGroupId = async (groupId, email) => {
  const getPersonQuery = `SELECT 
      CONCAT(first_name, ' ', last_name),
      p.person_id 
    FROM 
      people p
      INNER JOIN group_people gp
      ON p.person_id = gp.person_id
    WHERE
      gp.group_id=$1 AND p.created_by=$2
    ORDER BY
      p.last_name ASC,
      p.first_name ASC;`;
  const values = [groupId, email]
  try {
    const { rows } = await dbQuery.query(getPersonQuery, values);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      throw Error('No group with given id found');
    }
    return dbResponse
  } catch (error) {
    throw Error(error.message)
  }
};

/**
   * Get a group given a group id
   * @param {object} req
   * @param {object} res
   * @returns {object} group and people rows
   */
const getGroupById = async (req, res) => {
  const { groupId } = req.query.groupId;
  const { email } = req.user;
  const getGroupQuery = `SELECT * FROM groups WHERE id = $1 AND created_by = $2`;
  const values = [groupId, email]
  
  if(empty(groupId) || isEmpty(email)){
    errorMessage.error = 'Group Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getGroupQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'No group with given id found';
      return res.status(status.notfound).send(errorMessage);
    }
    const people = await getNamesByGroupId(groupId, email)
    successMessage.data = {...dbResponse, people: people};
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
};

const getGroups = async(req, res) => {
  const { email } = req.user;
  const getGroupQuery = `SELECT group_name, id FROM groups WHERE created_by = $1`;
  const values = [email]
  
  if( isEmpty(email)){
    errorMessage.error = 'Email field is required.';
    return res.status(status.error).send(errorMessage);
  }

  try {
    const { rows } = await dbQuery.query(getGroupQuery, values);
    const dbResponse = rows;
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful: ' + error.message;
    return res.status(status.error).send(errorMessage);
  }
}

/**
 * delete a group by group id
 * @param {object} req
 * @param {object} res
 * @returns {void} return group deleted successfully
 */
const deleteGroupById = async (req, res) => {
  const { groupId } = req.body;
  const { email } = req.user;
  
  if(empty(groupId) || isEmpty(email)){
    errorMessage.error = 'Group Id and Email fields are required.';
    return res.status(status.error).send(errorMessage);
  }

  const deleteGroupQuery = `DELETE FROM groups 
  WHERE id=$1 AND created_by=$2
  returning *;`;
  const values = [
    groupId,
    email,
  ];
  try {
    const { rows } = await dbQuery.query(deleteGroupQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no group with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Group deleted successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};


/**
 * update a group
 * @param {object} req
 * @param {object} res
 * @returns {void} return group updated successfully
 */
const updateGroupById = async (req, res) => {
  let { groupId, groupName } = req.body;
  const { email } = req.user;
  
  if (empty(groupId) || isEmpty(groupName) ) {
    errorMessage.error = 'Group ID and Group Name fields cannot be empty';
    return res.status(status.bad).send(errorMessage);
  }

  const updateGroupQuery = `UPDATE groups
  SET group_name=$1,
  WHERE
    groups.id=$2 AND groups.created_by=$3
  returning *;`;
  const values = [
    groupId,
    groupName,
    email
  ];
  try {
    const { rows } = await dbQuery.query(updateGroupQuery, values);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'There is no group with that id';
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = {};
    successMessage.data.message = 'Group updated successfully';
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

module.exports = {
  createGroup,
  addPersonToGroup,
  deletePersonFromGroup,
  getGroupById,
  getGroups,
  deleteGroupById,
  updateGroupById
};