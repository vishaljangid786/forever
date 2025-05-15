# API Endpoints

## \*\*User Routes (`/api/user`)

### Authentication & User Management

- **POST** `/register` - Register a new user (with image upload)
- **POST** `/login` - User login
- **POST** `/admin` - Admin login

### Dashboards

- **GET** `/admin/dashboard` - Admin dashboard *(Protected: **`authRole("admin")`**)*
- **GET** `/seller/dashboard` - Seller dashboard *(Protected: **`authRole("seller")`**)*

### User Operations

- **GET** `/fetchallusers` - Fetch all users *(Protected: **`authRole("admin")`**)*
- **GET** `/referalcode` - Fetch referral code *(Protected: **`authUser`**)*
- **GET** `/fetchuserdata` - Fetch user data *(Protected: **`authUser`**)*
- **DELETE** `/deleteuser` - Delete a user *(Protected: **`authRole("admin")`**)*
- **POST** `/sendOtp` - Send OTP
- **POST** `/verifyOtp` - Verify OTP

---

## \*\*Order Routes (`/api/order`)

### Admin Features

- **POST** `/list` - Fetch all orders
- **POST** `/status` - Update order status *(Protected: **`adminAuth`**)*
- **POST** `/delete` - Delete an order *(Protected: **`adminAuth`**)*

### Payment Features

- **POST** `/place` - Place an order *(Protected: **`authUser`**)*
- **POST** `/stripe` - Place order via Stripe *(Protected: **`authUser`**)*
- **POST** `/razorpay` - Place order via Razorpay *(Protected: **`authUser`**)*

### User Features

- **POST** `/userorders` - Fetch user-specific orders *(Protected: **`authUser`**)*

### Payment Verification

- **POST** `/verifyStripe` - Verify Stripe payment *(Protected: **`authUser`**)*
- **POST** `/verifyRazorpay` - Verify Razorpay payment *(Protected: **`authUser`**)*

---

## \*\*Product Routes (`/api/product`)

- **POST** `/add` - Add a new product *(with multiple images upload, Protected: **`authMiddleware`**)*
- **DELETE** `/remove/:id` - Remove a product by ID
- **POST** `/single` - Fetch a single product
- **GET** `/list` - Fetch all products
- **GET** `/fetchcategories` - Fetch product categories
- **POST** `/addReview` - Add a review to a product
- **GET** `/getReviews/:productId` - Fetch reviews for a specific product
- **POST** `/deleteReview` - Delete a product review
- **GET** `/list/:userId` - Fetch products listed by a specific user *(Protected: **`authMiddleware`**)*

---

## \*\*Cart Routes (`/api/cart`)

- **GET** `/get` - Fetch cart items *(Protected: **`authUser`**)*
- **POST** `/add` - Add an item to the cart *(Protected: **`authUser`**)*
- **PUT** `/update` - Update an item in the cart *(Protected: **`authUser`**)*
- **POST** `/remove` - Remove an item from the cart *(Protected: **`authUser`**)*

---

## **Notes**

- Routes marked as **Protected** require authentication middleware.
- Make sure to include authorization tokens when accessing protected routes.

### 🚀 Happy Coding!
