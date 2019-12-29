const os = require('os-utils')

module.exports = {
  platform: async () => {
    return await os.platform();
  },

  cpuUsage: async () => {
    os.cpuUsage(async (v) => {
	     return await v
    });
  },

  usedMem: async () => {
    let used = await os.totalmem() - os.freemem()
    return used
  },

  sysUp: async () => {
    return await os.sysUptime()
  }

}
