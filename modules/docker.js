/*
I ended up making things separately. This file contains the docker functions in
such a way that its easier to get it. Sorry YEet.

Information:
Uses Docker Rest API version v1.34
const http = require('http');

// Get Services
let request = http.request({
  socketPath: '/var/run/docker.sock',
  path: '/v1.40/services'
}, (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`statusCode: ${res.statusCode}`)
    let result = JSON.parse(data);
    res.json(result)
  });
});
request.end();

// Service Update
let post = JSON.stringify({
  Name: 'Name of service',
  version: 1 + 1, // Change this to parseInt(result.Version.Index) when you get the result
  TaskTemplate: {
    ContainerSpec: {
      Image: 'axel:latest',
      Mounts: [{
        Type: 'bind',
        Source: '/var/run/docker.sock',
        Target: '/var/run/docker.sock'
      }]
    },
  },
  Networks: [{
    Target: 'axel-net',
  }],
  EndpointSpec: {
    Ports: [{
      Protocol: 'tcp',
      TargetPort: 3000,
      PublishedPort: 3000,
    }]
  }
})
let request = http.request({
  socketPath: '/var/run/docker.sock',
  path: `/services/${result.id}/update`
}, (res) => {
  if (res.statusCode !== 200) {
    return console.log('something went wrong.')
  }
});
request.write(post)
request.end();

// Build Image
let post = JSON.stringify({
  t: 'axel:latest',
  remote: 'remote here thanks dont be dumb'
})
let request = http.request({
  socketPath: '/var/run/docker.sock',
  path: '/v1.40/build'
}, (res) => {
  if (res.statusCode !== 200) {
    return console.log('something went wrong.')
  }
});
request.write(post)
request.end();
*/
const http = require('http')
let docker = {
  service: {
    list: async function(callback) {
      let request = http.request({
        socketPath: '/var/run/docker.sock',
        path: '/v1.40/services'
      }, (res) => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          if(res.statusCode !== 200){
            let result = JSON.parse(data);
            callback(result, null)
          } else {
            let result = JSON.parse(data);
            callback(null, result)
          }
        });
      });
      request.end();
    },
  },
  image: {
    build: async function(options,callback) {
      let post = JSON.stringify(options)
      let request = http.request({
        socketPath: '/var/run/docker.sock',
        path: '/v1.40/build',
        method: 'POST',
        qs: {
          t: "axel",
          remote: "http://github.com/ElectricReality/Axel.git"
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          if(res.statusCode !== 200){
            let result = JSON.parse(data);
            callback(result, null)
          } else {
            let result = JSON.parse(data);
            callback(null, result)
          }
        });
      });
      request.end();
    }
  }
}
module.exports = docker
