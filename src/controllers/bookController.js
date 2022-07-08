const bookModel=require("../models/bookModel")  // importing the module that contains the book schema
const userModel = require("../models/userModel")  // importing the module that contains the user schema
const mongoose = require('mongoose')
const { isValid, dynamicSort, isbnRegex, dateRegex } = require("../validations/validator")



const createBook= async function(req,res){
    try {
        const data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in request body." })
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        let x = ` `
        if (!isValid(title)) x = x + `title  `
        if (!isValid(excerpt)) x = x + `excerpt  `
        if (!isValid(ISBN)) x = x + `ISBN  `
        if (!isValid(category)) x = x + `category  `
        if (!isValid(subcategory) || subcategory.length === 0) x = x + `subcategory  `
        if (!isValid(releasedAt)) x = x + `releasedAt  `
        if (!isValid(title) || !isValid(excerpt) || !isValid(ISBN) || !isValid(category) || !isValid(subcategory) || !isValid(releasedAt))
            return res.status(400).send({ status: false, message: `Enter the following mandatory field(s): ${x}` })  // ${} --> template literal

        let titlePresent = await bookModel.findOne({ title: title })
        if (titlePresent) return res.status(400).send({ status: false, message: "The title is already in use. (already present)" })
        
        ISBN = ISBN.replace(/-/g, '')
        if (!isbnRegex.test(ISBN))  // --> ISBN should be provided in right format
            return res.status(400).send({ status: false, message: "This ISBN is not valid. ⚠️" })
        let isbnPresent = await bookModel.findOne({ ISBN: ISBN })
        if (isbnPresent) return res.status(400).send({ status: false, message: "This ISBN number is not unique." })

        if (!dateRegex.test(releasedAt))
            return res.status(400).send({ status: false, message: 'Please enter the releasedAt date in "YYYY-MM-DD" format from 18th century and onwards. ⚠️' })

        if (!data.isDeleted || data.isDeleted === false) {
            data.deletedAt = null
        } else data.deletedAt = new Date()
        let bookCreated = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const getBooks = async function (req, res) {
    try {
        let filters = req.query  // filters are provided in the query params

        let mandatory = { isDeleted: false, ...filters }  // --> combining the provided details alongwith the mandatory fields.
        
        // finding all the undeleted books as per the filters.
        let getBooks = await bookModel.find(mandatory).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        
        // if no undeleted book is found as per the request made
        if ( getBooks.length === 0 ) return res.status(404).send({ status: false, message: `No such book exists as per the request made.` })
        getBooks.sort(dynamicSort('title'))  // --> to sort the array alphabetically by book name.
        return res.status(200).send({ status: true, message:'Books list', data: getBooks })  // --> existing books are reflected in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, message: "Please provide the bookId in path params." })
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Please provide a valid bookId." })

        const book = await bookModel.findById(bookId)
        if (!book) return res.status(404).send({ status: false, message: "No such book found in the database." })
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book has already been deleted." })
        if (!book.reviewsData || book.reviewsData.length === 0) {
            const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt } = book
            let bookData = {
                _id: _id,
                title: title,
                excerpt: excerpt,
                userId: userId,
                category: category,
                subcategory: subcategory,
                isDeleted: isDeleted,
                reviews: reviews,
                releasedAt: releasedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                reviewsData: []
            }
            return res.status(200).send({ status: true, message: "Success", data: bookData })
        } else {
            return res.status(200).send({ status: true, message: "Success", data: book })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updateById = async function (req, res) {
    try {
        let book = await bookModel.findById(req.params.bookId)
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })
        
        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })
        let { title, excerpt, releasedAt, ISBN } = data

        if (title) {
            if (isValid(title)) {
                let titlePresent = await bookModel.findOne({ title: title })
                if (titlePresent) return res.status(400).send({ status: false, message: "title is not unique, please provide another one." })
            } else return res.status(400).send({ status: false, message: "Provide a title to update." })
        }
        if (ISBN) {
            ISBN = ISBN.replace(/-/g, '')
            if (!isbnRegex.test(ISBN))  // --> ISBN should be provided in right format
                return res.status(400).send({ status: false, message: "This ISBN is not valid. ⚠️" })
            let isbnPresent = await bookModel.findOne({ ISBN: ISBN })
            if (isbnPresent) return res.status(400).send({ status: false, message: "ISBN number is not unique." })
        }
        if (releasedAt) {
            if (!dateRegex.test(releasedAt))
                return res.status(400).send({ status: false, message: 'Please enter the releasedAt date in "YYYY-MM-DD" format from 18th century and onwards. ⚠️' })
        }

        let updatedBook = await bookModel.findOneAndUpdate(
            { _id: req.params.bookId },
            { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } },
            { new: true }
        )
        return res.status(200).send({ status: true, message: 'Success', data: updatedBook })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const deleteById = async function(req , res){
    try{  
        let book = await bookModel.findById(req.params.bookId)
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })

        await bookModel.findOneAndUpdate(
            { _id: req.params.bookId },
            { isDeleted: true, deletedAt: Date.now() },
            { new: true }
        )
        return res.status(200).send({ status: true, message: "Book deleted succesfully." })
    } catch (err) {
       return res.status(500).send({ status: false, message : err.message })
    }
  }



module.exports = { createBook, getBooks, getBookById, updateById, deleteById }