const express = require('express')
const path = require('path');
const cors = require('cors');

const app = express() 
const PORT = 8000

const cafeListRouter = require('./routes/cafe_list');

app.use(cors({
  origin:true,
  credentials:true
}));
app.use('/cafe/list', cafeListRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.listen(PORT, () => {
  console.log(PORT, '번 포트에서 대기 중')
}) 