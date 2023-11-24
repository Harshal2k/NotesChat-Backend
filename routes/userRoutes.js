const express = require('express');
const { registerUser, sendOTP, login, getAllUsers, userInfo, findUsers, updateUser, updateFCM } = require('../controller/userController');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.route('/sendOtp').post(sendOTP);

router.route('/register').post(registerUser);

router.route('/login').post(login);

router.route("/").get(authorize, getAllUsers);

router.route("/userInfo").get(authorize, userInfo);

router.route('/findUsers').post(authorize, findUsers)

router.route('/updateUser').post(authorize, updateUser)

router.route('/updateFCM').post(updateFCM)



module.exports = router;