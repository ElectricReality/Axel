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
            Networks: servicesearch.Spec.TaskTemplate.Networks || servicesearch.Spec.Networks,
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
        ContainerSpec: {
          Image: `${name}:latest`
        }
      }
    }
    docker.createService(options)
  },
  appremove: async function(name) {
    docker.listServices({}).then(async function(data) {
      let servicesearch = await data.find(s => s.Spec.Name == name)
      docker.getService(servicesearch.Spec.Name).remove()
    })
  },
  listapps: async function() {
    let apps = new Array()
    await docker.listServices({}).then(async function(data) {
      data.forEach(function(d){
        if(d.Spec.Name == "axel-system-nginx" || d.Spec.Name == "axel-system-database" || d.Spec.Name == "axel-system"){

        } else {
          apps.push(d)
        }
      })
    })
    return apps
  },
  getapp: async function(name) {
    let apps = new Array()
    await docker.listServices({}).then(async function(data) {
      let servicesearch = await data.find(s => s.Spec.Name == name)
      apps.push(servicesearch)
    })
    return apps
  },
  getapplogs: async function(name) {
    let str = '';
    await docker.listServices({}).then(async function(data) {
      let servicesearch = await data.find(s => s.Spec.Name == name)
      const service = docker.getService(servicesearch.ID)
      var logs_opts = {
        follow: true,
        timestamps: true,
        stdout: true,
        stderr: true,
      };
      await service.logs(logs_opts, async function(err, data) {
        if (err) {
          return console.log(err)
        }
        console.log(data)
        str += data
      })
    })
    return str
  }
}
exports.api = api
