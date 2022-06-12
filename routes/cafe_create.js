const express = require('express');
const path = require('path');
const router = express.Router();

// const db_config = require(path.join(__dirname, '../config/database.js'));
// const connection = db_config.pool();

const db_config = require(path.join(__dirname, '../config/database.js'));
const connection = db_config.init();
db_config.connect(connection);

const { isLoggedIn, isNotLoggedIn } = require('./middlewares/auth_middleware');


let s3 = require("./middlewares/img_s3")

router.get('/create', isLoggedIn, (req,res) => {
})

router.post('/create', s3.upload.single('image'), (req,res) => {
    console.log(req.file);
//   const {title, address, filter, } = req.body;  
//   const user_id = req.user.id;
//   let now_office_id = null;
//   const insert_office = {
//     office_title: title, 
//     thumbnail: req.files[0].location, 
//     user_id: user_id, 
//     user_phone: contact, 
//     office_location: location, 
//     address_zipcode: zipcode,
//     address_road: road,
//     address_detail: detail,
//     office_deposit: deposit,
//     office_fee: fee, 
//     office_content: mainText
//   }
//   let insert_db = async () => {
//     try{
//       await connection.query(`INSERT INTO Office_Info SET ?`, insert_office);

//       const [rows, fields] = await connection.query(`SELECT id 
//       FROM Office_Info ORDER BY id DESC LIMIT 1;`)
      
//       now_office_id=rows[0].id;

//       for (var img of req.files){
//         await connection.query( 
//           `INSERT INTO Office_Image SET ?`,
//           {office_id: now_office_id, 
//             file_name: img.location}
//         )
//       }
//     } catch(err) {
//       console.log(err)
//       throw err;
//     }
//   }
// insert_db()
//   .then(res.send({createSuccess:true}))

})




module.exports = router;