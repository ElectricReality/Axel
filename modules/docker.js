let socketPath = '/var/run/docker.sock'
let docker = {
  service: {
    update: async function(){

    },
    create: async function(){

    },
    list: async function(){
      let options = {
        socketPath: socketPath,
        path: `/v1.37/services`,
        method: 'get'
      }
      let response = await request(options)
      return JSON.parse(response.body)
    }
  },
  image: {
    update: async function(){

    },
    create: async function(){

    },
    list: async function(){

    }
  }
}

module.exports = {
  docker: docker
}
//Docker.Container = require('../modules/DockerFunctions/Container.js')

/*
axel: async () => {
  // Build Image
  docker.buildImage(null, {t: 'axel:latest',remote: 'github.com/ElectricReality/Axel.git'}, function(err, response) {
    if (err) {
      return console.log(err)
    }
    console.log("Axel image generated");
  });
  // Service Update
  await docker.listServices({}).then(async function(ser) {
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
      console.log("Axel Service Updated");
    })
  });
} */
