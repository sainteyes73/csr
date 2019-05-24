var express = require('express');
var index = require('./routes/index.js');
var engines = require('consolidate');
var cookieParser=require('cookie-parser');
var path=require('path');
var select=require('./routes/list.js')
var sassMiddleware = require('node-sass-middleware');
var passport=require('passport')
var passportConfig = require('./lib/passport-config');
var flash = require('connect-flash');
var logger = require('morgan');
var session  = require('express-session');

module.exports=(app,io)=>{
  app.set('views',path.join(__dirname,'views'));
  app.set('view engine', 'pug');
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(flash());
  app.use(session({
    secret:'afasdwqsdasdasd',
    resave: false,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);
  app.use('/', index);
  require('./routes/auth')(app, passport);
  app.use('/select', select);



  // public 디렉토리에 있는 내용은 static하게 service하도록.

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });



  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;  // passport는 req.user로 user정보 전달
    res.locals.flashMessages = req.flash();
    next();
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
