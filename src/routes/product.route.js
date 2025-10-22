const express = require("express");
const route = express.Router();
const productController = require("../controller/product.controller");

// Public routes
route.get("/", productController.getAllProducts);
route.get("/id/:id", productController.getProductById);

module.exports = route;