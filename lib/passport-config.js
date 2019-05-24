const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sql = require('mssql');
const connection = new sql.ConnectionPool('mssql://genuine:Amotech209#@192.168.18.69:14233/AMOERP');
const bcrypt = require('bcrypt-nodejs');

/**
 * Query definitions
 */

const deserializeQuery = 'SELECT * FROM [dbo].[V_GW_USER] WHERE [ERP사번] =';
const strategyQuery = 'SELECT [userid], [username], [password], [isadmin] FROM [users] WHERE [username] = @usernameParam';

/**
 * Expose
 */

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    request.query(`${deserializeQuery} ${id}`, (err, recordset) => {
      done(err, recordset[0]);
    });
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({
        email: email
      });
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', 'Welcome!'));
      }
      return done(null, false, req.flash('danger', 'Invalid email or password'));
    } catch (err) {
      done(err);
    }
  }));

};
