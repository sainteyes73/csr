var express=require('express');
var router=express.Router();
const catchErrors=require('../lib/async-error');
const passport=require('passport');

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('signin');
  }
}

router.get('/', needAuth,catchErrors(async(req,res,next)=>{

  res.render('index');
}));


module.exports=router;
