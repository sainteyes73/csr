var express = require('express');
var index = require('./routes/index.js');
var engines = require('consolidate');
var app=express();
var cookieParser=require('cookie-parser');
var path=require('path');
var select=require('./routes/list.js')
var sassMiddleware = require('node-sass-middleware');
var passport=require('passport')
var passportConfig = require('./lib/passport-config');
var flash = require('connect-flash');
var session  = require('express-session');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

app.use('/', index);
app.use('/select', select);
app.use(cookieParser());
app.use(session({
  secret:'afasdwqsdasdasd',
  resave: false,
  saveUninitialized: true
}));
// public 디렉토리에 있는 내용은 static하게 service하도록.
app.use(express.static(path.join(__dirname, '/public')));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(flash()); // flash message를 사용할 수 있도록
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

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

app.listen(8080,()=>{
  console.log('express app on port 8080!');
});

module.exports=app;
