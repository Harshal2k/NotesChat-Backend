let jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const authorize = async (req, res, next) => {
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            let token = req.headers.authorization.split(" ")[1];
            console.log({ token });
            const decode = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            console.log({ decode })

            req.user = await User.findById(decode.id).select("-password");

            next();
        } else {
            return res.status(404).json({ type: 'error', message: "Authorization token missing" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
    }
}

module.exports = authorize;
