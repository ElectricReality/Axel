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
          Image: `nginx:latest`
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
      data.forEach(function(d) {
        if (d.Spec.Name == "axel-system-nginx" || d.Spec.Name == "axel-system-database" || d.Spec.Name == "axel-system") {

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
        follow: false,
        timestamps: true,
        stdout: 1,
        stderr: 1,
      };
      service.logs(logs_opts).then(async function(d){
        if (Buffer.isBuffer(d)) {
          console.log(d.toString('utf8'))
          return d.toString('utf8')
        }
        /*res.setEncoding('utf8');
        let chunk = ''
        res.on('data', d => {
          chunk += d
          console.log(d)
        })
        res.on('end', () => {
          console.log(chunk);
        });*/
      })
    })
  }
}
exports.api = api
