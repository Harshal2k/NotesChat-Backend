const express = require('express')
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mailSender = require('./utility/mailSender');

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

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})