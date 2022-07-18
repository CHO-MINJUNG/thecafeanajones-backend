const express = require('express');
const path = require('path');

const router = express.Router();

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

router.get('/', (req, res) => {
  connection.query(
    `select id, name, address
    from cafe
    where latitude is NULL`,
  (err, rows, field) => {
    return res.send(rows);
  })
})
// cafe filter group by 개수 전달

module.exports = router;