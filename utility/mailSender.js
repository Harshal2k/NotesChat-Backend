const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        console.log({ email })
        const transporter = nodemailer.createTransport({
            service: 'Outlook', // you can also use 'Hotmail' or 'Live' here
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: title,
            html: body
        };

        let info = transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return info;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};
module.exports = mailSender;