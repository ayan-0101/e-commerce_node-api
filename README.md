# E-Commerce Node API

A RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- User Authentication & Authorization
- Product Management
- Shopping Cart Functionality
- Order Processing
- Rating & Review System
- Address Management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Create new product (Admin)
- `PUT /api/admin/products/:id` - Update product (Admin)
- `DELETE /api/admin/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `GET /api/admin/orders` - Get all orders (Admin)
- `PUT /api/admin/orders/:id` - Update order status (Admin)

### Reviews & Ratings
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/ratings` - Rate product
- `GET /api/products/:id/ratings` - Get product ratings

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   cd e-commerce-node-api
   npm install
   ```

3. Create a .env file in the root directory and add your environment variables:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Database Schema

The application uses MongoDB with the following main collections:
- Users
- Products
- Cart
- Orders
- Reviews
- Ratings
- Addresses

## Error Handling

The API implements consistent error handling with appropriate HTTP status codes and error messages.

## Security

- Password hashing using bcrypt
- JWT for authentication
- Input validation
- Protected routes using middleware
- MongoDB injection protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
