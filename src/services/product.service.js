// services/product.service.js

// Import models
const { Category } = require("../models/category.model");
const { Product } = require("../models/product.model");

/**
 * Create a new product with proper category hierarchy (top → second → third level)
 */
const createProduct = async (reqData) => {
  // --- 1️⃣ Top Level Category ---
  let topLevelCategory = await Category.findOne({ name: reqData.topLevelCategory });

  if (!topLevelCategory) {
    topLevelCategory = new Category({
      name: reqData.topLevelCategory,
      level: 1
    });
    await topLevelCategory.save();
  }

  // --- 2️⃣ Second Level Category ---
  let secondLevelCategory = await Category.findOne({
    name: reqData.secondLevelCategory,
    parentCategory: topLevelCategory._id
  });

  if (!secondLevelCategory) {
    secondLevelCategory = new Category({
      name: reqData.secondLevelCategory,
      parentCategory: topLevelCategory._id,
      level: 2
    });
    await secondLevelCategory.save();
  }

  // --- 3️⃣ Third Level Category ---
  let thirdLevelCategory = await Category.findOne({
    name: reqData.thirdLevelCategory,
    parentCategory: secondLevelCategory._id
  });

  if (!thirdLevelCategory) {
    thirdLevelCategory = new Category({
      name: reqData.thirdLevelCategory,
      parentCategory: secondLevelCategory._id,
      level: 3
    });
    await thirdLevelCategory.save();
  }

  // --- 4️⃣ Create the Product ---
  const product = new Product({
    title: reqData.title,
    description: reqData.description,
    price: reqData.price,
    discountedPrice: reqData.discountedPrice,
    discountPercentage: reqData.discountPercentage,
    quantity: reqData.quantity,
    brand: reqData.brand,
    color: reqData.color,
    size: reqData.size,
    imageUrl: reqData.imageUrl,
    category: thirdLevelCategory._id
  });

  // Save and return the product
  return await product.save();
};

/**
 * Delete a product by ID
 */
const deleteProduct = async (productId) => {
  await Product.findByIdAndDelete(productId);
  return { message: "Product deleted successfully" };
};

/**
 * Update an existing product by ID
 */
const updateProduct = async (productId, reqData) => {
  const updatedProduct = await Product.findByIdAndUpdate(productId, reqData, { new: true });
  if (!updatedProduct) throw new Error("Product not found");
  return updatedProduct;
};

/**
 * Find a product by ID
 */
const findProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate("category")
    .exec();

  if (!product) throw new Error(`Product does not exist with id: ${productId}`);
  return product;
};

/**
 * Fetch all products with filters, sorting, pagination
 */
const getAllProducts = async (reqQuery) => {
  let {
    category,
    brand,
    color,
    size,
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber = 1,
    pageSize = 10
  } = reqQuery;

  let query = Product.find().populate("category");

  // --- 1️⃣ Filter by Category ---
  if (category) {
    const foundCategory = await Category.findOne({ name: category });
    if (foundCategory) {
      query = query.where("category").equals(foundCategory._id);
    } else {
      return { content: [], currentPage: 1, totalPages: 0 };
    }
  }

  // --- 2️⃣ Filter by Brand ---
  if (brand) query = query.where("brand").equals(brand);

  // --- 3️⃣ Filter by Color ---
  if (color) {
    const colorSet = new Set(color.split(",").map((c) => c.trim().toLowerCase()));
    const colorRegex = new RegExp([...colorSet].join("|"), "i");
    query = query.where("color").regex(colorRegex);
  }

  // --- 4️⃣ Filter by Size ---
  if (size) {
    const sizeSet = new Set(size.split(","));
    query = query.where("size.name").in([...sizeSet]);
  }

  // --- 5️⃣ Price Range ---
  if (minPrice && maxPrice) {
    query = query.where("discountedPrice").gte(minPrice).lte(maxPrice);
  }

  // --- 6️⃣ Minimum Discount ---
  if (minDiscount) query = query.where("discountPercentage").gte(minDiscount);

  // --- 7️⃣ Stock Filter ---
  if (stock === "in_stock") query = query.where("quantity").gt(0);
  else if (stock === "out_of_stock") query = query.where("quantity").equals(0);

  // --- 8️⃣ Sorting ---
  if (sort) {
    const sortDirection = sort === "price_high" ? -1 : 1;
    query = query.sort({ discountedPrice: sortDirection });
  }

  // --- 9️⃣ Pagination ---
  const totalProducts = await query.clone().countDocuments(); // clone() to reuse query
  const skip = (pageNumber - 1) * pageSize;
  const products = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.ceil(totalProducts / pageSize);

  return {
    content: products,
    currentPage: parseInt(pageNumber),
    totalPages
  };
};

/**
 * Create multiple products at once (bulk import)
 */
const createMultipleProducts = async (products) => {
  for (let productData of products) {
    await createProduct(productData);
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  findProductById,
  getAllProducts,
  createMultipleProducts
};
