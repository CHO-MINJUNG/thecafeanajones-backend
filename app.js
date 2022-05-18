const express = require('express')
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express() 
const PORT = 8000

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

const cafeListRouter = require('./routes/cafe_list');
const cafeListFilterRouter= require('./routes/cafe_filter');

app.use(cors({
  origin:true,
  credentials:true
}));
app.use('/cafe/list', cafeListRouter);
app.use('/cafe/list/filter', cafeListFilterRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.listen(PORT, () => {
  console.log(PORT, '번 포트에서 대기 중')
}) 