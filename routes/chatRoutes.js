const express = require('express');
const authorize = require('../middleware/authorize');
const { accessChat, allChats, createGroup, renameGroup, addToGroup, removeFromGroup } = require('../controller/chatController');

const router = express.Router();

router.route('/accessChat').post(authorize, accessChat);

router.route('/allChats').get(authorize, allChats);

router.route('/createGroup').post(authorize, createGroup);

router.route('/renameGroup').patch(authorize, renameGroup);

router.route('/addToGroup').patch(authorize, addToGroup);

router.route('/removeFromGroup').patch(authorize, removeFromGroup);


module.exports = router;