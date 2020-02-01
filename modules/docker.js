const Docker = require('dockerode');
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const uuid = require('uuid/v4')

let api = {
  appupdate: async function(remote, name) {
    docker.listServices({}).then(async function(data) {
      let servicesearch = await data.find(s => s.Spec.Name == name)
      docker.buildImage(null, {
        t: servicesearch.Spec.TaskTemplate.ContainerSpec.Image,
        remote: remote,
      }, async function(err, data) {
        if (err) {
          return console.log(err)
        }
        if (data.statusCode == 200) {
          let options = {
            Name: servicesearch.Spec.Name,
            version: parseInt(servicesearch.Version.Index),
            TaskTemplate: {
              ContainerSpec: {
                Image: servicesearch.Spec.TaskTemplate.ContainerSpec.Image,
                Mounts: servicesearch.Spec.TaskTemplate.ContainerSpec.Mounts,
                Labels: {
                  randomLabelForceUpdate: uuid()
                }
              }
            },
            Networks: servicesearch.Spec.Networks,
            Mode: servicesearch.Spec.Mode,
            UpdateConfig: servicesearch.Spec.UpdateConfig,
            EndpointSpec: servicesearch.Spec.EndpointSpec
          }
          const service = docker.getService(servicesearch.ID)
          service.update(options, async function(err3, data3) {
            if (err3) {
              return console.log(err3)
            }
            console.log(data3)
          })
        }
      })
    })
  },
  appcreate: async function(name) {
    let options = {
      Name: name,
      TaskTemplate: {
        Image: `${name}:latest`
      },
      Networks: [{
        Target: 'axel-net'
      },{
        Target: 'ingress'
      }]
    }
    docker.createService
  },
  listapps: async function() {
    let apps = new Array()
    await docker.listServices({}).then(async function(data) {
      data.forEach(function(d){
        if(d.Spec.Name == "axel-system-nginx" || "axel-system-database" || "axel-system"){
          return
        } else {
          apps.push(d)
        }
      })
    })
    return apps
  }
}
exports.api = api
