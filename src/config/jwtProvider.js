const jwt = require("jsonwebtoken");

const SECRET_KEY =
  process.env.JWT_SECRET ||
  "qwergfdxcvkjgfvkuygnkiuhnkjkosahgjhiaodhalsmcahjkhjhjdcnbskjdckmnjklmkjcasgcnabsjca";

/**
 * Generate JWT Token
 * @param {string} userId - MongoDB userId
 * @returns {string} JWT token valid for 48 hours
 */
const generateToken = (userId) => {
  const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "48h" });
  return token;
};

/**
 * Verify JWT Token and extract userId
 * @param {string} token - JWT token from client
 * @returns {string|null} userId if valid, null if invalid
 */
const getUserIdFromToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY);
    return decodedToken.userId;
  } catch (error) {
    console.error("❌ Invalid or expired token:", error.message);
    return null;
  }
};


module.exports = { generateToken, getUserIdFromToken };
