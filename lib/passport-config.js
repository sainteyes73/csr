const LocalStrategy = require('passport-local').Strategy;
const sql = require('mssql');
//const connection = new sql.ConnectionPool('mssql://genuine:Amotech209#@192.168.18.69:14233/AMOERP');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
var logger = require('../routes/logger');

/**
 * Query definitions
 */

const idQuery = 'SELECT empid,LoginPwd,empname,MinorName, Cellphone, Phone FROM V_WHOIS_USER WHERE empid =';
const deserializeQuery = 'SELECT empid FROM V_WHOIS_USER WHERE empid =';

/**
 * Expose
 */
var config = {
  user: 'genuine',
  password: 'Amotech209#',
  server: '192.168.18.69',
  database: 'AMOERP',
  port: 14233,

  options: {
    encrypt: true
  }
}

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser((user, done) => {
     done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
     User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField: 'userid',
    passwordField: 'password',
    passReqToCallback: true
  }, async(req, userid, password,done)=>{
      try{
        var user1=await User.findOne({userid:{'$regex':userid , '$options':'i'}});
        if(user1 && await user1.validatePassword(password)){
          console.log(user1);
          logger.info(user1);
          return done(null,user1,req.flash('success','AMO그룹 전산팀 문의 서비스'));
        }
        await sql.close()
        let pool= await sql.connect(config);
        let result1= await pool.request()
        .input('input_parameter',sql.VarChar(50), `${userid}`)
        .query(`${idQuery} @input_parameter`);
        console.log(result1);
        if((!result1.recordsets)||(result1.recordset[0].LoginPwd!=req.body.password)){//수정완료
          return done(null, false, req.flash('danger','사번이 존재하지 않거나 비밀번호가 틀립니다.'))
        }
        var user=new User({
          'userid':userid,
          'name':result1.recordset[0].empname,
          'minorname': result1.recordset[0].MinorName,
          'phonenum': result1.recordset[0].Cellphone,
          'extension': result1.recordset[0].Phone
        });
        user.password=await user.generateHash(req.body.password);
        await user.save();
        return done(null,user,req.flash('success','최초 로그인 성공'))
      } catch (err) {
   // ... error checks
   console.log(err);
       return done(null, false, req.flash('danger', '아이디나 패스워드가 틀렸습니다'));
 }
}));

  /*
    passport.use('local-signin', new LocalStrategy({
        usernameField: 'userid',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, userid, password, done) => {
        sql.connect(config).then(pool=>{
          return pool.request()
          //.input('select_sal',sql.Int,value)//input parameter
          .query(`${idQuery} '${userid}'`)//query
        }).then(result=>{//if문으로 한번 확인 후 다시 if절 돌입
          if(result.recordset[0]==null){
            sql.close();
            return done(null, false, req.flash('danger', 'wrong id or password'));
          }
          try{
            if(userid==result.recordset[0].empid && password==result.recordset[0].LoginPwd){
              var user = {
                'userid': userid,
                'username': result.recordset[0].empname
              };
              sql.close();
              return done(null, user, req.flash('success', 'welcome!') );
            }
            sql.close();

          }catch(err){
            done(err);
            sql.close();

          }
      }).catch(err=>{
        sql.close();
        console.log(err);

      });
  }));
  */
}
