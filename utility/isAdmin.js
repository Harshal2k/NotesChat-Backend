const Chat = require("../models/chatModel")


const isAdmin = async (userId, groupId) => {
    let group = await Chat.findOne({ _id: groupId, groupAdmin: userId });

    if (group) {
        return true;
    } else {
        return false;
    }
}

module.exports = isAdmin;