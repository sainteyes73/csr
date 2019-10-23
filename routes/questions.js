const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('file-system');

module.exports = io => {
  const router = express.Router();

  // 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
  function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
  }


  function validateForm(form, options) {
    var title = form.title || "";
    var place = form.place || "";
    var noticeContent = form.noticeContent || "";
    if (!title) {
      return '제목을 입력해주세요.';
    }
    if(!noticeContent){
      return '내용을 입력해주세요.'
    }

    return null;
  }
  /* GET questions listing. */
  router.get('/', needAuth, catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(req + '/question(get)');
    var query = {};
    const term = req.query.term;
    console.log(req.query.term);
    if (term) {
      query = {
        $or: [{
            title: {
              '$regex': term,
              '$options': 'i'
            }
          },
          {
            noticeContent: {
              '$regex': term,
              '$options': 'i'
            }
          },
          {
            eventtopic: {
              '$regex': term,
              '$options': 'i'
            },
            manager:{
              '$regex': term,
              '$options': 'i'
              }
          }
        ]
      };
    }
    const questions = await Question.paginate(query, {
      sort: {
        createdAt: -1
      },
      populate: 'author',
      page: page,
      limit: limit
    });
    res.render('questions/index', {
      questions: questions,
      term: term,
      query: req.query
    });
  }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('questions/new', {
      question: {}
    });
  });

  router.get('/adminpage', needAuth, async (req,res,next)=>{
    if(req.user.adminflag!='1'){
      res.redirect('/questions')
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(req._passport.session.user);
    const questions = await Question.paginate({
      manager:req.user._id
    }, {
      sort: {
        createdAt: -1
      },
      populate: 'author',
      page: page,
      limit: limit
    });
    res.render('questions/adminpage', {
      questions: questions,
      query: req.query
    });
  })
  router.get('/userpage', needAuth, async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(req._passport.session.user);
    const questions = await Question.paginate({
      author:req.user._id
    }, {
      sort: {
        createdAt: -1
      },
      populate: 'author',
      page: page,
      limit: limit
    });
    res.render('questions/userpage', {
      questions: questions,
      query: req.query
    });
  })
  router.post('/uploader', multipartMiddleware, function(req, res) {
    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/../public/uploads/' + req.files.upload.name;
        console.log(newPath);
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
              html = "";
              html += "<script type='text/javascript'>";
              html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
              html += "    var url     = \"/uploads/" + req.files.upload.name + "\";";
              html += "    var message = \"이미지 크기 조절 후 확인버튼 눌러주세요.\";";
              html += "";
              html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
              html += "</script>";

              res.send(html);
            }
        });
    });
  });
  router.post('/uploader/drag', multipartMiddleware, function(req, res) {

    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/../public/uploads/drag/' + req.files.upload.name;
        console.log(newPath);
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
              var file= {
                uploaded:1,
                url:"/uploads/drag/" + req.files.upload.name,
                filename:req.files.upload.name
              }
              console.log(file);
              res.json(file);
            }
        });
    });
  });
  router.post('/:id/uploader', multipartMiddleware, function(req, res) {
    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/../public/uploads/' + req.files.upload.name;
        console.log(newPath);
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
              html = "";
              html += "<script type='text/javascript'>";
              html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
              html += "    var url     = \"/uploads/" + req.files.upload.name + "\";";
              html += "    var message = \"이미지 크기 조절 후 확인버튼 눌러주세요.\";";
              html += "";
              html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
              html += "</script>";

              res.send(html);
            }
        });
    });
  });
  router.post('/:id/uploader/drag', multipartMiddleware, function(req, res) {

    fs.readFile(req.files.upload.path, function (err, data) {
        var newPath = __dirname + '/../public/uploads/drag/' + req.files.upload.name;
        console.log(newPath);
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
              var file= {
                uploaded:1,
                url:"/uploads/drag/" + req.files.upload.name,
                filename:req.files.upload.name
              }
              console.log(file);
              res.json(file);
            }
        });
    });
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    console.log('okedit');
    console.log(req._passport.session.user);
    const question = await Question.findById(req.params.id);
    const author = await Question.findById(req.params.id).populate('author');
    if(author.author._id!=req._passport.session.user){ //타사용자가 edit 방지
      res.redirect('/questions')
    }
    res.render('questions/edit', {
      question: question
    });
  }));
  router.get('/:id/indexcall',needAuth, catchErrors(async(req, res, next)=>{
    const question = await Question.findById(req.params.id);

  }))
  router.get('/:id',needAuth, catchErrors(async (req, res, next) => {
    const question = await Question.findById(req.params.id).populate('author');
    const answers = await Answer.find({
      question: question.id
    }).populate('author');
    question.numReads++; // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await question.save();
    res.render('questions/show', {
      question: question,
      answers: answers
    });
  }));

  router.put('/:id', catchErrors(async (req, res, next) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
      req.flash('danger', '등록된 질문이 없습니다.');
      return res.redirect('back');
    }
    const err = validateForm(req.body);
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    question.title = req.body.title;
    question.manager = req.body.manager;
    question.noticeContent = req.body.noticeContent;
    question.selectoption=req.body.selectoption;
    //  question.tags = req.body.tags.split(" ").map(e => e.trim());

    await question.save();
    req.flash('success', '성공적으로 업데이트 되었습니다.');
    res.redirect('/questions');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Question.findOneAndRemove({
      _id: req.params.id
    });
    req.flash('success', '성공적으로 삭제 되었습니다.');
    res.redirect('/questions');
  }));


  router.post('/', needAuth, catchErrors(async (req, res, next) => {
    const err = validateForm(req.body);
    var managerid;
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    console.log(req.body.manager);

    if (req.body.manager=='01'){//김기권
      managerid='A0607024'
    }
    else if(req.body.manager=='02'){//금봉권
      managerid='A0701008'
    }
    else if(req.body.manager=='03'){//경민구
      managerid='A1901009'
    }
    else if(req.body.manager=='04'){//김우성
      managerid='A1903009';
    }
    else if(req.body.manager=='05'){// 강현모
      managerid='A1904002'
    }
    const manager = await User.findOne({
      "userid":managerid
    });

    const user=req.user;
    console.log(managerid + 'okaybab');
    var question = new Question({
      author: user._id,
      title: req.body.title,
      manager: manager._id,
      noticeContent: req.body.noticeContent,
      selectoption: req.body.selectoption
    });
    await question.save(); //mongodb에 저장하는동안 대기
    req.flash('success', '성공적으로 등록되었습니다.');
    res.redirect('/questions');
  }));

  router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const question = await Question.findById(req.params.id);

    if (!question) {
      req.flash('danger', '질문이 존재하지 않습니다.');
      return res.redirect('back');
    }

    var answer = new Answer({
      author: user._id,
      question: question._id,
      noticeContent: req.body.noticeContent
    });
    await answer.save();
    question.numAnswers++;
    await question.save();

    const url = `/questions/${question._id}#${answer._id}`;
    io.to(question.author.toString())
      .emit('answered', {
        url: url,
        question: question
      });
    console.log('SOCKET EMIT', question.author.toString(), 'answered', {
      url: url,
      question: question
    })
    req.flash('success', '성공적으로 답변이 달렸습니다.');
    res.redirect(`/questions/${req.params.id}`);
  }));

  return router;
}
