const {User} = require("../models/models");
const ApiError = require("../errors/ApiError");
const bcrypt = require("bcrypt");
const {ROLES} = require("../consts");

const userController = {
    async register(req, res, next) {
        const {name, login, password} = req.body
        if(!name || !login || !password)
            return next(ApiError.badRequest('Поля данных должны быть заполнены'))

        let user = await User.findOne({where: {login}})
        if(user)
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))

        const hashPassword = await bcrypt.hash(password, 1)
        user = await User.create({name, login, password: hashPassword})

        return res.status(200).json({id: user.id, name: user.name, role: user.role})
    },


    async login(req, res, next) {
        const {login, password} = req.body

        const user = await User.findOne({where: {login}})
        if(!user)
            return next(ApiError.internal('Пользователь с таким именем не найден'))

        if (!bcrypt.compareSync(password, user.password))
             return next(ApiError.internal('Задан не верный пароль'))

        if(typeof req.session.user_id === 'undefined') {
            req.session.user_id = user.id
            await req.session.save()
        }
        delete req.session.isLogged
        await req.session.save()

        return res.status(200).json({id: user.id, name: user.name, role: user.role})
    },


    async logout(req, res, next) {
        delete req.session.user_id
        await req.session.save()
        return res.status(200).json('OK')
    },


    async auth(req, res, next) {
        if(req.session?.user_id) {
            const user = await User.findOne({where: {id: req.session.user_id}})
            return res.status(200).json({id: user.id, name: user.name, role: user.role})
        }
        return next(ApiError.unauthorized('Пользователь не авторизован'))
    },


    async setRole(req, res, next) {
        if(!req.session?.user_id)
            return next(ApiError.unauthorized('Пользователь не авторизован'))

        const me = await User.findOne({where: {id: req.session.user_id}});
        if(me.role !== ROLES.ADMIN)
            return next(ApiError.forbidden('Назначать роли может только Администратор'))

        const {user_id, role} = req.body
        const user = await User.update(
            {role: role},
            {where: {id: user_id}}
        )

        return res.status(200).json({id: user.id, name: user.name, role: user.role})
    },

}

module.exports = userController