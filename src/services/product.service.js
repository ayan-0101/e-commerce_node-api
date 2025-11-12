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
// helper to escape regex special chars
function escapeRegExp(string = "") {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getAllProducts = async (reqQuery) => {
  let {
    title,
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
    pageSize = 10,
  } = reqQuery || {};

  // normalize page & size
  pageNumber = Number(pageNumber) || 1;
  pageSize = Number(pageSize) || 10;

  let query = Product.find().populate("category");

  if (title) {
    const t = Array.isArray(title)
      ? title.find(Boolean) || ""
      : String(title || "").trim();

    if (t.length > 0) {

      query = query.where({ $text: { $search: t } });
      query = query.select({ score: { $meta: "textScore" } });

      if (!reqQuery.sort) {
        query = query.sort({ score: { $meta: "textScore" } });
      }
    }
  }


  // --- Category ---
  if (category) {
    const foundCategory = await Category.findOne({ name: category });
    if (foundCategory) {
      query = query.where("category").equals(foundCategory._id);
    } else {
      return { content: [], currentPage: 1, totalPages: 0 };
    }
  }

  // --- Brand ---
  if (brand) {
    // handle brand as array or string
    const brandArr = Array.isArray(brand)
      ? brand.map((b) => String(b).trim()).filter(Boolean)
      : String(brand).split(",").map((b) => b.trim()).filter(Boolean);

    if (brandArr.length === 1) query = query.where("brand").equals(brandArr[0]);
    else if (brandArr.length > 1)
      query = query.where("brand").in(brandArr.map((b) => new RegExp(`^${escapeRegExp(b)}$`, "i")));
  }

  // --- Color (supports string "a,b,c" OR array ['a','b']) ---
  if (color) {
    const colorArr = Array.isArray(color)
      ? color.map((c) => String(c).trim()).filter(Boolean)
      : String(color).split(",").map((c) => c.trim()).filter(Boolean);

    if (colorArr.length > 0) {
      const regexes = colorArr.map((c) => new RegExp(`^${escapeRegExp(c)}$`, "i"));
      // match either color field equals one of them OR color array contains one of them
      query = query.where({
        $or: [{ color: { $in: regexes } }, { color: { $elemMatch: { $in: regexes } } }],
      });
    }
  }

  // --- Size (supports string "xs,s,m" OR array ['xs','s']) ---
  if (size) {
    const sizeArr = Array.isArray(size)
      ? size.map((s) => String(s).trim()).filter(Boolean)
      : String(size).split(",").map((s) => s.trim()).filter(Boolean);

    if (sizeArr.length > 0) {
      const sizeRegexes = sizeArr.map((s) => new RegExp(`^${escapeRegExp(s)}$`, "i"));
      // match size subdocument name
      query = query.where({ "size.name": { $in: sizeRegexes } });
    }
  }

  // --- Price Range (coerce to numbers) ---
  const min = minPrice !== undefined ? Number(minPrice) : undefined;
  const max = maxPrice !== undefined ? Number(maxPrice) : undefined;
  if (!Number.isNaN(min) && !Number.isNaN(max) && min !== undefined && max !== undefined) {
    query = query.where("discountedPrice").gte(min).lte(max);
  } else if (!Number.isNaN(min) && min !== undefined && (max === undefined || Number.isNaN(max))) {
    query = query.where("discountedPrice").gte(min);
  } else if (!Number.isNaN(max) && max !== undefined) {
    query = query.where("discountedPrice").lte(max);
  }

  // --- Minimum Discount ---
  if (minDiscount !== undefined && !Number.isNaN(Number(minDiscount))) {
    query = query.where("discountPercentage").gte(Number(minDiscount));
  }

  // --- Stock ---
  if (stock === "in_stock") query = query.where("quantity").gt(0);
  else if (stock === "out_of_stock") query = query.where("quantity").equals(0);

  // --- Sorting ---
  if (sort) {
    if (sort === "price_high") query = query.sort({ discountedPrice: -1 });
    else if (sort === "price_low") query = query.sort({ discountedPrice: 1 });
    else if (sort === "newest") query = query.sort({ createdAt: -1 });
  }

  // debug: log the final filter (remove in production if noisy)
  try {
    // query.getFilter() works in Mongoose 5.9+, fallback to _conditions
    const applied = typeof query.getFilter === "function" ? query.getFilter() : query._conditions;
    console.log("APPLIED FILTER:", JSON.stringify(applied, null, 2));
  } catch (e) {
    console.log("APPLIED FILTER (error retrieving):", e);
  }

  // --- Pagination & execute ---
  const totalProducts = await query.clone().countDocuments();
  const skip = (pageNumber - 1) * pageSize;
  const products = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.ceil(totalProducts / pageSize);

  return {
    content: products,
    currentPage: pageNumber,
    totalPages,
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
