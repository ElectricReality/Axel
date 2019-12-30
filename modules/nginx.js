const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const mongo = require('../modules/mongo.js')

module.exports = {
  update: async () => {
    //let settings = await mongo.getall('nginx')
    //if(settings.length == 0){
    //  return;
    //}
    docker.buildImage({
      context: './nginx',
      src: ['Dockerfile', 'nginx.conf']
    }, {
      t: 'axel-nginx'
    }, function(error, output) {
      if (error) {
        return console.error(error);
      }
      console.log(output);
    });
    docker.createService({Name: 'axel-system-nginx', Networks: 'axel-net', TaskTemplate: {ContainerSpec: {Image: 'axel-nginx'}} })
    docker.createContainer({Image: 'axel-nginx:latest', name: 'axel-system-nginx'}, function (err, container) {
      container.start(function (err, data) {
        console.log(response)
      });
    });
  }
}
