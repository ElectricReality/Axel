const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const mongo = require('../modules/mongo.js')

module.exports = {
  update: async () => {
    //let settings = await mongo.getall('nginx')
    //if(settings.length == 0){
    //  return;
    //}
    docker.buildImage('/axel/nginx', {t: 'axel-nginx'}, function (err, response){
      console.log(response)
    });
    docker.createService({Name: 'axel-system-nginx', Networks: 'axel-net', TaskTemplate: {ContainerSpec: {Image: 'axel-nginx'}} })
    docker.createContainer({Image: 'axel-nginx:latest', name: 'axel-system-nginx'}, function (err, container) {
      container.start(function (err, data) {
        console.log(response)
      });
    });
  }
}
