const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const commonMid = require("../middlewares/commonMid")
const bookController = require("../controllers/bookController")

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.post('/books', commonMid.authenticate, commonMid.authorize, bookController.createBook)

module.exports = router