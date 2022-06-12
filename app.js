const express = require('express')
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const dotenv = require('dotenv')

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
const authRouter = require('./routes/auth');

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
app.use('/cafe', cafeCreateRouter)

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.listen(PORT, () => {
  console.log(PORT, '번 포트에서 대기 중')
}) 