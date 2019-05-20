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

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.use('/', index);
app.use('/select', select);

app.use(cookieParser());
// public 디렉토리에 있는 내용은 static하게 service하도록.
app.use(express.static(path.join(__dirname, '/public')));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
console.log('ok')
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);
// error handler
require('./routes/auth')(passport);

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
