var express = require('express');
var index = require('./routes/index.js');
var engines = require('consolidate');
var cookieParser = require('cookie-parser');
var path = require('path');
var list = require('./routes/list.js');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var passport = require('passport')
var passportConfig = require('./lib/passport-config');
var flash = require('connect-flash');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var questions = require('./routes/questions');
var passportSocketIo = require('passport.socketio');
var db = mongoose.connection;

module.exports = (app, io) => {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.locals.moment = require('moment');
  app.locals.querystring = require('querystring');

  //=======================================================
  // mongodb connect
  //=======================================================
  mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.
  //const connStr = 'mongodb://localhost/mjdb4';
  // 아래는 mLab을 사용하는 경우의 예: 본인의 접속 String으로 바꾸세요.
  // const connStr = 'mongodb://dbuser1:mju12345@ds113825.mlab.com:13825/sampledb1';
  db.once('open', function() {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
  });

  mongoose.connect('mongodb://localhost:27017/test');


  mongoose.connection.on('error', console.error);
  app.use(cookieParser());
  app.use(flash());
  const sessionStore = new session.MemoryStore();
  const sessionId = 'woosung';
  const sessionSecret = 'TODO: change this secret string for your own';
  // session을 사용할 수 있도록.
  app.use(session({
    name: sessionId,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    secret: sessionSecret
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);

  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser, // the same middleware you registrer in express
    key: sessionId, // the name of the cookie where express/connect stores its session_id
    secret: sessionSecret, // the session_secret to parse the cookie
    store: sessionStore, // we NEED to use a sessionstore. no memorystore please
    passport: passport,
    success: (data, accept) => {
      console.log('successful connection to socket.io');
      accept(null, true);
    },
    fail: (data, message, error, accept) => {
      // 실패 혹은 로그인 안된 경우
      console.log('failed connection to socket.io:', message);
      accept(null, false);
    }
  }));


  // connection 요청이 온 경우
  io.on('connection', socket => {
    console.log('socket connection!');
    if (socket.request.user.logged_in) {
      // 로그인이 된 경우에만 join 요청을 받는다.
      socket.emit('welcome');
      socket.on('join', data => {
        // 본인의 ID에 해당하는 채널에 가입시킨다.
        socket.join(socket.request.user._id.toString());
      });
    }
  });
  app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // passport는 req.user로 user정보 전달
    res.locals.flashMessages = req.flash();
    next();
  });

  app.use('/', index);
  require('./routes/auth')(app, passport);
  app.use('/list', list);
  app.use('/questions', questions(io));
  app.use('/api', require('./routes/api'));

  // public 디렉토리에 있는 내용은 static하게 service하도록.

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });



  // error handler

  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}
