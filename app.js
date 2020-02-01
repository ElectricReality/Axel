const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const Docker = require('dockerode');
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const bcrypt = require('bcrypt');
const mongo = require('./modules/mongo.js')
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const port = 8080;
const app = express();
const nginx = require('./modules/nginx.js')
const uuid = require('uuid/v4')
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
  console.log('Updating Axel Service!')
  docker.buildImage(null, {
    t: 'axel:latest',
    remote: 'https://github.com/ElectricReality/Axel.git',
  }, async function(err, data) {
    if (err) {
      return console.log(err)
    }
    if (data.statusCode == 200) {
      docker.listServices({}).then(async function(data2) {
        let servicesearch = await data2.find(s => s.Spec.Name == "axel-system")
        const service = docker.getService(servicesearch.ID)
        console.log('---------------------------')
        console.log(data2)
        console.log('---------------------------')
        console.log(servicesearch)
        console.log('---------------------------')
        console.log(service)
        console.log('---------------------------')
        let options1 = {
          Name: 'axel-system',
          version: parseInt(servicesearch.Version.Index),
          TaskTemplate: servicesearch.Spec.TaskTemplate,
          Networks: servicesearch.Spec.Networks,
          Mode: servicesearch.Spec.Mode,
          UpdateConfig: servicesearch.Spec.UpdateConfig,
          EndpointSpec: servicesearch.Spec.EndpointSpec
        }
        options1.TaskTemplate.ContainerSpec.Labels.randomLabelForceUpdate = uuid()
        let options2 = JSON.stringify(options1)
        console.log(options2)

        /* let options2 = {
          Name: 'axel-system',
          version: parseInt(servicesearch.Version.Index),
          TaskTemplate: {
            ContainerSpec: {
              Image: 'axel',
              Mounts: [{
                Type: 'bind',
                Source: '/var/run/docker.sock',
                Target: '/var/run/docker.sock'
              }]
            },
            Resources: {
              Limits: {},
              Reservations: {}
            },
            RestartPolicy: {
              Condition: 'any',
              MaxAttempts: 0
            },
            Placement: {}
          },
          Networks: [{
              Target: 'axel-net',
            },
            {
              Target: 'ingress'
            }
          ],
          Mode: {
            Replicated: {
              Replicas: 1
            }
          },
          UpdateConfig: {
            Parallelism: 0
          },
          EndpointSpec: {
            Mode: 'vip',
            Ports: [{
              Protocol: 'tcp',
              TargetPort: 8080,
              PublishedPort: 8080,
              PublishMode: 'ingress'
            }]
          }
        }*/
        service.update(options2, async function(err3, data3) {
          if (err3) {
            return console.log(err3)
          }
          console.log(data3)
        })
      })
    }
  })
  res.render("update.ejs", {
    message: ''
  });
});

// Update Nginx settings
nginx.update()
