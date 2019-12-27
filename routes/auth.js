module.exports = (app, passport) => {
  app.get('/signin', (req, res, next) => {
    res.render('signin');
  });

  app.post('/signin', passport.authenticate('local-signin',{
    failureRedirect : '/signin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}),(req, res)=>{
  if(req.session.returnTo){
    var redirURL=req.session.returnTo;
    delete req.session.returnTo;
    req.session.save(function(err){
      if(err) return next(err);
      res.redirect('/questions'+redirURL);
    });
  }else{
    res.redirect('/');
  }
});
  app.get('/signout', (req, res) => {
    req.logout();
    req.flash('success', '로그아웃이 성공적으로 이루어졌습니다');
    res.redirect('/signin');
  });
};
