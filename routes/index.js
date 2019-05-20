var express=require('express');
var router=express.Router();
const catchErrors=require('../lib/async-error');
const passport=require('passport');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
  //  req.flash('danger', 'Please signin first.');
    res.redirect('signin');
  }
}

router.get('/', needAuth, catchErrors(async(req,res,next)=>{
  res.render('index');
}));

router.get('/signin', (req, res, next) => {
  res.render('signin');
});

router.get('/list',(req,res,next)=>{
  res.render('list');
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/questions', // redirect to the secure profile section, 이때는 routes에 index.js를 가져온다
  failureRedirect: '/signin', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/signout', (req, res) => {
  req.logout();
  //req.flash('success', 'Successfully signed out');
  res.redirect('/');
});


module.exports=router;
