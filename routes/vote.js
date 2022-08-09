const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

// 해당 user가 투표를 하지 않았다면 배열 값이 모두 0
// 해당 카페의 투표 수 votes, 사용자의 투표 수 user_vote
router.get('/', (req, res) => {
  const cafe_id = req.query.id;

  let user_vote = [0, 0, 0, 0, 0]
  let votes = [0, 0, 0, 0, 0]
  // 로그인이 되어 있는 경우, 해당 user가 해당 cafe에 투표한 경우 배열 값이 바뀜
  connection.query(
    `select filter_id, count(filter_id) as cnt
    from vote
    where cafe_id = ${cafe_id} 
    group by filter_id`,
  (err, rows, field) => {
    if (err) {
      console.log(err);
      return res.send({success: false, message:"요청이 실패하였습니다"})
    }
    for (var filter in rows){
      votes[rows[filter].filter_id-1] = rows[filter].cnt
    }
    if (!req.isAuthenticated()) {
      return res.send({success: true, votes: votes, user_vote: user_vote})
    } else  {
      userCafeVote()
    }

  })

  const userCafeVote = (() => {
    connection.query(
      `select filter_id
      from vote
      where cafe_id = ${cafe_id} and user_id = ${req.user.id}`,
    (err, rows, field) => {
      if (err) {
        return res.send({success: false, message:"요청이 실패하였습니다"})
      }
      for (var filter in rows){
        console.log(filter);
        user_vote[rows[filter].filter_id-1] = 1
      }
      return res.send({success: true, votes: votes, user_vote: user_vote})
    })
  })
})

// test 아직 
// 프론트로부터 cafe_id와 사용자가 새롭게 투표한 vote를 받음(새로 시작, 수정 모두 동일한 api 사용)
router.post('/save', isLoggedIn, (req, res) => {
  const {cafe_id, vote} = req.body;
  let user_vote = [0, 0, 0, 0, 0]

  connection.query(
    `select filter_id
    from vote
    where cafe_id = ${cafe_id} and user_id = ${req.user.id}`,
  (err, rows, field) => {
    if (err) {
      return res.send({success: false, message:"기존 투표 데이터를 불러오는 데에 실패하였습니다"})
    }
    for (var filter in rows){
      user_vote[rows[filter].filter_id-1] = 1
    }
    for (var idx in user_vote){
      if (user_vote[idx] == 1) {
        connection.query(
          `delete from vote 
          where cafe_id=${cafe_id} and user_id=${req.user.id} and filter_id=${idx+1}`,
        (err, rows, field) => {
          if(err) {
            return res.send({success: false, message:"기존 투표 데이터 삭제를 실패하였습니다."})
          } 
        })
      }
    }
  })
  
  for (var idx in vote){
    if (vote[idx] == 1){
      connection.query(
        `insert into vote
        set ?`,{
          cafe_id: cafe_id,
          user_id: req.user.id,
          filter_id: idx+1
        },
      (err, rows, field) => {
        if(err) {
          return res.send({success: false, message:"투표 데이터 저장에 실패하였습니다."})
        } 
      })
    }
  }
  
  })

module.exports = router;