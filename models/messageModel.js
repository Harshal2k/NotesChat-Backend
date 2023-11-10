const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: { type: String, trim: true },
    pages: [{ type: String }],
    updateMessage: {
        type: Boolean,
        default: false
    },
    updatedMsgId: { type: String, trim: true },
    updateMessageContent: { type: String, trim: true },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
},
    {
        timestamps: true,
    }
);
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;