const Docker = require('dockerode');
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const mongo = require('../modules/mongo.js')

module.exports = {
  update: async () => {
    //let settings = await mongo.getall('nginx')
    //if(settings.length == 0){
    //  return;
    //}
    docker.buildImage({
      context: './nginx',
      src: ['Dockerfile']
    }, {
      t: 'axel-nginx'
    }, function(error, output) {
      if (error) {
        return console.error(error);
      }
      console.log("Building Nginx")
    });
    let options = {
      "Name": "axel-system-nginx",
      "TaskTemplate": {
        "ContainerSpec": {
          "Image": "axel-nginx"
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
        "ExposedPorts": [{
          "Protocol": "tcp",
          "Port": 80
        }]
      }
    };

    docker.listServices({}).then(async function(services) {
      let result = await services.find(s => s.Spec.Name == "axel-system-nginx")
      if(!result){
        console.log("Creating Service")
        docker.createService(options, function(err, csdata) {
          if (err) {
            return console.log(err)
          }
          return console.log("Nginx Service Created");
        })
      } else {
        let container = await docker.getService(result.id)
        container.service.update(options, function(err, sudata) {
          if (err) {
            return console.log(err)
          }
          return console.log("Nginx Service Updated");
        })
      }
    }).catch(function(err) {
      console.log(err)
    });


  }
}
