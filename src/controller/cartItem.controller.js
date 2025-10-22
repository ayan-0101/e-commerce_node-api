const cartItemService = require("../services/cartItem.service");

/**
 * Update a specific cart item
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItemId = req.params.id;
    const updatedItem = await cartItemService.updateCartItem(
      userId,
      cartItemId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

/**
 * Remove a specific cart item
 */
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItemId = req.params.id;
    await cartItemService.removeCartItem(userId, cartItemId);

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to remove cart item",
    });
  }
};

module.exports = {
  updateCartItem,
  removeCartItem,
};
