const mongoose = require("mongoose");

const mongoDbUrl = "mongodb+srv://lowkey:Lowkey%402025@cluster0.f4cekbg.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"

const connectDb = () => {
  return mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = { connectDb };
