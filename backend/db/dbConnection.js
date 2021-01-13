
const pool = require('./pool');

pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Create User Table
 */
const createUsersTable = () => {
  const userCreateQuery = `CREATE TABLE IF NOT EXISTS Users(
    email VARCHAR(128) NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    image_url VARCHAR(128),
    mute_notifications BOOLEAN NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    PRIMARY KEY (email));`;

  return new Promise((resolve, reject) => {
    pool.query(userCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create People Table
 */
const createPeopleTable = () => {
  const peopleCreateQuery = `CREATE TABLE IF NOT EXISTS People (
    person_id SERIAL PRIMARY KEY,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NULL,
    phone_number VARCHAR(12) NULL,
    send_messages BOOLEAN DEFAULT FALSE,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    message_type VARCHAR(11) NULL,
    FOREIGN KEY (created_by)
      REFERENCES Users(email)
      ON UPDATE CASCADE ON DELETE CASCADE);`;

  return new Promise((resolve, reject) => {
    pool.query(peopleCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create Devices Table
 */
const createDevicesTable = () => {
  const devicesCreateQuery = `CREATE TABLE IF NOT EXISTS Devices (
    device_id SERIAL PRIMARY KEY,
    owner_id VARCHAR(128) NOT NULL,
    device_name VARCHAR(128) NOT NULL,
    ip VARCHAR(128) NOT NULL,
    mac_address VARCHAR(12) NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    FOREIGN KEY (owner_id) 
      REFERENCES Users(email) 
      ON UPDATE CASCADE ON DELETE CASCADE );`;

  return new Promise((resolve, reject) => {
    pool.query(devicesCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create DeviceRecords Table
 */
const createDeviceRecordsTable = () => {
  const deviceRecordsCreateQuery = `CREATE TABLE IF NOT EXISTS DeviceRecords (
    device_record_id SERIAL PRIMARY KEY,
    device_id INT NOT NULL,
    video_recording_url VARCHAR(128) NOT NULL,
    record_timestamp DATE NOT NULL DEFAULT (NOW()),
    favorite BOOLEAN DEFAULT FALSE,
    duration FLOAT NOT NULL,
    threat_level INT NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (device_id)
      REFERENCES Devices(device_id)
      ON UPDATE CASCADE ON DELETE CASCADE );`;
  return new Promise((resolve, reject) => {
    pool.query(deviceRecordsCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create DevicesGroup Table
 */
const createDevicesGroupTable = () => {
  const deviceGroupsCreateQuery = `CREATE TABLE IF NOT EXISTS DevicesGroup (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    device_id INT NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (group_id)
      REFERENCES Groups(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (device_id)
      REFERENCES Devices(device_id)
      ON UPDATE CASCADE ON DELETE CASCADE);`;
  return new Promise((resolve, reject) => {
    pool.query(deviceGroupsCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create DeviceRecords Table
 */
const createPersonDeviceRecordsTable = () => {
  const personDeviceRecordsCreateQuery = `CREATE TABLE IF NOT EXISTS PersonDeviceRecords (
    id SERIAL PRIMARY KEY,
    person_id INT NOT NULL,
    device_record_id INT NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (person_id)
      REFERENCES People(person_id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (device_record_id)
      REFERENCES DeviceRecords(device_record_id)
      ON UPDATE CASCADE ON DELETE CASCADE );`;
  return new Promise((resolve, reject) => {
    pool.query(personDeviceRecordsCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create Groups Table
 */
const createGroupsTable = () => {
  const groupsCreateQuery = `CREATE TABLE IF NOT EXISTS Groups (
    id SERIAL PRIMARY KEY,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    group_name VARCHAR(128) NOT NULL,
    FOREIGN KEY (created_by)
      REFERENCES Users(email)
      ON UPDATE CASCADE ON DELETE CASCADE );`;
  return new Promise((resolve, reject) => {
    pool.query(groupsCreateQuery)
      .then((res) => {
        console.log(res);
        resolve()
      })
      .catch((err) => {
        console.log(err);
        reject()
      });
  });
};

/**
 * Create GroupPeople Table
 */
const createGroupPeopleTable = () => {
  const groupPeopleCreateQuery = `CREATE TABLE IF NOT EXISTS GroupPeople (
    id SERIAL PRIMARY KEY,
    person_id INT NOT NULL,
    group_id INT NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (person_id)
      REFERENCES People(person_id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (group_id)
      REFERENCES Groups(id)
      ON UPDATE CASCADE ON DELETE CASCADE );`;
  return new Promise((resolve, reject) => {
    pool.query(groupPeopleCreateQuery)
      .then((res) => {
        console.log(res);
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  })
};

/**
 * Create Photos Table
 */
const createPhotosTable = () => {
  const photosQuery = `CREATE TABLE IF NOT EXISTS Photos (
    photo_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL,
    photo_type VARCHAR(5) NOT NULL,
    image_url VARCHAR(128) NOT NULL,
    created_on DATE NOT NULL DEFAULT (NOW()),
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (person_id)
      REFERENCES People(person_id)
      ON UPDATE CASCADE ON DELETE CASCADE );`;

  return new Promise((resolve, reject) => {
    pool.query(photosQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};


/**
 * Drop Users Table
 */
const dropUsersTable = () => {
  const usersDropQuery = 'DROP TABLE IF EXISTS Users';
  return new Promise((resolve, reject) => {
    pool.query(usersDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};


/**
 * Drop People Table
 */
const dropPeopleTable = () => {
  const peopleDropQuery = 'DROP TABLE IF EXISTS People;';
  return new Promise((resolve, reject) => {
    pool.query(peopleDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Drop Devices Table
 */
const dropDevicesTable = () => {
  const devicesDropQuery = 'DROP TABLE IF EXISTS Devices;';
  return new Promise((resolve, reject) => {
    pool.query(devicesDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

const dropDevicesGroupTable = () => {
  const devicesDropQuery = 'DROP TABLE IF EXISTS DevicesGroup;';
  return new Promise((resolve, reject) => {
    pool.query(devicesDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};


/**
 * Drop DeviceRecords Table
 */
const dropDeviceRecordsTable = () => {
  const deviceRecordsDropQuery = 'DROP TABLE IF EXISTS DeviceRecords;';
  return new Promise((resolve, reject) => {
    pool.query(deviceRecordsDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Drop PersonDeviceRecords Table
 */
const dropPersonDeviceRecordsTable = () => {
  const personDeviceRecordsDropQuery = 'DROP TABLE IF EXISTS PersonDeviceRecords;';
  return new Promise((resolve, reject) => {
    pool.query(personDeviceRecordsDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Drop Groups Table
 */
const dropGroupsTable = () => {
  const groupsDropQuery = 'DROP TABLE IF EXISTS Groups;';
  return new Promise((resolve, reject) => {
    pool.query(groupsDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Drop GroupPeople Table
 */
const dropGroupPeopleTable = () => {
  const groupPeopleDropQuery = 'DROP TABLE IF EXISTS GroupPeople;';
  return new Promise((resolve, reject) => {
    pool.query(groupPeopleDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Drop Photos Table
 */
const dropPhotosTable = () => {
  const photosDropQuery = 'DROP TABLE IF EXISTS Photos;';

  return new Promise((resolve, reject) => {
    pool.query(photosDropQuery)
    .then((res) => {
      console.log(res);
      resolve()
    })
    .catch((err) => {
      console.log(err);
      reject()
    });
  })
};

/**
 * Create All Tables
 */
const createAllTables = async() => {
  console.log("creating all tables");
  await createUsersTable();
  await createPeopleTable();
  await createGroupsTable();
  await createDevicesTable();
  await createDevicesGroupTable();
  await createDeviceRecordsTable();
  await createPersonDeviceRecordsTable();
  await createGroupPeopleTable();
  await createPhotosTable();
  pool.end();
};


/**
 * Drop All Tables
 */
const dropAllTables = async() => {
  console.log("dropping all tables");
  await dropPhotosTable();
  await dropGroupPeopleTable();
  await dropPersonDeviceRecordsTable();
  await dropDeviceRecordsTable();
  await dropDevicesGroupTable();
  await dropDevicesTable();
  await dropGroupsTable();
  await dropPeopleTable();
  await dropUsersTable();
  pool.end();
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});


module.exports = {
  createAllTables,
  dropAllTables,
};

require('make-runnable');
