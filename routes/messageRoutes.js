const express = require('express');
const authorize = require('../middleware/authorize');
const { sendMessage, allMessages, updateMessage, deleteMessage } = require('../controller/messageController');

const router = express.Router();

router.route('/sendMessage').post(authorize, sendMessage);

router.route('/:chatId').get(authorize, allMessages);

router.route('/updateMessage').post(authorize, updateMessage);

router.route('/deleteMessage').post(authorize, deleteMessage);

module.exports = router;

