/*
I ended up making things separately. This file contains the docker functions in
such a way that its easier to get it. Sorry YEet.

Information:
Uses Docker Rest API version v1.34
*/
const http = require('http');

// Get Services
let request = http.request({
  socketPath: '/var/run/docker.sock',
  path: '/v1.37/services'
}, (response) => {
  let data = '';
  response.on('data', chunk => {
    data += chunk;
  });
  response.on('end', () => {
    console.log(`statusCode: ${response.statusCode}`)
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
}, (response) => {
  if (response.statusCode !== 200) {
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
  path: '/v1.37/build'
}, (response) => {
  if (response.statusCode !== 200) {
    return console.log('something went wrong.')
  }
});
request.write(post)
request.end();
