const mongoose = require("mongoose");  // --> mongoose module is imported

// to define a format (schema) for creating a user in the database
const userSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
        trim: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, 
    password: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: { type: String },
        city: { type: String },
        pincode: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);  // --> mongoose creates the model using the schema