var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var bookshelf = require('./db');
var router = express.Router();
var path = __dirname + '/views/';

var route = require('./route.js');
var Model = require('./model.js');

app.set('view engine', 'pug');
app.set('views', path);
app.use(cookieParser());
app.use(session({
  secret: 'my secret it AWESOME!',
  resave: false,
  saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());


// Provides a user object to every page if the user is logged in
app.use(function(req, res, next) {
  var user = req.user;
  if(user !== undefined) {
    res.locals.user = user.toJSON();
  }
  next();
});

passport.use(new LocalStrategy(function(username, password, done) {
  new Model.User({username: username}).fetch().then(function(data) {
    var user = data;
    if(user === null) {
      return done(null, false, {message: 'Invalid username or password'});
    } else {
      user = data.toJSON();
      if(!bcrypt.compareSync(password, user.password)) {
        return done(null, false, {message: 'Invalid username or password'});
      } else {
        return done(null, user);;
      }
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  new Model.User({username: username}).fetch().then(function(user) {
    done(null, user);
  });
});

app.use(function (req, res, next) {
  console.log('/' + req.method);
  next();
});

app.get('/', route.index);
app.get('/newbook', route.newBook);
app.post('/newbook', route.newBookPost);
app.get('/updatebook/:isbn', route.updateBook);
app.post('/updatebook/:isbn', route.updateBookPost);
app.get('/booklist', route.bookList);
app.get('/follow/:isbn', route.followBook);
app.get('/unfollow/:isbn', route.unfollowBook);
app.get('/signin', route.signIn);
app.post('/signin', route.signInPost);
app.get('/register', route.register);
app.post('/register', route.registerPost);
app.get('/logout', route.signOut);

app.use(route.notFound404);
app.use('/', router);

app.listen(3000, function() {
  console.log('App live at port 3000');
});
