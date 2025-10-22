const { getUserIdFromToken } = require("../config/jwtProvider");
const userService = require("../services/user.service.js");

const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    // Decode user ID from token
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Find user from DB
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    req.userId = userId;

    console.log("🔹 Token:", token);
console.log("🔹 User ID from token:", userId);
console.log("🔹 Found user:", user);

    // Continue to next middleware
    next();

  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};

module.exports = { authenticate };
