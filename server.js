require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const router = require('./routes/api')
const errorHandler = require('./middlewares/ErrorHandlingMiddleware')

const PORT = process.env.PORT || 80

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

// the last
app.use(errorHandler)

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const messageController = require("./controllers/messageController");
const io = new Server(server, {
    cors: {
        origin: '*'
    },
});

app.get('/', (req, res) => {
    res.status(200).json({message: 'Test OK'})
})

io.on('connection', messageController.connection(io))

try {
    sequelize.authenticate()
    sequelize.sync()
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`))

} catch (e) {
    console.log(e)
}
