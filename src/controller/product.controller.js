const productService = require("../services/product.service");

/**
 * @desc Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(400).json({ message: error.message || "Failed to create product" });
  }
};

/**
 * @desc Create multiple products (bulk import)
 */
const createMultipleProducts = async (req, res) => {
  try {
    const products = req.body.products;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: "Products array is required" });
    }

    await productService.createMultipleProducts(products);
    return res.status(201).json({ message: "Products created successfully" });
  } catch (error) {
    console.error("Error creating multiple products:", error.message);
    return res.status(400).json({ message: error.message || "Failed to create products" });
  }
};

/**
 * @desc Get all products with filters, pagination, sorting
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return res.status(500).json({ message: error.message || "Failed to fetch products" });
  }
};

/**
 * @desc Get a single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const product = await productService.findProductById(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    return res.status(404).json({ message: error.message || "Product not found" });
  }
};

/**
 * @desc Update an existing product
 */
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(400).json({ message: error.message || "Failed to update product" });
  }
};

/**
 * @desc Delete a product by ID
 */
const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res.status(404).json({ message: error.message || "Product not found" });
  }
};

module.exports = {
  createProduct,
  createMultipleProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
