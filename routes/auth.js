const express = require('express');
const path = require('path');
const passport = require('passport');
const bcrypt = require('bcrypt');

const SALTROUNDS = 12;
const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');
const  User  = require('../models/User');

const router = express.Router();

router.get('/session', (req, res) => {
  const isLoggedIn = req.isAuthenticated();
  console.log(req.isAuthenticated());
  return res.send({"isLoggedIn": isLoggedIn});
})

router.post('/isUser', async (req, res) => {
  try {
    const {phone} = req.body;
    const isUser = await User.findOne({where: {phone}});
    if (isUser){
      return res.send({isUser: 'login'})
    }else {
      return res.send({isUser: 'join'})
    }
  } catch(err) {
    console.log(err);
    return res.send({message: "에러 발생"})
  }
})

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const {phone, password} = req.body; 
  try{
    const isUser = await User.findOne({where: {phone}});

    if (isUser){
      return res.send( {isRegistered:false, message: "이미 가입된 번호입니다"});    
    }
    const password_encrypted = await bcrypt.hash(password, SALTROUNDS);
    await User.create({
      phone:phone,
      password:password_encrypted,
    })
    return res.send({isRegistered:true})

  } catch(error){
    console.log(error);
    return res.send({message: "에러 발생"});
  }
});

// authenticate(전략, 콜백함수(앞의 전략(local)에서 done함수 결과값들을 차례대로 받아오게 하는 것))
  router.post('/login', isNotLoggedIn, (req, res, next) => {
    console.log("아니", req.isAuthenticated());
    passport.authenticate('local', (authError, isUser, info) => {
      if (authError) {
        console.log("이건가");
        console.error(authError);
        return next(authError);
      }
      if (!isUser) {
        return res.send({isLoggedIn:false, message: info.message})
      }
      
      return req.login(isUser, (loginError) => {
        if (loginError) {
          return next(loginError);
        } 
        return res.send({isLoggedIn:true});
      });
    })(req, res, next) ; // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
  });
  
  router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    return res.send({logoutSuccess:true})
  })

module.exports = router;