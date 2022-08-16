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
  connection.query(
    `UPDATE cafe SET thumbnail = ${req.file.location} 
    WHERE id = ${req.body.id}`,
  (err, rows, field) => {
    if(err) {
      return res.send({success: false, message:"요청이 실패하였습니다."})
    } 
    return res.send({success: true, message:"수정 완료"})
  })
})


// 진행중
router.post('/delete', isLoggedIn, (req, res) => {
  connection.query(
    `select report from report where id=${req.body.cafe_id};`,
  (err, rows, field) => {
    if(err) {
      return res.send({success: false, message:"요청이 실패하였습니다."})
    } 
    if (4 <= parseInt(rows[0])) {

    }
    return res.send({success: true, message:"삭제 완료"})
  })
})


module.exports = router;