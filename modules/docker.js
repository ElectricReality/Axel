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
    let repo = 'https://github.com/ElectricReality/Axel.git';
    const filePath = path.join(process.cwd(), '/Axel');
    if (fs.existsSync(filePath)) {
      var rmdir = function(dir) {
        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
          var filename = path.join(dir, list[i]);
          var stat = fs.statSync(filename);

          if (filename == "." || filename == "..") {
            // pass these files
          } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
          } else {
            // rm fiilename
            fs.unlinkSync(filename);
          }
        }
        fs.rmdirSync(dir);
      };
      rmdir(filePath);
    }
    await git().silent(true)
      .clone(repo)
      .then(() => console.log('Clone finish'))
      .catch((err) => console.error('failed: ', err));
    const pack = await tarfs.pack(filePath);
    await docker.pruneImages()
    await docker.buildImage(pack, {t: 'axel',forcerm: true});
    docker.listServices({}).then(async function(ser) {
      let result = await ser.find(s => s.Spec.Name == "axel-system")
      const service = docker.getService(result.ID)
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
