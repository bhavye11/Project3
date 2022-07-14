const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const commonMid = require("../middlewares/commonMid")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")


// ==> User APIs

router.post('/register', userController.createUser)  // --> to create a user
router.post('/login', userController.loginUser)  // --> login for a user


// Books APIs

router.post('/generateURL', bookController.generateURL)  // --> to generate bookCover URL
router.post('/books', commonMid.authenticate, commonMid.authorize, bookController.createBook)  // --> to create a book
router.get('/books', commonMid.authenticate, bookController.getBooks)  // --> to get books
router.get('/books/:bookId', commonMid.authenticate, bookController.getBookById)  // --> to get a book by its id
router.put('/books/:bookId', commonMid.authenticate, commonMid.authForParams, bookController.updateById)  // --> to update a book
router.delete('/books/:bookId', commonMid.authenticate, commonMid.authForParams, bookController.deleteById)  // --> to delete a book


// Review APIs

router.post('/books/:bookId/review', reviewController.addReview)  // --> to create/add a review
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)  // --> to update a review
router.delete('/books/:bookId/review/:reviewId', reviewController.delReview)  // --> to delete a review


module.exports = router  // --> exporting the functions