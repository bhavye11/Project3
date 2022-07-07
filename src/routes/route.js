const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const commonMid = require("../middlewares/commonMid")
const bookController = require("../controllers/bookController")

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.post('/books', commonMid.authenticate, commonMid.authorize, bookController.createBook)

router.get('/books', commonMid.authenticate, bookController.getBooks)

router.get('/books/:bookId', commonMid.authenticate, bookController.getBookById)

router.put('/books/:bookId', commonMid.authenticate, commonMid.authForUpdate, bookController.updateById)

module.exports = router