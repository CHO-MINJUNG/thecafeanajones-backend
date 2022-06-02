const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

router.get('/', (req, res) => {
  const cafeDetail = {}
  reqQuery = req.query
  // scrap 유무
  if (!req.isAuthenticated()) {
    cafeDetail.userScrap = false
  }
  else{
    connection.query(
      `select *
      from cafe as c, user_scrap as u
      where c.id=u.cafe_id and u.user_id = ${req.user.id} and c.id= ${reqQuery.cafeId}`,
    (err, rows, field) => {
      if (rows.length == 0){
        cafeDetail.userScrap = false
      }
      else{
        cafeDetail.userScrap = true
      }
    })
  }
  // filter id 넘기기
  const filterId = []
  connection.query(
    `select filter_id
    from cafe_filter
    where cafe_id = ${reqQuery.cafeId}`,
  (err, rows, field) => {
    for (i in rows){
      filterId.push(rows[i].filter_id)
    }
    cafeDetail.filter_id = filterId
    return res.send(cafeDetail);
  })
})


module.exports = router;