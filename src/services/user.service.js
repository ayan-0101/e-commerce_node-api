const bcrypt = require("bcrypt");
const {User} = require("../models/user.model");
const jwtProvider = require("../config/jwtProvider");

// =============================
// Create User
// =============================
const createUser = async (userData) => {
  try {
    let { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new Error(`User already exists with this email: ${email}`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    console.log("User created:", user);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// =============================
// Find User by ID
// =============================
const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
    // .populate("address");
    if (!user) {
      throw new Error(`User does not exist with id: ${userId}`);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// =============================
// Find User by Email
// =============================
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email }).select("+password"); // include password for login
    if (!user) {
      throw new Error(`Email not registered: ${email}`);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// =============================
// Get User Profile from Token
// =============================
const getUserProfileByToken = async (token) => {
  try {
    const userId = jwtProvider.getUserIdFromToken(token);
    
    // Check if token was valid and userId was extracted
    if (!userId) {
      throw new Error("Invalid or expired token");
    }
    
    const user = await findUserById(userId);

    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// =============================
// Get All Users
// =============================
const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getUserProfileByToken,
  getAllUsers,
};
