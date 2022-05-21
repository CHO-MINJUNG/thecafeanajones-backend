const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/User');

module.exports = () => {
    passport.serializeUser((user, done) => {
      // req.session에 저장할 데이터 
      done(null, user.phone);
    });
    passport.deserializeUser((phone, done) => {
      User.findOne({
        where: { phone },
        raw: true,
        // sequelize의 include사용시 문제가 생기면..
        // nested: true
      })
        .then(user => done(null, user))
        .catch(err => done(err));
    });
  
    local();
  };