const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const admin = require('firebase-admin');

const sendMessage = async (req, res) => {
    try {
        const { subject, chatId, pages } = req.body;
        let socket = req.io;
        if (!subject || !chatId || !pages) {
            return res.status(400).json({ type: 'error', message: 'subject, pages and chatId is required' });
        }

        let chatdata = await Chat.find({ _id: chatId });

        let msgBody = {
            sender: req.user._id,
            subject: subject,
            chat: chatId,
            pages: pages
        }

        let message = await Message.create(msgBody);

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
            messageCount: Number(chatdata[0]?.messageCount) + 1

        })

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email fcm"
        });

        message?.chat?.users?.forEach(user => {
            if (socket && req.userSockets[user._id] && String(user._id) != String(req?.user?._id)) {
                socket.to(req.userSockets[user._id]).emit("updatedChat", message)
            }
            if (String(user._id) != String(req?.user?._id)) {
                user?.fcm?.forEach(token => {
                    const message = {
                        notification: {
                            title: `New Notes from ${req?.user?.name || ''}`,
                            body: `${subject} Notes (${pages?.length} Pages)`,
                        },
                        token: token,
                    };

                    try {
                        admin.messaging().send(message)
                            .then((response) => {
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.error('Error sending message:', error);
                            });
                    } catch (error) {

                    }
                })
            }
        });

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

const updateMessage = async (req, res) => {
    try {
        const { pages, messageId } = req.body;

        if (!messageId || !pages) {
            return res.status(400).json({ type: 'error', message: 'messageId and pages are required' });
        }
        let socket = req.io;
        const updatedMessage = await Message.findByIdAndUpdate(messageId, { pages: pages }, { new: true });

        let msgBody = {
            sender: req.user._id,
            chat: updatedMessage.chat,
            updatedMsgId: messageId,
            updateMessage: true,
            updateMessageContent: `${updatedMessage?.subject} Notes have been updated`
        }

        let message = await Message.create(msgBody);
        let chatdataOG = await Chat.findOne({ _id: updatedMessage.chat });
        console.log({ chatdataOG });

        let chatData = await Chat.findByIdAndUpdate(updatedMessage.chat, {
            latestMessage: message,
            messageCount: Number(chatdataOG?.messageCount) + 1
        }, { new: true }).populate('users');

        // chatData = await User.populate(message, {
        //     path: "chat.users",
        //     select: "name pic email fcm"
        // });

        console.log({ chatData });
        // message = await User.populate(message, {
        //     path: "chat.users",
        //     select: "name pic email fcm"
        // });

        chatData?.users?.forEach(user => {
            if (socket && req.userSockets[user._id] && String(user._id) != String(req?.user?._id)) {
                socket.to(req.userSockets[user._id]).emit("updatedMessage", { message: updatedMessage, newMessage: message, chat: chatData })
            }
            if (String(user._id) != String(req?.user?._id)) {
                user?.fcm?.forEach(token => {
                    const message = {
                        notification: {
                            title: `${req?.user?.name || ''} have updated Notes`,
                            body: `${updatedMessage?.subject} Notes have been updated`,
                        },
                        token: token,
                    };

                    try {
                        admin.messaging().send(message)
                            .then((response) => {
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.error('Error sending message:', error);
                            });
                    } catch (error) {

                    }
                })
            }
        });

        return res.status(200).json({ type: 'success', message: 'Messages updated successfuly', message: updatedMessage, newMessage: message, chat: chatData })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message })
    }
}

const deleteMessage = async (req, res) => {
    try {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ type: 'error', message: 'chatId is required' });
        }
        const regex = /To delete notes/i;
        const deleted = await Message.deleteMany({ $or: [{ subject: regex }, { updateMessageContent: regex }] })

        let message = await Message.find({ chat: chatId })

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message[message.length - 1],
            messageCount: message.length
        })

        return res.status(200).json({ type: 'success', message: 'Messages Deleted', deletedCount: deleted.deletedCount || 0 })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message })
    }
}

module.exports = { sendMessage, allMessages, updateMessage, deleteMessage };