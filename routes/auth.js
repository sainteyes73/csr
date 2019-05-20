const express = require('express');
const router = express.Router();

router.get('/signin', (req, res, next) => {
  res.render('signin');
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/questions', // redirect to the secure profile section, 이때는 routes에 index.js를 가져온다
  failureRedirect: '/signin', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/signout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully signed out');
  res.redirect('/');
});

module.exports=router;
