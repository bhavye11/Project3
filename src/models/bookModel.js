const mongoose = require('mongoose')  // importing the mongoose to create the book schema
const objectId = mongoose.Schema.Types.ObjectId  // syntax to refer an userId in a book

// to define a format (schema) for creating a book in the database
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    userId: { type: objectId, required: true, ref: 'User', trim: true },
    ISBN: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subcategory: [{ type: String, required: true }],
    reviews: { type: Number, default: 0 },
    deletedAt: { type: Date }, 
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: Date, required: true }
    // bookCover: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)  // --> mongoose creates the model using the schema