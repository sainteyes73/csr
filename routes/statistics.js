const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchErrors = require('../lib/async-error');
const Question = require('../models/question');
const Item = require('../models/item');
const Company = require('../models/company');
var fs = require('fs');

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

router.get('/', needAuth, catchErrors(async (req, res, next) => {
  x_data=[]
  y_data=[]
  if (req.user.adminflag != '1') {
    res.redirect('/questions')
  }
  console.log(req.query.static);
  var result;
  Question.aggregate([
    {
    '$match':
        {
          'createdAt':
          {
            $gte: new Date(req.query.datefrom),
            $lte: new Date(req.query.dateto)
           }
        }
      },
      {
          '$group':
              {
                  '_id': '$item',
                  'y_data':{'$sum':1}
              }
       }
    ]).exec(function(err, questions){
      Item.populate(questions, {path:'_id'}, function(err,populatedQuestions){
        console.log(populatedQuestions);
        console.log('x');
        var x,y=0;
        populatedQuestions.forEach(function(content, callback){
          for(var key in content){
            if(key=='_id'){
              console.log(content._id.name);
              x_data.push(content._id.name);
            }
            if(key=='y_data'){
              console.log(content.y_data);
              y_data.push(content.y_data);
            }
          }
        })
        console.log(x_data);
        console.log(y_data);
        res.render('statistics/index', {
          title: 'test',
          datai: JSON.stringify(y_data),
          labeli: JSON.stringify(x_data)
        });
      });
    })

}));

router.get('/login', needAuth, catchErrors(async (req, res, next) => {
  res.render('statistics/login',{

  })
}));


router.get('/corporation', needAuth, catchErrors(async (req, res, next) => {
  x_data=[]
  y_data=[]
  if (req.user.adminflag != '1') {
    res.redirect('/questions')
  }
  console.log(req.query.static);
  var result;
  console.log(req.query.datefrom);
  console.log(req.query.dateto);
  console.log(new Date(req.query.datefrom));
  console.log(new Date(req.query.dateto));
  Question.aggregate([
    {
    '$match':
        {
          'createdAt':
          {
            $gte: new Date(req.query.datefrom),
            $lte: new Date(req.query.dateto)
           }
        }
      },
      {
         '$group':
              {
                  '_id': '$company',
                  'y_data':{'$sum':1},
              }
       }
    ]).exec(function(err, questions){
      console.log('x');
      console.log(questions);
      Company.populate(questions, {path:'_id'}, function(err,populatedQuestions){
        console.log(populatedQuestions);
        console.log('x');
        var x,y=0;
        populatedQuestions.forEach(function(content, callback){
          for(var key in content){
            if(key=='_id'){
              console.log(content._id.name);
              x_data.push(content._id.name);
            }
            if(key=='y_data'){
              console.log(content.y_data);
              y_data.push(content.y_data);
            }
          }
        })
        console.log(x_data);
        console.log(y_data);
        res.render('statistics/corporation', {
          title: 'test',
          datai: JSON.stringify(y_data),
          labeli: JSON.stringify(x_data)
        });
      });
    })

}));
router.post('/login/download', needAuth, catchErrors(async (req, res, next) => {
  console.log(req.body.date)
  fs.readFile(__dirname+'/../public/log/system.log.'+req.body.date,'utf8',function(err,data){
    if(err){
      console.log(err);
      console.log('AAA');
      res.render('statistics/login', {
        date: req.body.date
      })
    }else{
      console.log(data);
      console.log('BBB');
      res.render('statistics/login', {
        log: data,
        date: req.body.date
      })
    }
  })

}));


module.exports = router;
