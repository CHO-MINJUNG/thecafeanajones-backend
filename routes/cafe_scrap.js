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

router.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.send({userScrap: false})
  }else{
    reqQuery = req.query
    connection.query(
      `select *
      from cafe as c, user_scrap as u
      where c.id = u.cafe_id and u.user_id = ${req.user.id} and c.id= ${reqQuery.cafeId}`,
    (err, rows, field) => {
      if (rows.length == 0){
        return res.send({userScrap:false})
      }
      else{
        return res.send({userScrap:true});
      }
    })
  }
})

module.exports = router;