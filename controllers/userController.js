const {User} = require("../models/models");
const ApiError = require("../errors/ApiError");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const {ROLES} = require("../consts");

const getJwt = (user) => {
    return JWT.sign(
        {id: user.id, name: user.name, role: user.role},
        process.env.SECRET_KEY,
        {expiresIn: '1h'})
}

const userController = {
    async register(req, res, next) {
        const {name, login, password} = req.body
        if (!name || !login || !password)
            return next(ApiError.badRequest('Поля данных должны быть заполнены'))

        const existingUser = await User.findOne({where: {login}})
        if (existingUser)
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))

        const hashPassword = await bcrypt.hash(password, 1)
        const user = await User.create({name, login, password: hashPassword})
        const jwt = getJwt(user)

        return res.status(200).json({jwt})
    },


    async login(req, res, next) {
        const {login, password} = req.body

        const user = await User.findOne({where: {login}})
        if (!user)
            return next(ApiError.internal('Пользователь с таким именем не найден'))

        if (!bcrypt.compareSync(password, user.password))
            return next(ApiError.internal('Задан не верный пароль'))

        const jwt = getJwt(user)

        return res.status(200).json({jwt})
    },


    async check(req, res, next) {
        const jwt = getJwt(req.user)
        return res.status(200).json({jwt})
    },


    async setRole(req, res, next) {
        if (req.user.role !== ROLES.ADMIN)
            return next(ApiError.forbidden('Назначать роли может только Администратор'))

        const {user_id, role} = req.body
        if (await User.update(
            {role: role},
            {where: {id: user_id}}
        )) {
            const user = await User.findOne({where: {id: user_id}})
            return res.status(200).json({id: user.id, name: user.name, role: user.role})
        }

        return next(ApiError.internal('Неизвестная ошибка'))
    },

}

module.exports = userController