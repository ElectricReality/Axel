const Docker = require('dockerode');
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const tarfs = require('tar-fs');
const path = require('path');
const git = require('simple-git/promise')
const fs = require("fs"); // Or `import fs from "fs";` with ESM


module.exports = {
  axel: async () => {
    // Build Image
    await docker.buildImage(null, {t: 'axel', remote: 'github.com/ElectricReality/Axel.git'}, function (err, response){
      if(err){
        return console.log(err)
      }
      console.log(response)
    });
    // Service Update
    docker.listServices({}).then(async function(ser) {
      let result = await ser.find(s => s.Spec.Name == "axel-system")
      let service = await docker.getService(result.ID)
      let opts = {
        "Name": "axel-system",
        "version": parseInt(result.Version.Index),
        "TaskTemplate": {
          "ForceUpdate": parseInt(1),
          "ContainerSpec": {
            "Image": "axel:latest",
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
      await service.update(opts, function(err, sudata) {
        if (err) {
          return console.log(err)
        }
        return console.log("Axel Service Updated");
      })
    });
  }
}
