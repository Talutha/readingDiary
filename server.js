var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.set('view engine', 'pug');
app.use(bodyParser());

router.use(function (req, res, next) {
  console.log('/' + req.method);
  next();
});

router.get('/', function(req, res) {
  res.render('index', {
    title: 'Whoa there!',
    name: 'Marvin'
  });
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/', function(req, res) {
  console.log(req.body.book);
  console.log(req.body.percent);
  res.send('You are ' + req.body.percent + '% of the way through ' + req.body.book + '!');
});

router.post('/register', function(req, res) {
  res.render('register', {
      firstName:  req.body.firstName,
      lastName:   req.body.lastName,
      email:      req.body.emailAddress,
      username:   req.body.username,
      password:   req.body.password
  });
});

app.use('/', router);

app.listen(3000, function() {
  console.log('App live at port 3000');
});
