const mongoose = require('mongoose')  // importing the mongoose to create the book schema
const objectId = mongoose.Schema.Types.ObjectId  // syntax to refer an userId in a book


const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true }, 
    userId: { type: objectId, required: true, ref: 'User' },
    ISBN: { type: String, required: true, unique: true },
    category: { type: String, required: true},
    subcategory: [{ type: String, required: true }],
    reviews: { type: Number, default: 0 },
    deletedAt: { date: Date }, 
    isDeleted: { type: Boolean, default: false },
    releasedAt: { date: Date, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)