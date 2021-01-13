const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

const {
  uploadFile, getFile
} = require('../helpers/storage');


/**
 * upload a specific file 
 * @param {object} req
 * @param {object} res
 * @returns {object} return file object 
 */
const uploadSpecifiedFile = async (req, res) => {
  uploadFile(req.files.photo.data).then((data) => {
    successMessage.data = data;
    return res.status(status.created).send(successMessage);
  }).catch((err) => {
    errorMessage.error = 'Unable to create device: ' + err.message;
    return res.status(status.error).send(errorMessage);
  })  
};

/**
 * get specified file
 * @param {object} req
 * @param {object} res
 * @returns {object} return file object with file data
 */
const getSpecifiedFile = async (req, res) => {
  try{
    const file = await getFile(req.query.filename)
    res.writeHead(200, {
      ContentLength: file.length,
      ContentType: 'image/jpeg',
    })
    res.end(file)
  } catch(error){
    errorMessage.error = 'Operation is invalid: ' + error.message;
    return res.status(status.bad).send(errorMessage);
  }
}

module.exports = {
  uploadSpecifiedFile, getSpecifiedFile
}