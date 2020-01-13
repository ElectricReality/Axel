const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const status = require('os')
const http = require('http');
const bcrypt = require('bcrypt');
const mongo = require('./modules/mongo.js')
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const port = 8080;
const app = express();
const nginx = require('./modules/nginx.js')
app.use(bodyParser.urlencoded({
  extended: true
}));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set('views', __dirname + '/dashboard/ejs');
app.use("/public", express.static(__dirname + '/dashboard/public'));

function randomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
}
app.use(session({
  store: new MemoryStore({
    checkPeriod: 109900000
  }),
  secret: randomString(32, '#aA'),
  resave: false,
  saveUninitialized: false
}));

app.listen(port, () => console.log('Axel is listening on ' + port));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new LocalStrategy(
  async function(username, password, done) {
    let user = await mongo.get('users', {
      username: username
    })
    if (user == null) {
      return done(null, false);
    }

    bcrypt.compare(password, user.password, function(err, allow) {
      if (allow == false) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    });
  }
));
async function authCheck(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login")
}

// Routes
app.get("/", function(req, res, next) {
  res.render("index.ejs");
});

app.get("/register", async (req, res, next) => {
  let user = await mongo.getall('users')
  if (user.length == 0) {
    return res.render("register.ejs", {
      message: 'Please register your new credentials!'
    });
  }
  res.redirect("/login")
})

app.post("/register", async (req, res, next) => {
  let user = await mongo.getall('users')
  if (user.length == 0) {
    bcrypt.hash(req.body.Password, 15, function(err, hash) {
      if (err) {
        console.log(err)
      }
      let query = {
        username: req.body.Username,
        password: hash
      }
      mongo.post('users', query)
    });
  }
  res.redirect("/login")
})

app.get("/login", function(req, res, next) {
  res.render("login.ejs", {
    message: ''
  });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (user == false) {
      return res.render('login.ejs', {
        message: 'Password/Username is Incorrect'
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log(err)
        return next(err);
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

app.get("/dashboard", authCheck, function(req, res, next) {
  res.render("dashboard.ejs", {
    message: ''
  });
});

app.get("/settings", authCheck, function(req, res, next) {
  res.render("settings.ejs", {
    message: ''
  });
});

app.post("/settings", authCheck, function(req, res, next) {
  let domain = req.body.domain
  let query = {
    username: req.body.Username,
    cert: "Not set",
    certkey: "Not set"
  }
  mongo.post('users', query)
  res.render("settings.ejs", {
    message: ''
  });
});

app.get("/applications", authCheck, function(req, res, next) {
  res.render("applications.ejs", {
    message: ''
  });
});

app.get("/settings/update", async (req, res, next) => {
  let post1 = JSON.stringify({
    t: 'axel:latest',
    remote: 'https://github.com/ElectricReality/Axel.git'
  })
  let request1 = http.request({
    socketPath: '/var/run/docker.sock',
    path: '/v1.37/build'
  }, (response) => {
    response.on('data', chunk => {
      let result = JSON.parse(chunk);
      console.log(result)
    });
    if (response.statusCode !== 200) {
      return console.log('something went wrong. Request 1')
    }

  });
  request1.write(post1)
  request1.end();

  function update(result) {
    let post3 = JSON.stringify({
      Name: 'Name of service',
      version: result.Version.Index + 1,
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
    console.log(result.id)
    let request3 = http.request({
      socketPath: '/var/run/docker.sock',
      path: `/services/${result.id}/update`
    }, (response) => {
      if (response.statusCode !== 200) {
        response.on('data', chunk => {
          let result = JSON.parse(chunk);
          console.log(result)
        });
        return console.log('something went wrong. Request 3')
      }
    });
    request3.write(post3)
    request3.end();
  }

  let request2 = http.request({
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
      let axel = result.find(service => service.Spec.Name == "axel-system")
      update(axel)

    });
  });
  request2.end();
  res.render("update.ejs", { message: '' });
});

// Update Nginx settings
console.log("Version 1.0.e")
nginx.update()
