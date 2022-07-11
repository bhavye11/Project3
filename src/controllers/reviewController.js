const mongoose = require("mongoose")
const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")



const addReview = async function (req, res) {
    try {
    let bookId = req.params.bookId
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Enter a valid bookId." })
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!book) return res.status(400).send({ status: false, message: "bookId not found." })

    let reviewData = req.body
    let { review, rating, reviewedBy } = reviewData
    if (Object.keys(reviewData).length === 0) return res.status(00).send({ status: false, message: "Provide the data in body to add review."})

    if (!rating) return res.status(400).send({ status: false, message: "Give the rating to the book to add a review from 0 to 5." })
    if ( !(/^[+]?([0-4]*\.[0-9]|[0-5])$/.test(rating)) ) return res.status(400).send({ status: false, message: "Rating can attain the value [0-5] with only one digit after decimal."})

    reviewData.bookId = bookId
    reviewData.reviewedAt = Date.now()
    let reviewAdded = await reviewModel.create(reviewData)
    
    let updatebook = await bookModel.findOneAndUpdate(
        { _id: bookId },
        { $inc: { reviews: 1 } }
    )

    return res.status(201).send({ status: true, message: 'Success', data: reviewAdded })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Enter a valid bookId." })
        let reviewId = req.params.reviewId
        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "Enter a valid reviewId." })

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) return res.status(404).send({ status: false, message: "bookId doesn't exist." })
        let reviewDoc = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewDoc) return res.status(404).send({ status: false, message: "reviewId doesn't exist." })

        let reviewData = req.body
        let { review, rating, reviewedBy } = reviewData
        if (Object.keys(reviewData).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update the review." })

        let updateReview = await reviewModel.findOneAndUpdate(
            { _id: reviewId},
            {$set: {review: review, rating: rating, reviewedBy: reviewedBy, reviewedAt: Date.now()}},
            {new: true})
        return res.status(200).send({ status: true, message: 'Success', data: updateReview })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const delReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Enter a valid bookId." })
        let reviewId = req.params.reviewId
        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "Enter a valid reviewId." })

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) return res.status(404).send({ status: false, message: "bookId doesn't exist." })
        let reviewDoc = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewDoc) return res.status(404).send({ status: false, message: "reviewId doesn't exist." })

        await reviewModel.findOneAndUpdate(
            { _id: reviewId },
            { isDeleted: true }
        )

        let updatebook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: -1 } }
        )
        return res.status(200).send({ status: true, message: "Review deleted succesfully." })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { addReview, updateReview, delReview }