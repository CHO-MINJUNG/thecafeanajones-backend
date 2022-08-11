const express = require('express');
const path = require('path');
const router = express.Router();

// const db_config = require(path.join(__dirname, '../config/database.js'));
// const connection = db_config.pool();

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');


let s3 = require("./middlewares/img_s3")


// 사진 없는 경우
router.get('/create', isLoggedIn, (req,res) => {
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
    `INSERT INTO cafe SET ${create_cafe}`,
    (err, rows, field) => {
      if(err){
        console.log(err);
        res.send({success: false, message: "카페 저장에 실패하였습니다."})
      } 
      res.send({success: true, message: "저장되었습니다"})
    }   
  )
})

// 사진 있는 경우
router.post('/createPhoto', isLoggedIn, s3.upload.single('image'), (req,res) => {
  const {name, address, latitude, longitude} = req.body;  
  const user_id = req.user.id;

  const create_cafe = {
    name: name,
    address: address,
    latitude: latitude,
    longitude: longitude,
    thumbnail: req.body.file, 
    user_id: user_id
  }

  connection.query(
    `INSERT INTO cafe SET ${create_cafe}`,
    (err, rows, field) => {
      if(err){
        console.log(err);
        res.send({success: false, message: "카페 저장에 실패하였습니다."})
      } 
      res.send({success: true, message: "저장되었습니다"})
    }   
  )
})

// cafe 정보 삭제 route 
//-> 관리자 승인 후 삭제 뭐 이런거 해야 하려나..? 위험해 보이는...
// 작성자만 삭제 가능하게 할련지?

router.post('/delete', isLoggedIn, (req, res) => {
  connection.query(
    `delete from cafe where id=${req.body.id};
    delete from vote where cafe_id=${req.body.id};
    delete from comment where cafe_id=${req.body.id};`,
  (err, rows, field) => {
    if(err) {
      return res.send({message:"요청이 실패하였습니다."})
    } 
    return res.send({message:"삭제 완료"})
  })
})


module.exports = router;