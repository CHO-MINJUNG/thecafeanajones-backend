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



module.exports = router;