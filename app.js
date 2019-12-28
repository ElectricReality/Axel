const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongo = require('./modules/mongo.js')
const LocalStrategy = require('passport-local').Strategy;
const port = 8080;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set('views', __dirname + '/dashboard/ejs');
app.use("/public", express.static(__dirname + '/dashboard/public'));
app.listen(port, () => console.log('Axel is listening on ' + port));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});
passport.use(new LocalStrategy(
  async function(username, password, done) {
    let user = mongo.get('users', {
      username: username
    })
    if (!user) {
      return done(null, false);
    }
    bcrypt.compare(password, user.password, function(err, res) {
      if(res == false) {
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
  let user = await mongo.getall('user')
  console.log(user)
  if(!user) {
    return res.render("register.ejs", { message: 'Please register your new credentials!' });
  }
  res.redirect("/login")
})

app.post("/register", async(req,res,next) => {
  let user = await mongo.getall('user')
  console.log(user)
  if(user == []) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if(err) {
        console.log(err)
      }
      mongo.post('users', {username: req.body.password, password: hash})
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
    if (!user) { return res.render('login.ejs',{ message: 'Password/Username is Incorrect' }); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

app.get("/dashboard", authCheck, function(req, res, next) {
  res.render("dashboard.ejs", { message: '' });
});
