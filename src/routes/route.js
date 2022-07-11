const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const commonMid = require("../middlewares/commonMid")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.post('/books', commonMid.authenticate, commonMid.authorize, bookController.createBook)

router.get('/books', commonMid.authenticate, bookController.getBooks)

router.get('/books/:bookId', commonMid.authenticate, bookController.getBookById)

router.put('/books/:bookId', commonMid.authenticate, commonMid.authForParams, bookController.updateById)

router.delete('/books/:bookId', commonMid.authenticate, commonMid.authForParams, bookController.deleteById)

router.post('/books/:bookId/review', commonMid.authenticate, reviewController.addReview)

router.put('/books/:bookId/review/:reviewId', commonMid.authenticate, reviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId', commonMid.authenticate, reviewController.delReview)

module.exports = router