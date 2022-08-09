const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

// 스크랩 요청
router.post('/', isLoggedIn, (req, res) => {
  let isAddOrDelete = undefined;

  connection.query(
    `select *
    from user_scrap
    where user_id = ${req.user.id} and cafe_id = ${req.body.cafe_id}`
  , (err, rows, field) => {
    if (rows.length == 0) {
      connection.query(
        `insert into user_scrap
        set ?`,{
          user_id:req.user.id,
          cafe_id:req.body.cafe_id
        },
      (err, rows, field) => {
        let message, success;
        if(err) {
          if (err.code == "ER_DUP_ENTRY"){
            success = false;
            message = "이미 저장된 카페입니다.";
          }
          success = false;
          message = "요청이 실패하였습니다.";
        } else {
          success = true;
          isAddOrDelete = true;
          message = "저장 되었습니다.";
        }
        return res.send({message:message, success:success, isAddOrDelete: true});
      })
    } 
    else {
      connection.query(
        `delete from user_scrap where user_id=${req.user.id} and cafe_id=${req.body.cafe_id}`,
      (err, rows, field) => {
        let success;
        if(err) {
          success = false;
          return res.send({message:"요청이 실패하였습니다.", success:success})
        } 
        success = true;
        return res.send({message:"삭제 완료", success:success, isAddOrDelete: false})
      })
    }
  })
  
})

router.post('/delete', isLoggedIn, (req, res) => {
  
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