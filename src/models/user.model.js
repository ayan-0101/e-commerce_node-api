const mongoose = require("mongoose");

// Define the structure (schema) of a "User" document in MongoDB

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },

  mobile: {
    type: String,
    required: true,
    default: '+91 00000 00000'
  },

  role: {
    type: String,
    required: true,
    default: "CUSTOMER", // if no role is given, it will default to CUSTOMER
  },

  address: [
    {
      type: mongoose.Schema.Types.ObjectId, // stores the ID of the address document
      ref: "addresses", // refers to the "addresses" collection
    },
  ],

  paymentInformation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentInformation", // references "paymentInformation" collection
    },
  ],

  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ratings", // references "ratings" collection
    },
  ],

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reviews", // references "reviews" collection
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now(), // automatically stores the current date/time
  },
});

// Create a model (like a class) based on the schema
const User = mongoose.model("users", userSchema);

// Export the model so it can be used in other files
module.exports = { User };
