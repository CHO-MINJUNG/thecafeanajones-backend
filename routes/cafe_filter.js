const {FILTER} = require('../lib/FILTER.js')
const express = require('express');
const path = require('path');

const router = express.Router();

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

router.get('/', (req, res) => {
  reqQuery = req.query
  const returnData = []
  for (var key in req.query){
    if(reqQuery[key] == "true"){
      returnData.push(FILTER[key])
    }
  }
  if (returnData.length==0){
    connection.query(
      `select *
      from cafe`,
    (err, rows, field) => {
      return res.send(rows);
    })
  }
  else if(returnData.length==1){
    connection.query(
      `SELECT *
      FROM cafe_filter as a, cafe as b
      WHERE a.cafe_id = b.id and filter_id = ${returnData[0]}`,
    (err, rows, field) => {
      return res.send(rows);
    })
  }
  else {
    content = returnData.join()
    connection.query(
      `SELECT *
      FROM cafe_filter as a, cafe as b
      WHERE a.cafe_id = b.id
      GROUP BY cafe_id
      HAVING COUNT(CASE WHEN filter_id IN (${content}) THEN 1 END ) = ${returnData.length}
      `,returnData,
      (err, rows, field) => {
        return res.send(rows);
      })
  }
})


module.exports = router;