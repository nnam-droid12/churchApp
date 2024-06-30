const http = require('http');

const app = require('./app');
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()


const PORT = process.env.PORT || 5000
const mongoURL = process.env.MONGO_URL

const server = http.createServer(app);

mongoose.connect(mongoURL)
.then(() => console.log('db connected'))
.catch((err) => console.log(err));




server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})