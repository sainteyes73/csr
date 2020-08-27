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

function validateForm(form, options) {
  var email = form.email || "";
  email = email.trim();
  if (!email) {
    return 'Email is required.';
  }
  return null;
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

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', {user: user});
}));

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});


router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  var email;
  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }
  email=req.body.email.trim();
  user.email = email;

  await user.save();
  req.flash('success', '성공적으로 업데이트 되었습니다.');
  res.redirect('/questions');
}));

module.exports = router;
