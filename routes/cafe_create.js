const express = require('express');
const path = require('path');
const router = express.Router();
// const db_config = require(path.join(__dirname, '../config/database.js'));
// const connection = db_config.pool();

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');


let upload = require("./middlewares/img_s3")


// 사진 없는 경우
router.post('/create', isLoggedIn, (req,res) => {
  const {name, address, latitude, longitude} = req.body;  
  const user_id = req.user.id;
  const create_cafe = {
    name: name,
    address: address,
    latitude: latitude,
    longitude: longitude,
    user_id: user_id
  }
  connection.query(
    `INSERT INTO cafe SET ?`,create_cafe,
    (err, rows, field) => {
      if(err){
        console.log(err);
        res.send({success: false, message: "카페 저장에 실패하였습니다."})
      } 
      res.send({success: true, message: "저장되었습니다"})
    }   
  )
})

// 사진 있는 경우 s3.upload.single('image'), 
router.post('/createPhoto', isLoggedIn, upload.single('image'), (req,res) => {
  const {name, address, latitude, longitude} = req.body;
  // console.log(req.file);
  const user_id = req.user.id;

  const create_cafe = {
    name: name,
    address: address,
    latitude: latitude,
    longitude: longitude,
    thumbnail: req.file.location, 
    user_id: user_id
  }

  connection.query(
    `INSERT INTO cafe SET ?` ,create_cafe,
    (err, rows, field) => {
      if(err){
        console.log(err);
        res.send({success: false, message: "카페 저장에 실패하였습니다."})
      } 
      res.send({success: true, message: "저장되었습니다"})
    }   
  )
})

router.post('/update', isLoggedIn, upload.single('image'), (req, res) => {
  console.log(req.body);
  console.log("파일 위치",req.file.location);
  connection.query(
    `UPDATE cafe SET thumbnail = ? 
    WHERE id = ${req.body.id};`,req.file.location,
  (err, rows, field) => {
    if(err) {
      return res.send({success: false, message:"요청이 실패하였습니다."})
    } 
    return res.send({success: true, message:"수정 완료"})
  })
})


// 신고 횟수 알려주는 API
// body -> cafe_id 필요
router.get('/delete', isLoggedIn, (req, res) => {
  connection.query(
    `select
    ifnull(num, 0) as cnt
      from (
      select id
          from cafe
          where id = ${req.body.cafe_id}
      ) as b left outer join (
        select cafe_id, count(cafe_id) as num
        from report
        where cafe_id = ${req.body.cafe_id}
        group by cafe_id
      ) as a on a.cafe_id = b.id;`,
  (err, rows, field) => {
    if (err){
      return res.send({success: false, message: "요청이 실패하였습니다."})
    }
    connection.query(
      `select * from report where cafe_id=${req.body.cafe_id} and user_id=${req.user.id};`,
    (err, rows2, field) => {
      if(err) {
        return res.send({success: false, message:"요청이 실패하였습니다"})
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