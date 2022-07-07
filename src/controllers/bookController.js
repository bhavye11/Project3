const bookModel=require("../models/bookModel")
const userModel = require("../models/userModel")  // importing the module that contains the user schema
// const isbnValidator = require('isbn-validate')
const moment = require('moment');
const { isValid, isbnRegex } = require("../validations/validator")

const createBook= async function(req,res){
    try {
        const data=req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in request body." })
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        let inValid = ` `
        if (!isValid(title)) inValid = inValid + `title  `
        if (!isValid(excerpt)) inValid = inValid + `excerpt  `
        if (!isValid(ISBN)) inValid = inValid + `ISBN  `
        if (!isValid(category)) inValid = inValid + `category  `
        if (!isValid(subcategory) || subcategory.length === 0) inValid = inValid + `subcategory  `
        if (!isValid(releasedAt)) inValid = inValid + `releasedAt  `
        if (!isValid(title) || !isValid(excerpt) || !isValid(ISBN) || !isValid(category) || !isValid(subcategory) || !isValid(releasedAt))
            return res.status(400).send({ status: false, message: `Enter the following mandatory field(s): ${inValid}` })

        let titlePresent = await bookModel.findOne({ title: title })
        if (titlePresent) return res.status(400).send({ status: false, message: "The title is already in use. (already present)" })
        if (!isbnRegex.test(ISBN))  // --> name should be provided in right format
            return res.status(400).send({ status: false, message: "This ISBN is not valid. ⚠️" })
       
        let isbnPresent = await bookModel.findOne({ ISBN: ISBN })
        if (isbnPresent) return res.status(400).send({ status: false, message: "This ISBN number is not unique." })

        data.releasedAt = moment(releasedAt).format()

        if (!data.isDeleted || data.isDeleted === false) {
            data.deletedAt = null
        } else data.deletedAt = new Date()
        let bookCreated = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createBook }