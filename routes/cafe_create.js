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

router.get('/create', isLoggedIn, (req,res) => {
})

router.post('/create', isLoggedIn, s3.upload.single('image'), (req,res) => {
  const {name, address, filter, featureSet} = req.body;  
  const user_id = req.user.id;

  const create_cafe = {
    name: name,
    thumbnail: req.file.location, 
    address: address,
    user_id: user_id,
  }
  
  let insert_db = async () => {
    try{
      // cafe table에 추가
      await connection.query(`INSERT INTO cafe SET ?`, create_cafe);

      // cafe filter tabel에 추가
      for (idx in filter){
        console.log(filter[idx]);
        await connection.query(`INSERT INTO cafe_filter`)
      }
      const [rows, fields] = await connection.query(`SELECT id 
      FROM cafe ORDER BY id DESC LIMIT 1;`)
      
      now_cafe_id=rows[0].id;

      // cafe feature table에 단락 추가
      for (idx in featureSet){
        console.log(featureSet[idx]);
        const feature = {
          cafe_id: now_cafe_id,
          feature_order: idx+1,
          user_id: user_id,
          title: featureSet[idx].title,
          content: featureSet[idx].content,
        }
        await connection.query(`INSERT INTO cafe_feature SET ?`, feature);
      }
    } catch(err) {
      console.log(err)
      throw err;
    }
  }
insert_db()
  .then(res.send({createSuccess:true}))

})

module.exports = router;