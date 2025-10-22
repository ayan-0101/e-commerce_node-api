const express = require("express");
const route = express.Router();
const authController = require("../controller/auth.controller");

// Routes
route.post("/signup", authController.register);
route.post("/signin", authController.login);

module.exports = route;
