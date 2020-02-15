const express = require('express');
const Question = require('../../models/question');
const Answer = require('../../models/answer');
const LikeLog = require('../../models/like-log');
const catchErrors = require('../../lib/async-error');
const moment = require('moment');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/questions', require('./questions'));

// Like for Question

router.post('/questions/:id/status', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next({status: 404, msg: 'Not exist question'});
  }
  if (question.status==0){
    question.status=1;
  }
  else if(question.status==1){
    question.status=2;
    question.statusDate=moment().valueOf();
  }
  else if(question.status==2){
    question.status=1;
    question.statusDate=0;
  }
  await question.save();
  return res.json(question.status);
}));

// Like for Answer
router.post('/answers/:id/like', catchErrors(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  answer.numLikes++;
  console.log('answer numlike +1');
  await answer.save();
  return res.json(answer);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});
router.get('/answers/:id/edit', catchErrors(async(req, res, next)=>{
  const answer = await Answer.findById(req.params.id);
  if(!answer){
    return next({status: 404, msg: '삭제된 답변입니다.'})
  }
  console.log('good click')
  res.json({
    content:answer.noticeContent
  });

}));
module.exports = router;
