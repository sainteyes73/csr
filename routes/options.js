const express = require('express');
const Option = require('../models/item');
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
  var name = form.name || "";
  var number = form.number || "";
  name = name.trim();
  number = number.trim();
  if (!name) {
    return 'name is required.';
  }
  if(!number){
    return 'number is required';
  }
  return null;
}

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  const options = await Option.find({});
  if(req.user.adminflag!=1){
    req.flash('danger', '관리자만 접근 가능');
    return res.redirect('back');
  }

  res.render('options/index', {options: options});
}));

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const option = await Option.findById(req.params.id);
  res.render('options/edit', {option: option});
}));

router.get('/new', (req, res, next) => {
  res.render('options/new', {messages: req.flash()});
});


router.get('/:id', catchErrors(async (req, res, next) => {
  const option = await Option.findById(req.params.id);
  res.render('options/show', {user: option});
}));

router.post('/', catchErrors(async(req,res,next)=>{
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var option = await Option.findOne({number: req.body.number.trim()});
  if (option) {
    req.flash('danger', 'number already exists.');
    return res.redirect('back');
  }
  option = new Option({
    name: req.body.name,
    number: req.body.number
  });
  await option.save();
  req.flash('success', 'Registered successfully.');
  res.redirect('/options');
}))

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  var name;
  var number;
  const option = await Option.findById({_id: req.params.id});
  const number_option = await Option.find({number: req.body.number.trim()});
  if (!option) {
    req.flash('danger', 'Not exist option.');
    return res.redirect('back');
  }
  if (number){
    req.flash('danger','번호가 중복되었습니다.');
    return res.redirect('back');
  }
  name=req.body.name.trim();
  number= req.body.number.trim();
  option.name=name;
  option.number=number;

  await option.save();
  req.flash('success', '성공적으로 업데이트 되었습니다.');
  res.redirect('/options');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const option = await Option.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('/options');
}));

module.exports = router;
