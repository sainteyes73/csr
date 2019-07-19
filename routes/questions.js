const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer');
const catchErrors = require('../lib/async-error');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


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
    var eventtopic = form.eventtopic || "";
    if (!title) {
      return '제목을 입력해주세요.';
    }
    if (!place) {
      return 'Place is required.';
    }
    if(!noticeContent){
      return '내용을 입력해주세요.'
    }

    if (!eventtopic) {
      return 'eventtopic is required';
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

  router.post('/uploader', multipartMiddleware, function(req, res) {
    var fs = require('fs');

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
              html += "    var message = \"서버로 전송 클릭 후 이미지 크기 조절해주세요.\";";
              html += "";
              html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
              html += "</script>";

              res.send(html);
            }
        });
    });
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const question = await Question.findById(req.params.id);
    res.render('questions/edit', {
      question: question
    });
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const question = await Question.findById(req.params.id).populate('author');
    const user= await User.findById(req.params.id);
    const answers = await Answer.find({
      question: question.id
    }).populate('author');
    question.numReads++; // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await question.save();
    res.render('questions/show', {
      user:user,
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
    question.place = req.body.place;
    question.noticeContent = req.body.noticeContent;
    question.eventtopic = req.body.eventtopic;
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
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    const user = req.user;
    console.log(req.user + 'okaybab');
    var question = new Question({
      author: user._id,
      title: req.body.title,
      place: req.body.place,
      noticeContent: req.body.noticeContent,
      eventtopic: req.body.eventtopic
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
