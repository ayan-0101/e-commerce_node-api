const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      review:{
        type: String,
        required: true
      }
})

const Review = mongoose.model("reviews", reviewSchema)
module.exports = {Review}