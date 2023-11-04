const generateToken = require("../config/generateToken");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator')
const User = require("../models/userModel");
const OTP = require("../models/OTP");

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                type: 'error',
                message: 'User is already registered',
            });
        }

        let otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const allEmailOTPs = await OTP.find({ email: email });
        console.log({ allEmailOTPs });
        if (allEmailOTPs?.length >= 3) {
            return res.status(401).json({
                type: 'error',
                message: '3 attempts exhausted, try again in another 15 minutes',
            });
        }
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        res.status(200).json({
            type: 'success',
            message: 'OTP sent successfully',
            otp,
        });
    } catch (error) {
        console.log({ error })
        return res.status(400).json({ type: 'error', message: "OTP not sent" })
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, otp, pic, phone, picName } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(403).json({
                type: 'error',
                message: 'All fields are required',
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                type: 'error',
                message: 'User already exists',
            });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                type: 'error',
                message: 'The OTP is not valid',
            });
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            return res.status(500).json({
                type: 'error',
                message: `Hashing password error for ${password}: ` + error.message,
            });
        }

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            pic,
            phone,
            picName
        });

        return res.status(201).json({
            type: 'success',
            message: 'User registered successfully',
            user: newUser,
            token: generateToken(newUser._id)
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(403).json({
                type: 'error',
                message: 'All fields are required',
            });
        }
        let userExists = await User.findOne({ email });

        if (!userExists) {
            return res.status(404).json({
                type: 'error',
                message: 'User does not exists',
            });
        }
        let passCheck = await bcrypt.compare(password, userExists.password);

        console.log({ passCheck });
        if (!passCheck) {
            return res.status(400).json({
                type: 'error',
                message: 'Invalid Password',
            });
        }

        return res.status(200).json({
            type: 'success',
            message: "Logged in Successfully",
            user: userExists,
            token: generateToken(userExists._id)
        })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } });
        return res.status(200).json({ type: 'Success', users: users || [] })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const userInfo = async (req, res) => {
    try {
        return res.status(200).json({ type: 'Success', userInfo: req.user })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

const findUsers = async (req, res) => {
    try {
        console.log(req.body)
        const { email, phone, username } = req.body;
        if (!email && !phone && !username) {
            return res.status(400).json({
                type: 'error',
                message: 'Email or Phone or Username is required',
            });
        }

        if (email) {
            const users = await User.find({ email: { $eq: email }, _id: { $ne: req.user._id } });
            return res.status(200).json({ type: 'Success', users: users || [] })
        } else if (phone) {
            const users = await User.find({ phone: { $eq: phone }, _id: { $ne: req.user._id } });
            return res.status(200).json({ type: 'Success', users: users || [] })
        } else {
            const users = await User.find({ name: { '$regex': username, '$options': 'i' }, _id: { $ne: req.user._id } });
            return res.status(200).json({ type: 'Success', users: users || [] })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}


module.exports = { registerUser, sendOTP, login, getAllUsers, userInfo, findUsers }