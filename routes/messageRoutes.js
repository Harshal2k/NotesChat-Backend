const express = require('express');
const authorize = require('../middleware/authorize');
const { sendMessage, allMessages } = require('../controller/messageController');

const router = express.Router();

router.route('/sendMessage').post(authorize, sendMessage);

router.route('/:chatId').get(authorize, allMessages);

module.exports = router;

