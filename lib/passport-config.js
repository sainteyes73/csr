const LocalStrategy = require('passport-local').Strategy;
const sql = require('mssql');
const connection = new sql.ConnectionPool('mssql://genuine:Amotech209#@192.168.18.69:14233/AMOERP');
const bcrypt = require('bcrypt-nodejs');

/**
 * Query definitions
 */

const idQuery = 'SELECT empid,LoginPwd FROM V_WHOIS_USER WHERE empid =';
const deserializeQuery = 'SELECT empid FROM V_WHOIS_USER WHERE empid =';

/**
 * Expose
 */
 var config={
   user:'genuine',
   password:'Amotech209#',
   server:'192.168.18.69',
   database:'AMOERP',
   port:14233,

   options:{
     encrypt:true
   }
 }

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser((id, done) => {
    done(null,id);
    sql.close();
    console.log(id);
  });

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
              'userid': userid
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
      console.log(err);

    });
}));
}
