const express = require('express');
const Company = require('../models/company');
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
  const companys = await Company.find({});
  if(req.user.adminflag!=1){
    req.flash('danger', '관리자만 접근 가능');
    return res.redirect('back');
  }

  res.render('companys/index', {companys: companys});
}));

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  res.render('companys/edit', {company: company});
}));

router.get('/new', (req, res, next) => {
  res.render('companys/new', {messages: req.flash()});
});


router.get('/:id', catchErrors(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  res.render('companys/show', {user: company});
}));

router.post('/', catchErrors(async(req,res,next)=>{
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var company = await Company.findOne({number: req.body.number.trim()});
  if (company) {
    req.flash('danger', 'number already exists.');
    return res.redirect('back');
  }
  company = new Company({
    name: req.body.name,
    number: req.body.number
  });
  await company.save();
  req.flash('success', 'Registered successfully.');
  res.redirect('/companys');
}))

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
  var name;
  var number;
  const company = await Company.findById({_id: req.params.id});
  const number_company = await Company.find({number: req.body.number.trim()});
  if (!company) {
    req.flash('danger', 'Not exist company.');
    return res.redirect('back');
  }
  if (number){
    req.flash('danger','번호가 중복되었습니다.');
    return res.redirect('back');
  }
  name=req.body.name.trim();
  number= req.body.number.trim();
  company.name=name;
  company.number=number;

  await company.save();
  req.flash('success', '성공적으로 업데이트 되었습니다.');
  res.redirect('/companys');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  const company = await Company.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Deleted Successfully.');
  res.redirect('/companys');
}));

module.exports = router;
