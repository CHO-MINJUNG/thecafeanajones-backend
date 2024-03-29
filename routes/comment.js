const express = require('express');
const path = require('path');

const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

router.get('/', (req, res) => {
  // query param으로 보내줄건지 
  connection.query(
    `select id, user_id, comment, create_time
    from comment
    where cafe_id = ${req.query.id}
    order by create_time desc`,
  (err, rows, field) => {
    if (err) {
      return res.send({success: false, message:"요청이 실패하였습니다"})
    }
    
    if (!req.isAuthenticated()){
      rows.map(arr => {arr.isMine = false})
    } else {
      rows.map(arr => {
        if (arr.user_id == req.user.id){
          arr.isMine = true
        } else {
          arr.isMine = false
        }
      })
    }
    return res.send({success: true, comments: rows});
  })
})


// 보내는 코드
// export const addComment = async (cafeId, comment) => {
//   let response = await axios({
//     method: "POST",
//     url: `${API_BASE_URL}/cafe/comment/create/${cafeId}`,
//     data: {cafe_id: cafeId, comment: comment,},
//   });
//   if (response.data.success) {
//     return response.data.message;
//   } else {
//     return response.data.message;
//   }
// }

router.post('/create', isLoggedIn, (req, res) => {
  const {cafe_id, comment} = req.body;

  // TODO: Auth 확인도 해주고 실패시 success: false, message: "로그인이 필요합니다"
  // 해주세용~~
  connection.query(
    `insert into comment
    set ?`,{
      cafe_id: cafe_id,
      user_id: req.user.id,
      comment: comment
    },
  (err, rows, field) => {
    if(err) {
      return res.send({success: false, message:"요청이 실패하였습니다."})
    } 
    return res.send({success: true, message:"저장 완료"})
    // 전체 comment list를 다시 받을 건지 확인 부탁
    // 넹 다시주세요~~
    })
  })

router.post('/delete', isLoggedIn, (req, res) => {
  connection.query(
    `delete from comment where user_id=${req.user.id} and id=${req.body.id}`,
  (err, rows, field) => {
    if(err) {
      return res.send({message:"요청이 실패하였습니다."})
    } 
    return res.send({message:"삭제 완료"})
  })
})

module.exports = router;