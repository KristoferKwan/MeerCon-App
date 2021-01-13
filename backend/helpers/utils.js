const getObjectKeysAndValues = async (object) => {
  return {keys: Object.keys(object), values: Object.values(object)}
}

const isValidMacAddress = async (macAddress) => {
  const regexp = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/i;
  const mac_address = macAddress.val();
  if(regexp.test(mac_address)) {
      return true;
  } return false;
}

const isValidIPaddress = async (ipaddress) => {  
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
    return true;  
  }  
  return false;  
}  

module.exports = {
  isValidMacAddress,
  isValidIPaddress,
  getObjectKeysAndValues
}