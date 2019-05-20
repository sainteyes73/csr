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
    const request = new sql.Request(connection);
    request.query(`${deserializeQuery} ${id}`, (err, recordset) => {
      done(err, recordset[0]);
    });
  });

  // use local strategy
  passport.use(new LocalStrategy(
    (username, password, done) => {
      const ps = new sql.PreparedStatement(connection);
      ps.input('usernameParam', sql.VarChar);
      ps.prepare(strategyQuery, (err) => {
        // catch prepare error
        if (err) {
          return done(err);
        }

        ps.execute({
          usernameParam: username,
        }, (err, recordset) => {
          // catch execute error
          if (err) {
            return done(err);
          }

          ps.unprepare((err) => {
            // catch unprepare error
            if (err) {
              return done(err);
            }
          });

          // user does not exist
          if (recordset.length <= 0) {
            return done(null, false, {
              message: 'Invalid username or password',
            });
          } else {
            const user = recordset[0];
            // compare input to hashed password in database
            const isValid = bcrypt.compareSync(password, user.password);

            if (isValid) {
              // user
              return done(null, user);
            } else {
              // password is invalid
              return done(null, false, {
                message: 'Invalid username or password',
              });
            }
          }
        });
      });
    }));
};
