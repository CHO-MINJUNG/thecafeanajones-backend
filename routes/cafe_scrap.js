const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

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
      if (err.code == "ER_DUP_ENTRY"){
        return res.send({message: "이미 저장된 카페입니다"})
      }
      return res.send({message:"요청이 실패하였습니다."})
    } 
    return res.send({message:"저장 완료"})
  })
})

router.post('/delete', isLoggedIn, (req, res) => {
  connection.query(
    `delete from user_scrap where user_id=${req.user.id} and cafe_id=${req.body.cafe_id}`,
  (err, rows, field) => {
    if(err) {
      return res.send({message:"요청이 실패하였습니다."})
    } 
    return res.send({message:"삭제 완료"})
  })
})

router.get('/filter', isLoggedIn, (req, res) => {
  connection.query(
    `select *
    from cafe as c, user_scrap as u
    where c.id = u.cafe_id and u.user_id = ${req.user.id}`,
  (err, rows, field) => {
    return res.send(rows);
  })
})


module.exports = router;