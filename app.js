const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongo = require('./modules/mongo.js')
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const port = 8080;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set('views', __dirname + '/dashboard/ejs');
app.use("/public", express.static(__dirname + '/dashboard/public'));
app.use(session({
      store: new MemoryStore({
        checkPeriod: 109900000
      }),
      secret: process.env.session,
      resave: false,
      saveUninitialized: false
}));

app.listen(port, () => console.log('Axel is listening on ' + port));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(user, cb) {
  cb(null, user);
});
passport.use(new LocalStrategy(
  async function(username, password, done) {
    let user = await mongo.get('users', {
      username: username
    })

    console.log(user)

    if (user === undefined || user.length == 0) {
      console.log("User Not Found")
      return done(null, false);
    }

    bcrypt.compare(password, user.hash, function(err, res) {
    if(res == false) {
      console.log("Password Not Found")
      return done(null, false);
    }
    });

    return done(null, user);
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
    if (user === undefined) {
      return res.render('login.ejs',{ message: 'Password/Username is Incorrect' });
    }
    req.logIn(user, function(err) {
      console.log("Authentication Starting")
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
