const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const auth = require('../middlewares/AuthMiddleware')


router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/auth', auth, userController.check)
router.post('/role', auth, userController.setRole)

module.exports = router