var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});


module.exports = {
  getAllService: async (coll, query) => {
    let service = new Array();
    docker.listServices.forEach(s => {
      service.push({
        service_id: s.ID,
        service_name: s.Spec.Name,
        service_replicas: s.Spec.Mode.Replicated.Replicas,
        service_volumes: s.Spec.TaskTemplate.ContainerSpec.Mounts.length,
        service_
      })
    })

  },

  get: async (coll, query) => {

  },

  getall: async (coll) => {

  },

  update: async (coll, query, newquery) => {

  },

  remove: async (coll, query) => {

  }
}
