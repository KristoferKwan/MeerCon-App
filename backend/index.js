require('dotenv').config()


const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require('path');
const {getFile, uploadFile} = require('./helpers/storage');
const fileUpload = require('express-fileupload');
const app = express();


app.use(cors());
app.options('*', cors());
app.use(cookieParser());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Accept-Ranges', 'bytes');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

app.use(express.json({extended: false}));
app.use(fileUpload());
app.get('/', (req, res) => res.send('API Running'));
app.get('/uploadPhoto', (req, res) => {
    res.sendFile(path.join(__dirname+ '/index.html'));
})
app.get('/imageTest', (req, res) => {
  res.sendFile(path.join(__dirname+ '/imagetest.html'));
})


app.use('/api/users', require('./routes/Users')); 
app.use('/api/people', require('./routes/People'));
app.use('/api/groups', require('./routes/Groups'));
app.use('/api/devices', require('./routes/Devices'));
app.use('/api/files', require('./routes/Files'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

