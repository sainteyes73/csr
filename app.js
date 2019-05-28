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
var mongoose   = require('mongoose');

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
  const connStr = (process.env.NODE_ENV == 'production') ?
    'mongodb://db1:antusdk2@ds033196.mlab.com:33196/woosung' :
    'mongodb://localhost/mjdb4';
  //const connStr = 'mongodb://localhost/mjdb4';
  // 아래는 mLab을 사용하는 경우의 예: 본인의 접속 String으로 바꾸세요.
  // const connStr = 'mongodb://dbuser1:mju12345@ds113825.mlab.com:13825/sampledb1';
  mongoose.connection.on('error', console.error);
  app.use(cookieParser());
  app.use(flash());
  app.use(session({
    secret: 'afasdwqsdasdasd',
    resave: false,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);

  app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // passport는 req.user로 user정보 전달
    res.locals.flashMessages = req.flash();
    next();
  });

  app.use('/', index);
  require('./routes/auth')(app, passport);
  app.use('/list', list);


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
