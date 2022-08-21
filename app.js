const express = require('express')
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const dotenv = require('dotenv')
// const multer = require('multer');
// const form_data = multer();

dotenv.config();

const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express() 
passportConfig();
const PORT = 8000

const cafeListRouter = require('./routes/cafe_list');
const cafeDetailRouter = require('./routes/cafe_detail');
const cafeListFilterRouter= require('./routes/cafe_filter');
const cafeScrapRouter = require('./routes/cafe_scrap');
const cafeCreateRouter = require('./routes/cafe_create');
const cafeDeleteRouter = require('./routes/cafe_delete');
const cafeCommentRouter = require('./routes/comment');
const cafeVoteRouter = require('./routes/vote');
const authRouter = require('./routes/auth');

const db_config = require(path.join(__dirname, 'config/database.js'));
const connection = db_config.init();
db_config.connect(connection);


sequelize.sync({force: false})
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name:'hi',
  }));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
// app.use(form_data.array());

app.use(passport.initialize());
app.use(passport.session());

// cors error 해결
app.use(cors({
  origin:true,
  credentials:true
}));


app.use('/cafe/auth', authRouter);
app.use('/cafe/detail', cafeDetailRouter);
app.use('/cafe/list', cafeListRouter);
app.use('/cafe/list/filter', cafeListFilterRouter);
app.use('/cafe/list/scrap', cafeScrapRouter);
app.use('/cafe/comment', cafeCommentRouter);
app.use('/cafe/vote', cafeVoteRouter);
app.use('/cafe', cafeCreateRouter);
app.use('/cafe', cafeDeleteRouter)

// 도로명 주소를 좌표 주소로 바꿔서 저장한 API
// cafe_filter -> vote로 추가 user_id = 9
// app.get('/cafe/filterToVote',function(req,res,next) {
//   let insertList = []

//   connection.query(
//     `select cafe_id, filter_id
//     from cafe_filter`,
//   (err, rows, field) => {
//     if(err) {
//       console.log(err);
//     } 
//     console.log(rows);
//     rows.map( arr => {
//       insertList.push(`(${arr.cafe_id}, 9, ${arr.filter_id})`)
//     })

//     if (insertList.length!=0){
//       connection.query(
//         `
//         insert into vote (cafe_id, user_id, filter_id)
//         values ${insertList.join(',')};`,
//       (err, rows, field) => {
//         if(err) {
//           console.log(err);
//         } 
//         console.log("됐당");
//       })
//     }
//   })

  // console.log(req.body);
  // connection.query(
  //   `UPDATE cafe SET latitude = ${req.body.lat}, longitude = ${req.body.lng} WHERE id=${req.body.id}`,
  // (err, rows, field) => {
  //   console.log(req.body.id, "는 됐음");
  // })
// })

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.listen(PORT, () => {
  console.log(PORT, '번 포트에서 대기 중')
}) 