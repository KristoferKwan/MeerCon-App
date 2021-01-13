// import entire SDK
const AWS = require('aws-sdk');

require('dotenv').config()

const {
  isEmpty,
  empty,
} = require('./validations');

const {
  errorMessage, successMessage, status,
} = require('./status');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

var s3 = new AWS.S3();

const uploadFile = (file, path) => {
  return new Promise((resolve, reject) => {
    // Binary data base64
    const fileContent  = Buffer.from(file, 'binary');
  
    // Setting up S3 upload parameters
    const params = {
        Bucket: 'recognitionalarmbucket',
        Key: path, // File name you want to save as in S3
        Body: fileContent 
    };
    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            reject(err);
        }

        resolve({
            "response_code": 200,
            "response_message": "Success",
            "response_data": data
        });
    });
  }) 
}

const deleteFile = async (path) => {
    // Setting up S3 upload parameters
  const params = {
    Bucket: 'recognitionalarmbucket',
    Key: path, // File name you want to save as in S3
  };
  // Uploading files to the bucket
  s3.deleteObject(params, function(err, data) {
      if (err) {
          throw Error(err);
      }

      return {
          "response_code": 200,
          "response_message": "Success",
          "response_data": data
      };
  });
}

const getFile = (filename) => {
  return new Promise((resolve, reject) => {
    if(filename){
      const params = {
          Bucket: 'recognitionalarmbucket',
          Key: filename
      }
      s3.getObject(params, (err, data) => {
        if(err){
          return reject(err)
        }
        if(empty(data)){
          return reject({error:"no data returned. key does not exist"})
        }
        const image = Buffer.from(data.Body, 'base64')
        return resolve(image);
      })
    } else {
        return reject({error:"filename not provided"});
    }
  })
}

module.exports = {
  uploadFile,
  deleteFile,
  getFile
}