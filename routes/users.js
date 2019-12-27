const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchErrors = require('../lib/async-error');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.returnTo= req.path;
    req.session.save(function(err){
      if(err) return next(err);
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin')
    })
  }
}

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({});
  var userEmail=req.user.email;
  if(userEmail!="administrator"){
    req.flash('danger', '관리자만 접근 가능');
    return res.redirect('back');
  }

  res.render('users/index', {users: users});
}));

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});


router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));



module.exports = router;
