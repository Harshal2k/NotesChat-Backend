const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const isAdmin = require("../utility/isAdmin");


const accessChat = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ type: 'error', message: 'userId is required' });
        }

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } }
            ]
        }).populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email pic"
        });

        if (isChat.length > 0) {
            return res.status(200).json({ type: 'success', message: 'Chat Found', chat: isChat })
        } else {
            let chatData = {
                name: "sender",
                isGroupChat: false,
                users: [req.user._id, userId]
            }
            let newChat = await Chat.create(chatData);

            const fullChat = await Chat.find({ _id: newChat._id }).populate("users", "-password");
            return res.status(200).json({ type: 'success', message: 'Chat Created', chat: fullChat })
        }


    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message })
    }
}

const allChats = async (req, res) => {
    try {
        let allChats = await Chat.find(
            { users: { $elemMatch: { $eq: req.user._id } } }
        ).populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })

        allChats = await User.populate(allChats, {
            path: "latestMessage.sender",
            select: "name email pic"
        });
        return res.status(200).json({ type: 'success', message: 'Chats Found', chats: allChats })
    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const createGroup = async (req, res) => {
    try {

        if (!req.body.users || !req.body.name) {
            return res.status(400).json({
                type: 'error', message: "Users list and group name is required"
            });
        }

        if (!Array.isArray(req.body.users)) {
            return res.status(400).json({
                type: 'error', message: "Users list should be of type array"
            });
        }

        let users = [...new Set(req.body.users)];

        if (users?.length < 2) {
            return res.status(400).json({ type: 'error', message: 'There should be atleast 2 users in the group' });
        }

        users.push(req.user._id);

        let newGroup = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user._id
        })

        let fullGroupChat = await Chat.findOne({ _id: newGroup._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).json({ type: 'success', message: 'Group created Successfully', group: fullGroupChat })


    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const renameGroup = async (req, res) => {
    try {
        const { groupId, newName } = req.body;

        if (!groupId || !newName) {
            return res.status(400).json({ type: 'error', message: 'groupId and name is required' });
        }

        let isGAdmin = await isAdmin(req.user._id, groupId);

        if (!isGAdmin) {
            return res.status(400).json({ type: 'error', message: 'User is not Admin of the group' })
        }

        await Chat.findByIdAndUpdate(groupId, { chatName: newName });

        return res.status(200).json({ type: 'success', message: "Successfully updated the group name" })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const addToGroup = async (req, res) => {
    try {
        const { groupId, users } = req.body;

        if (!groupId || !users) {
            return res.status(400).json({ type: 'error', message: 'groupId and users list is required' });
        }

        if (!Array.isArray(users)) {
            return res.status(400).json({
                type: 'error', message: "Users list should be of type array"
            });
        }

        let isGAdmin = await isAdmin(req.user._id, groupId);

        if (!isGAdmin) {
            return res.status(400).json({ type: 'error', message: 'User is not Admin of the group' })
        }

        await Chat.findByIdAndUpdate(groupId, { $addToSet: { users: { $each: users } } });

        return res.status(200).json({ type: 'success', message: "Added new users Successfully" })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const removeFromGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({ type: 'error', message: 'groupId and userId is required' });
        }

        let isGAdmin = await isAdmin(req.user._id, groupId);

        if (!isGAdmin) {
            return res.status(400).json({ type: 'error', message: 'User is not Admin of the group' })
        }

        if (req.user._id.toString() === userId) {
            return res.status(400).json({ type: 'error', message: 'Cannot remove admin of the group' })
        }


        await Chat.findByIdAndUpdate(groupId, { $pull: { users: userId } });

        return res.status(200).json({ type: 'success', message: "Removed user Successfully" })

    } catch (error) {
        console.log({ error });
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

module.exports = { accessChat, allChats, createGroup, renameGroup, addToGroup, removeFromGroup };