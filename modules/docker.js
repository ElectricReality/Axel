const http = require('http')
const querystring = require('querystring');
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
          if (res.statusCode !== 200) {
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
    update: async function(id, queryparams, opt, callback) {
      console.log('Service Updating')
      let queryparamsstr = querystring.stringify(queryparams)
      let options = await JSON.stringify(opt)
      let path = `/v1.40/services/${id}/update?${queryparamsstr}`
      let request = http.request({
        socketPath: '/var/run/docker.sock',
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(options)
        }
      }, (res) => {
        res.setEncoding('utf8');
        let data = ''
        res.on('data', function(chunk) {
          data += chunk
        });
        res.on('end', function() {
          if (res.statusCode !== 200) {
            let result = {
              output: data,
              statusCode: res.statusCode,
              message: 'Update Failed!'
            }
            return callback(result, null)
          }
          let result = {
            output: data,
            message: 'Update Successful!'
          }
          callback(null, result)
        })
      });
      request.write(options)
      request.end();
    }
  },
  image: {
    build: async function(opt, callback) {
      let options = querystring.stringify(opt)
      let path = `/v1.40/build?${options}`
      let request = http.request({
        socketPath: '/var/run/docker.sock',
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(options)
        }
      }, (res) => {
        res.setEncoding('utf8');
        let data = ''
        res.on('data', function(chunk) {
          data += chunk
        });
        res.on('end', function() {
          if (res.statusCode !== 200) {
            let result = {
              output: data,
              statusCode: res.statusCode,
              message: 'Build Failed!'
            }
            return callback(result, null)
          }
          let result = {
            output: data,
            message: 'Build Successful!'
          }
          callback(null, result)
        })
      });
      request.write(options)
      request.end();
    }
  }
}
module.exports = docker
