const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchErrors = require('../lib/async-error');
const Question = require('../models/question');
const Item = require('../models/item');
const Company = require('../models/company');
var fs = require('fs');

function getToday(){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}

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
  var fromdate=req.query.datefrom;
  var todate=req.query.dateto;
  if(req.query.datefrom==null&&req.query.dateto==null){
    fromdate="2019-01-01";
    todate=getToday();
  }
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
            $gte: new Date(fromdate),
            $lte: new Date(todate)
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
          datefrom: fromdate,
          dateto: todate,
          datai: JSON.stringify(y_data),
          labeli: JSON.stringify(x_data)
        });
      });
    })

}));

router.get('/login', needAuth, catchErrors(async (req, res, next) => {
  var date= getToday();
  res.render('statistics/login',{
    date : date
  })
}));


router.get('/corporation', needAuth, catchErrors(async (req, res, next) => {
  x_data=[]
  y_data=[]
  var fromdate=req.query.datefrom;
  var todate=req.query.dateto;
  if (req.user.adminflag != '1') {
    res.redirect('/questions')
  }
  console.log(req.query.static);
  var result;
  if(req.query.datefrom==null&&req.query.dateto==null){
    fromdate="2019-01-01";
    todate=getToday();
  }
  Question.aggregate([
    {
    '$match':
        {
          'createdAt':
          {
            $gte: new Date(fromdate),
            $lte: new Date(todate)
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
          datefrom: fromdate,
          dateto: todate,
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
