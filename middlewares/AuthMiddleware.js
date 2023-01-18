const ApiError = require("../errors/ApiError");
const JWT = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if(req.method === 'OPTIONS')
        next()

    try {
        const jwt = req.headers.authorization.split(' ', )[1] // Bearer jwt
        if(!jwt)
            next(ApiError.unauthorized('Пользователь не авторизован'))
        req.user = JWT.verify(jwt, process.env.SECRET_KEY)
        next()
    } catch (e) {
        next(ApiError.unauthorized('Пользователь не авторизован'))
    }
}