const os = require('os-utils')

module.exports = {
  platform: async () => {
    return os.platform();
  },

  cpuUsage: async () => {
    os.cpuUsage(function(v){
	     return v
    });
  },

  usedMem: async () => {
    let used = os.totalmem() - os.freemem()
    return used
  },

  sysUp: async () => {
    return os.sysUptime()
  }

}
