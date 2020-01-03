const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const status = require('os')
const bcrypt = require('bcrypt');
const Docker = require('./modules/docker.js')
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
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
      if(allow == false) {
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

app.get("/register", async(req,res,next) => {
  let user = await mongo.getall('users')
  if(user.length == 0) {
    return res.render("register.ejs", { message: 'Please register your new credentials!' });
  }
  res.redirect("/login")
})

app.post("/register", async(req,res,next) => {
  let user = await mongo.getall('users')
  if(user.length == 0) {
    bcrypt.hash(req.body.Password, 15, function(err, hash) {
      if(err) {
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
  res.render("login.ejs", { message: '' });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (user == false) {
      return res.render('login.ejs',{ message: 'Password/Username is Incorrect' });
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

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.get("/dashboard", authCheck, function(req, res, next) {
  res.render("dashboard.ejs", { message: '' });
});

app.get("/settings", authCheck, function(req, res, next) {
  res.render("settings.ejs", { message: '' });
});

app.post("/settings", authCheck, function(req, res, next) {
  let domain = req.body.domain
  let query = {
    username: req.body.Username,
    cert: "Not set",
    certkey: "Not set"
  }
  mongo.post('users', query)
  res.render("settings.ejs", { message: '' });
});

app.get("/applications", authCheck, function(req, res, next) {
  res.render("applications.ejs", { message: '' });
});

app.get("/settings/update", authCheck, function(req, res, next) {
  docker.Service.Update()
  res.render("update.ejs", { message: '' });
});

// Update Nginx settings
console.log("Version 1.0.e")
nginx.update()
