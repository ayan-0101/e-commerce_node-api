const express = require('express');
const cors = require('cors');

// Import all routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const cartRoutes = require('./routes/cart.route');
const cartItemRoutes = require('./routes/cartItem.route');
const productRoutes = require('./routes/product.route');
const ratingRoutes = require('./routes/rating.route');
const reviewRoutes = require('./routes/review.route');
const orderRoutes = require('./routes/order.route');
const adminOrderRoutes = require('./routes/adminOrder.route');
const adminProductRoutes = require('./routes/adminProduct.route');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Welcome route
app.get('/', (req, res) => {
    return res.status(200).send({ message: "welcome to Lowkey", status: true });
});

// Auth routes
app.use('/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);
app.use('/api/cart-items', cartItemRoutes);

// Product routes (public)
app.use('/api/products', productRoutes);

// Rating and Review routes
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);

// Order routes (user)
app.use('/api/orders', orderRoutes);

// Admin routes
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/products', adminProductRoutes);

module.exports = app;