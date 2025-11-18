const express = require("express");
const route = express.Router();
const productController = require("../controller/product.controller");
const { authenticate } = require("../middleware/authenticate.js"); 

// PUBLIC ROUTES (No Authentication Required)
route.get("/", productController.getAllProducts);
route.get("/:id", productController.getProductById);

// PROTECTED ROUTES (Authentication Required)
route.post("/", authenticate, productController.createProduct);
route.post("/creates", authenticate, productController.createMultipleProducts);
route.put("/:id", authenticate, productController.updateProduct);
route.delete("/:id", authenticate, productController.deleteProduct);

module.exports = route;