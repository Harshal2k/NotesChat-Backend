const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            return res.status(400).json({ type: 'error', message: 'content and chatId is required' });
        }
        let msgBody = {
            sender: req.user._id,
            content: content,
            chat: chatId
        }

        let message = await Message.create(msgBody);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email"
        })

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        })

        return res.status(200).json({ type: 'success', message: 'Message sent successfuly', message: message })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message })
    }
}

const allMessages = async (req, res) => {
    try {
        let allMessages = await Message.find({ chat: req.params.chatId }).populate(
            "sender",
            "name pic email"
        ).populate("chat")
        return res.status(200).json({ type: 'success', message: 'Messages fetched successfuly', message: allMessages })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message })
    }
}

module.exports = { sendMessage, allMessages };