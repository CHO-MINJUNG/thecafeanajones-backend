const express = require('express');
const path = require('path');
const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

// 신고 횟수 알려주는 API
// body -> cafe_id 필요
router.get('/delete', isLoggedIn, (req, res) => {
    const cafe_id = req.query.cafeId;

    connection.query(
      `select
      ifnull(num, 0) as cnt
        from (
        select id
            from cafe
            where id = ${cafe_id}
        ) as b left outer join (
          select cafe_id, count(cafe_id) as num
          from report
          where cafe_id = ${cafe_id}
          group by cafe_id
        ) as a on a.cafe_id = b.id;`,
    (err, rows, field) => {
      if (err){
        return res.send({success: false, message: "요청이 실패하였습니다1."})
      }
      connection.query(
        `select * from report where cafe_id=${cafe_id} and user_id=${req.user.id};`,
      (err, rows2, field) => {
        if(err) {
          return res.send({success: false, message:"요청이 실패하였습니다2"})
        } 
        // isDenied 추가 -> 이미 삭제 요청 했다면 아예 요청 불가하게 
        if (rows2.length > 0) {
          return res.send({success: true, isDenied: false, cnt: rows[0].cnt, message:"이미 삭제 요청된 게시글입니다"})
        } else {
          return res.send({success: true, isDenied: true, cnt: rows[0].cnt, message:"삭제 요청"});
        }
      })
      }
      )
    })
  
  
  // body cafe_id 필요
  router.post('/delete', isLoggedIn, (req, res) => {
    connection.query(
      `insert into report
      set ?`,{
        user_id:req.user.id,
        cafe_id:req.body.cafe_id
      },
    (err, rows, field) => {
      if(err) {
        return res.send({success: false, message:"요청이 실패하였습니다."})
      } 
      return res.send({success: true, message:"신고가 접수되었습니다"})
    })
  
    // connection.query(
    //   `select * from report where cafe_id=${req.body.cafe_id} and user_id=${req.user.id};`,
    // (err, rows, field) => {
    //   if(err) {
    //     return res.send({success: false, message:"요청이 실패하였습니다"})
    //   } 
    //   if (rows.length > 0) {
    //     return res.send({success: false, message:"이미 신고가 완료된 카페입니다"})
    //   }
    //   connection.query(
    //     `select count(user_id) as cnt from report where cafe_id = ${req.body.cafe_id} group by cafe_id`,
    //   (err, rows, field) => {
    //     if(err) {
    //       return res.send({success: false, message:"요청이 실패하였습니다."})
    //     } 
    //     if (parseInt(rows[0].cnt)>=3){
    //       // 찐 삭제 query 넣을 부분 -> 관리자 삭제로 바뀐 느낌? 이라 주석 처리
    //       // connection.query(
    //       //   `delete from cafe where id=${req.body.cafe_id};
    //       //   delete from vote where cafe_id=${req.body.cafe_id};
    //       //   delete from comment where cafe_id=${req.body.cafe_id};`,
    //       // (err, rows, field) => {
    //       //   if(err) {
    //       //     return res.send({success: false, message:"요청이 실패하였습니다."})
    //       //   } 
    //       //   return res.send({success: true, message:"삭제 완료"})
    //       // })
  
    //       // 아예 요청이 안 되는 부분으로 이해함
    //     }
  
    //     // 신고 접수 부분
        
    //   })
      
    // })
  })
  
  module.exports = router;