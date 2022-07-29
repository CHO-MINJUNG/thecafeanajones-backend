const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

router.get('/', (req, res) => {
  let cafeDataSet = []

  connection.query(
    `select id, name, address, latitude, longitude, thumbnail
    from cafe`,
  (err, rows, field) => {
    if(err){
      console.log(err);} 
    else {
      for(var i = 0; i < rows.length; i++){
        cafeDataSet[rows[i].id] = rows[i]
        cafeDataSet[rows[i].id].filter = []
      }
    }
  }
)

  connection.query(
    `select cafe_id, filter_id
    from cafe_filter`,
    (err, rows, field) => {
      if(err){
        console.log(err);
      } else {
        for(var i = 0; i < rows.length; i++){
          cafeDataSet[rows[i].cafe_id].filter.push(rows[i].filter_id)
        }
      }
      if (isNotLoggedIn){
        cafeDataSet = cafeDataSet.filter(
          (element, i) => element!=null
        )
        res.send(cafeDataSet) 
      } else{
        user_scrap()
      }
    }   
  )
  
  const user_scrap = (isLoggedIn, () => {
    connection.query(
      `select cafe_id
      from user_scrap
      where user_id = ${req.user.id}`,
      (err, rows, field) => {
        if(err){
          console.log(err);
        } else {
          for(var i = 0; i < rows.length; i++){
            cafeDataSet[rows[i].cafe_id].filter.unshift(0);
          }
        }
        cafeDataSet = cafeDataSet.filter(
          (element, i) => element!=null
        )
        res.send(cafeDataSet)
      }   
    )
  })


})



module.exports = router;