const express = require("express");
const route = express.Router();
const userController = require("../controller/user.controller");
const { authenticate } = require("../middleware/authenticate");

// Routes
route.get("/profile", authenticate, userController.getUserProfile);
route.get("/", userController.getAllUsers);

module.exports = route;
