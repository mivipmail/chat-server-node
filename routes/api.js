const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const {ironSession} = require("iron-session/express");

const session = ironSession({
    cookieName: "loggedIn",
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
})

router.post('/register', session, userController.register)
router.post('/login', session, userController.login)
router.post('/logout', session, userController.logout)
router.post('/auth', session, userController.auth)
router.post('/role', session, userController.setRole)

module.exports = router