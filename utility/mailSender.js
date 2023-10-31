const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'in-v3.mailjet.com',
            port: 587, // Port for TLS
            secure: false, // Use TLS (true for 465, false for other ports)
            auth: {
                user: process.env.MAILJETAPIKEY,
                pass: process.env.MAILJETSECRETKEY,
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