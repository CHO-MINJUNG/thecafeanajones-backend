const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

// const db_config = require(path.join(__dirname, '../config/database.js'));
// const connection = db_config.init();
// db_config.connect(connection);

// 스크랩 요청
router.post('/', isLoggedIn, (req, res) => {
  connection.query(
    `insert into user_scrap
    set ?`,{
      user_id:req.user.id,
      cafe_id:req.body.cafe_id
    },
  (err, rows, field) => {
    if(err) {
      return res.send({message:"요청이 실패하였습니다."})
    } 
    return res.send({message:"저장 완료"})
  })
})


module.exports = router;