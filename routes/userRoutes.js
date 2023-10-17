const express = require('express');
const { registerUser, sendOTP, login, getAllUsers, userInfo } = require('../controller/userController');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.route('/sendOtp').post(sendOTP)
router.route('/register').post(registerUser)
router.route('/login').post(login);
router.route("/").get(authorize, getAllUsers);
router.route("/userInfo").get(authorize,userInfo)


module.exports = router;