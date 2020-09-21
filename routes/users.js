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
  var userid = form.userid || "";
  userid = userid.trim();
  if (!userid) {
    return 'userid is required.';
  }
  return null;
}

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const users = await User.find({});
  if(req.user.adminflag!=1){
    req.flash('danger', '관리자만 접근 가능');
    return res.redirect('back');
  }

  res.render('users/index', {users: users});
}));

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/edit', {user: user});
}));

router.get('/:id/email', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/emailedit', {user: user});
}));

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});


router.get('/:id', catchErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.render('users/show', {user: user});
}));

router.post('/', catchErrors(async(req,res,next)=>{
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({id: req.body.userid});
  if (user) {
    req.flash('danger', 'id already exists.');
    return res.redirect('back');
  }
  user = new User({
    userid: req.body.userid,
    name: req.body.name,
    email: req.body.email,
    adminflag: req.body.adminflag,
    csrflag: 1
  });
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}))

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  const user = await User.findById({_id: req.params.id});
  if (!user) {
    req.flash('danger', 'Not exist user.');
    return res.redirect('back');
  }

  user.userid=req.body.userid;
  user.name = req.body.name;
  user.email = req.body.email;
  user.adminflag = req.body.adminflag;

  await user.save();
  req.flash('success', 'Updated successfully.');
  res.redirect('/users');
}));

router.put('/:id/email', needAuth, catchErrors(async (req, res, next) => {
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

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const user = await User.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('/users');
}));

module.exports = router;
