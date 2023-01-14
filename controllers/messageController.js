const {Message, User} = require('../models/models')
const moment = require("moment")
const {BLOCK_TIMEOUT_IN_MINUTES, ROLES} = require("../consts");

const messageController = {
    connection: (io) => async (socket) => {
        const {user_id} = socket.handshake.query

        const user = await User.findOne({
            attributes: ['id', 'name', 'role'],
            where: {id: user_id},
        })

        const message = await messageController.create(user, 'Вошел в чат')

        io.emit('connection', message)

        socket.on('message', async (msg) => {
            const isBlocked = await messageController.isBlocked(user.id)
            if (!isBlocked) {
                const message = await messageController.create(user, msg)
                io.emit('message', message)
            }
        })

        socket.on('disconnection', async () => {
            const message = await messageController.create(user, 'Вышел из чата')
            io.emit('disconnection', message);
        })

        socket.on('block', async (blocked_user_id) => {
            if (user.role === ROLES.GUEST) return

            const date = moment().add(BLOCK_TIMEOUT_IN_MINUTES, 'minutes').format('YYYY-MM-DD HH:mm:ss Z')

            if (await User.update(
                {blockedUp: date},
                {where: {id: blocked_user_id}}
            )) {
                const message = await messageController.create(user, `${blocked_user_id} заблокирован на ${BLOCK_TIMEOUT_IN_MINUTES} минуту`)
                io.emit('block', message);

                setTimeout(() => {
                    User.update(
                        {blockedUp: null},
                        {where: {id: blocked_user_id}}
                    )
                }, BLOCK_TIMEOUT_IN_MINUTES * 60 * 1000)
            }
        }),

        socket.on('role', async (data) => {
            if (user.role !== ROLES.ADMIN) return
            const {user_id, role} = data
            const changedUser = await User.findOne({where: {id: user_id}})

            if (changedUser.role !== role) {
                if (await User.update(
                    {role: role},
                    {where: {id: user_id}}
                )) {
                    const message = await messageController.create(user, `${changedUser.name} теперь ${role}`)
                    io.emit('role', message)
                }
            }
        })

    },

    async create(user, text) {
        const message = await Message.create({user_id: user.id, text})
        return {id: message.id, text: message.text, user}
    },

    async isBlocked(user_id) {
        const user = await User.findOne({
            attributes: ['blockedUp'],
            where: {id: user_id}
        })

        return user.blockedUp !== null && moment(user.blockedUp) > moment()
    },

    async getLast() {
        const messages = await Message.findAll({
            attributes: ['id', 'text', 'created_at'],
            include: [{
                model: User,
                attributes: ['id', 'name', 'role']
            }],
            order: [['id', 'DESC']],
            limit: 10,
        })

        return messages.reverse()
    },
}

module.exports = messageController