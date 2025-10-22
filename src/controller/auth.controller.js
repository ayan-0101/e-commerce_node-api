const userService = require("../services/user.service");
const cartService = require("../services/cart.service");
const jwtProvider = require("../config/jwtProvider");
const bcrypt = require("bcrypt");

// User Registration
const register = async (req, res) => {
  try {
    // Get data from request body
    const user = await userService.createUser(req.body);

    // Generate JWT
    const jwt = jwtProvider.generateToken(user._id);

  // Create a cart for this user (pass user object for clarity)
  await cartService.createCart(user);

    return res.status(201).send({
      jwt,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).send({ message: "User not found", email });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    // Generate JWT
    const jwt = jwtProvider.generateToken(user._id);

    return res.status(200).send({
      jwt,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
      return res.status(500).send({ error: error.message });
  }
};

module.exports = { register, login };
