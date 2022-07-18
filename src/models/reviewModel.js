const mongoose = require("mongoose");  // ==> mongoose module is imported
const objectId = mongoose.Schema.Types.ObjectId  // ==> syntax to refer an userId in a book

// ==> To define a format (schema) to create/add a review in the database
const reviewSchema = new mongoose.Schema({
    bookId: { type: objectId, required: true, ref: "Book" },
    reviewedBy: { type: String, default: 'Guest', trim: true },
    reviewedAt: { type: Date, required: true },
    rating: { type: Number, required: true },
    review: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false }
})

module.exports = mongoose.model('Review', reviewSchema)  // --> mongoose creates the model using the schema