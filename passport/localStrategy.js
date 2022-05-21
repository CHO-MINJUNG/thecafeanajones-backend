const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/User');

// done(error 여부, 결과 값, 실패하였을 경우의 정보)
module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    session: true,
    passReqToCallback: false
  }, async (phone, userPassword, done) => {
    try {
      const isUser = await User.findOne({where:{ phone }});
      if (!isUser) {
        return done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
      
      const isPasswordCorrect = await bcrypt.compare(userPassword, isUser.password);
      if (isPasswordCorrect) {
        return done(null, isUser);
      } else {
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
      }

    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};