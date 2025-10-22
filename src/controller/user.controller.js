const { get } = require("lodash");
const userService = require("../services/user.service");

// Get logged-in user profile from token
const getUserProfile = async (req, res) => {
  try {
    const authHeader = get(req, "headers.authorization", "");
    const token = authHeader.split(" ")[1]; // second part after "Bearer"

    if (!token) {
      return res.status(401).send({ message: "Token not found" });
    }

    const user = await userService.getUserProfileByToken(token);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Exclude password from response
    const { password, ...safeUser } = user.toObject();

    return res.status(200).send(safeUser);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    // Exclude password from each user
    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user.toObject();
      return safeUser;
    });

    return res.status(200).send(safeUsers);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = { getUserProfile, getAllUsers };
