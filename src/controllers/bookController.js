const bookModel = require("../models/bookModel")  // importing the module that contains the book schema
const userModel = require("../models/userModel")  // importing the module that contains the user schema
const mongoose = require('mongoose')
const { isValid, isbnRegex, dateRegex } = require("../validations/validator")
const reviewModel = require("../models/reviewModel")
const aws= require("aws-sdk")

// ==> AWS S3

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile = async (file) => {
   return new Promise( function (resolve, reject) {
    // ==> this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data) {
        if (err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}



// ==> POST api : to generate bookCover URL

const generateURL = async function (req, res) {
    try {
        let files = req.files
        if(!files || files.length === 0) return res.status(400).send({ status: false, message: "No cover image found." })
            //upload to s3 and get the uploaded link
        let bookCoverURL= await uploadFile( files[0] )
        return res.status(201).send({ status: true, message: 'Success', data: bookCoverURL })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// ==> POST api : to create a book

const createBook = async function (req, res) {
    try {
        const data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in request body." })
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        let x = ` `
        if (!isValid(title)) x = x + `title  `
        if (!isValid(excerpt)) x = x + `excerpt  `
        if (!isValid(ISBN)) x = x + `ISBN  `
        if (!isValid(category)) x = x + `category  `
        if (!isValid(subcategory) || data.subcategory.length === 0) x = x + `subcategory  `
        if (!isValid(releasedAt)) x = x + `releasedAt  `
        if (!isValid(title) || !isValid(excerpt) || !isValid(ISBN) || !isValid(category) || !isValid(subcategory) || !isValid(releasedAt))
            return res.status(400).send({ status: false, message: `Enter the following mandatory field(s): ${x}` })  // ${} --> template literal

        let titlePresent = await bookModel.findOne({ title: title })
        if (titlePresent) return res.status(400).send({ status: false, message: "The title is already in use. Please provide another one." })

        ISBN = ISBN.replace(/-/g, '')
        if (!isbnRegex.test(ISBN))  // --> ISBN should be provided in right format
            return res.status(400).send({ status: false, message: "This ISBN is not valid. ⚠️" })
        let isbnPresent = await bookModel.findOne({ ISBN: ISBN })
        if (isbnPresent) return res.status(400).send({ status: false, message: "This ISBN number is not unique." })

        if (!dateRegex.test(releasedAt))
            return res.status(400).send({ status: false, message: 'Please enter the releasedAt date in "YYYY-MM-DD" format from 18th century and onwards. ⚠️' })

        data.ISBN = ISBN
        if (!data.isDeleted || data.isDeleted === false) {
            data.deletedAt = null
        } else data.deletedAt = new Date()


        let bookCreated = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// ==> GET api : to get the undeleted books with or without filters

const getBooks = async function (req, res) {
    try {
        let filters = req.query  // filters are provided in the query params

        // finding all the undeleted books as per the filters.
        let getBooks = await bookModel.find({ isDeleted: false, ...filters }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        // if no undeleted book is found as per the request made
        if (getBooks.length === 0) return res.status(404).send({ status: false, message: `No such book exists as per the request made.` })
        getBooks.sort((a, b) => a.title.localeCompare(b.title))  

        return res.status(200).send({ status: true, message: 'Books list', data: getBooks })  // --> existing books are reflected in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// ==> GET api : to get a book by its id along with its review data

const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, message: "Please provide the bookId in path params." })
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Please provide a valid bookId." })

        const book = await bookModel.findById(bookId).lean()
        // book._doc.reviewsData = []

        if (!book) return res.status(404).send({ status: false, message: "No such book found in the database." })
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book has already been deleted." })

        let reviews = await reviewModel.find({ bookId: book, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        book.reviewsData = reviews
        return res.status(200).send({ status: true, message: "Success", data: book })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// ==> PUT api : to update a book by its id

const updateById = async function (req, res) {
    try {
        let book = await bookModel.findById(req.params.bookId)
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })

        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })
        let { title, excerpt, releasedAt, ISBN } = data

        if (title) {
            let titlePresent = await bookModel.findOne({ title: title })
            if (titlePresent) return res.status(400).send({ status: false, message: "title is not unique, please provide another one." })
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



// ==> DELETE api : to delete a book by its id

const deleteById = async function (req, res) {
    try {
        let book = await bookModel.findById(req.params.bookId)
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })

        await bookModel.findOneAndUpdate(
            { _id: req.params.bookId },
            { isDeleted: true, deletedAt: Date.now() }
        )
        return res.status(200).send({ status: true, message: "Book deleted succesfully." })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createBook, generateURL, getBooks, getBookById, updateById, deleteById }  // --> exporting the functions