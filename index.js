const express = require('express')
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mailSender = require('./utility/mailSender');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(
        {
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI,
            token_uri: process.env.TOKEN_URI,
            auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.CLIENT_CERT_URL,
            universe_domain: process.env.UNIVERSE_DOMAIN
        }
    ),
});

// {
//     type: process.env.TYPE,
//     project_id: process.env.PROJECT_ID,
//     private_key_id: process.env.PRIVATE_KEY_ID,
//     private_key: process.env.PRIVATE_KEY,
//     client_email: process.env.CLIENT_EMAIL,
//     client_id: process.env.CLIENT_ID,
//     auth_uri: process.env.AUTH_URI,
//     token_uri: process.env.TOKEN_URI,
//     auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
//     client_x509_cert_url: process.env.CLIENT_CERT_URL,
//     universe_domain: process.env.UNIVERSE_DOMAIN
// }

const userSockets = {};

const app = express();

app.use(express.json());
app.use(cors());

connectDB();
const port = process.env.PORT || 3000

app.get('/health', (req, res) => {
    res.send('Healthy')
});

app.post('/send', async (req, res) => {
    try {
        await mailSender(req.body.email, req.body.subject, req.body.body)
        res.status(200).send("Success")
    } catch (err) {
        console.log({ err });
        res.status(400).send("Error")
    }

})

app.use(function (req, res, next) {
    req.io = io;
    req.userSockets = userSockets;
    next();
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
});



io.on("connection", (socket) => {
    console.log("connected to socket.io")
    console.log(`Socket ID = ${socket.id}`)
    socket.on("setup", (userData) => {
        socket.join(userData?._id);
        console.log(userData?._id)
        console.log(userData?.name)
        userSockets[userData?._id] = socket.id;
        socket.emit("connected")
    });
    socket.on('disconnect', () => {
        console.log("disconnected")
        // Remove user ID from the mapping on disconnection
        const disconnectedUserId = Object.keys(userSockets).find(
            (key) => userSockets[key] === socket.id
        );
        if (disconnectedUserId) {
            delete userSockets[disconnectedUserId];
        }
    });
})

