const express = require('express');
const authorize = require('../middleware/authorize');
const { sendMessage, allMessages, updateMessage } = require('../controller/messageController');

const router = express.Router();

router.route('/sendMessage').post(authorize, sendMessage);

router.route('/:chatId').get(authorize, allMessages);

router.route('/updateMessage').post(authorize, updateMessage);

module.exports = router;

