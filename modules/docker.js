const Docker = require('dockerode');
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const tarfs = require('tar-fs');
const path = require('path');

module.exports = {
  axel: async () => {
      const pack = await tarfs.pack(process.cwd());
      docker.buildImage(pack, {t: 'axel'}, function (err, response){
        if(err) {
          console.log(err)
        }
        console.log("Axel Image Created")
      });
      docker.listServices({}).then(async function(ser) {
        let result = await ser.find(s => s.Spec.Name == "axel-system")
        const service = docker.getService(result.ID)
        let opts = {
          "Name": "axel-system",
          "version": parseInt(result.Version.Index),
          "TaskTemplate": {
            "ContainerSpec": {
              "Image": "axel",
              "Mounts": [{
                "Type": "bind",
                "Source": "/var/run/docker.sock",
                "Target": "/var/run/docker.sock"
              }]
            },
            "Resources": {
              "Limits": {},
              "Reservations": {}
            },
            "RestartPolicy": {},
            "Placement": {}
          },
          "Mode": {
            "Replicated": {
              "Replicas": 1
            }
          },
          "Networks": [{
            'Target': "axel-net",
          }],
          "UpdateConfig": {
            "Parallelism": 1
          },
          "EndpointSpec": {
            "Ports": [{
              "Protocol": "tcp",
              "TargetPort": 3000,
              "PublishedPort": 3000,
            }]
          }
        };
        service.update(opts, function(err, sudata) {
          if (err) {
            return console.log(err)
          }
          console.log(sudata)
          return console.log("Axel Service Updated");
        })
      });
    }
}
