import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import "dotenv/config";
import userModel from "./models/userModel.js";
import productModel from "./models/productModel.js";
import orderModel from "./models/orderModel.js";
import bannerModel from "./models/banner.js";
import billModel from "./models/billModel.js";
import incomeLevelModel from "./models/incomeLevel.js";
import requestModel from "./models/RequestedModel.js";

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected for Seeding");
  } catch (error) {
    console.log("❌ Connection Error:", error);
    process.exit(1);
  }
};

// Generate referral code
const generateReferralCode = () => {
  return "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

// Seed Users
const seedUsers = async () => {
  console.log("🌱 Seeding Users...");
  const hashedPassword = await hashPassword("password123");

  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      phone: 9876543210,
      status: true,
      shopName: "Admin Shop",
      password: hashedPassword,
      role: "admin",
      cc: 5000,
      amount: 10000,
      referralCode: generateReferralCode(),
      uid: "ADMIN" + Date.now(),
      location: "Delhi",
      address: {
        street: "123 Main St",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        zipcode: "110001",
      },
    },
    {
      name: "John Seller",
      email: "seller@example.com",
      phone: 9876543211,
      status: true,
      shopName: "John's Store",
      password: hashedPassword,
      role: "seller",
      cc: 3000,
      amount: 5000,
      referralCode: generateReferralCode(),
      uid: "SELLER" + Date.now(),
      location: "Mumbai",
      address: {
        street: "456 Shop St",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        zipcode: "400001",
      },
    },
    {
      name: "Jane Smith",
      email: "user1@example.com",
      phone: 9876543212,
      status: true,
      password: hashedPassword,
      role: "user",
      cc: 1500,
      amount: 2000,
      referralCode: generateReferralCode(),
      uid: "USER1" + Date.now(),
      location: "Bangalore",
      address: {
        street: "789 User Ave",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipcode: "560001",
      },
    },
    {
      name: "Mike Johnson",
      email: "user2@example.com",
      phone: 9876543213,
      status: true,
      password: hashedPassword,
      role: "user",
      cc: 2000,
      amount: 3500,
      referralCode: generateReferralCode(),
      uid: "USER2" + Date.now(),
      location: "Hyderabad",
      address: {
        street: "321 Customer Rd",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        zipcode: "500001",
      },
    },
    {
      name: "Sarah Williams",
      email: "user3@example.com",
      phone: 9876543214,
      status: true,
      password: hashedPassword,
      role: "user",
      cc: 1800,
      amount: 4000,
      referralCode: generateReferralCode(),
      uid: "USER3" + Date.now(),
      location: "Chennai",
      address: {
        street: "654 Shop Plaza",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        zipcode: "600001",
      },
    },
  ];

  try {
    await userModel.deleteMany({});
    const createdUsers = await userModel.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.log("❌ Error seeding users:", error.message);
    return [];
  }
};

// Seed Products
const seedProducts = async (users) => {
  console.log("🌱 Seeding Products...");

  const sellerId = users.find((u) => u.role === "seller")._id;

  const products = [
    {
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation and 30-hour battery life",
      // price can be stored as comma-separated string to match frontend expectations
      price: ["4999,5999,6499"],
      oldPrice: ["7999,8999,9999"],
      image: [
        "https://via.placeholder.com/300?text=Headphones+1",
        "https://via.placeholder.com/300?text=Headphones+2",
      ],
      category: "Electronics",
      subCategory: "Audio",
      color: ["Black", "Silver", "Blue"],
      sizes: ["One Size"],
      bestseller: true,
      date: Date.now(),
      cc: 50,
      createdBy: sellerId,
      reviews: [
        {
          user: "John Doe",
          rating: 5,
          comment: "Excellent quality and sound!",
          date: new Date(),
        },
      ],
    },
    {
      name: "Classic Cotton T-Shirt",
      description: "Comfortable men's cotton t-shirt available in multiple colors",
      price: ["399,549,699"],
      oldPrice: ["799,899,999"],
      image: [
        "https://via.placeholder.com/300?text=TShirt+1",
        "https://via.placeholder.com/300?text=TShirt+2",
      ],
      category: "Clothing",
      subCategory: "Men",
      color: ["White", "Black", "Blue", "Red"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      bestseller: true,
      date: Date.now(),
      cc: 20,
      createdBy: sellerId,
      reviews: [
        {
          user: "Jane Smith",
          rating: 4,
          comment: "Great fit and comfortable",
          date: new Date(),
        },
      ],
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Insulated water bottle keeps drinks cold for 24 hours",
      price: ["899,1099,1299"],
      oldPrice: ["1499,1699,1999"],
      image: [
        "https://via.placeholder.com/300?text=Bottle+1",
        "https://via.placeholder.com/300?text=Bottle+2",
      ],
      category: "Accessories",
      subCategory: "Beverage",
      color: ["Silver", "Black", "Rose Gold"],
      sizes: ["500ml", "750ml", "1000ml"],
      bestseller: false,
      date: Date.now(),
      cc: 30,
      createdBy: sellerId,
      reviews: [
        {
          user: "Mike Wilson",
          rating: 5,
          comment: "Keeps ice cold for the entire day!",
          date: new Date(),
        },
      ],
    },
    {
      name: "Smartphone Stand",
      description: "Adjustable universal phone stand for desk and table",
      price: ["299,399,499"],
      oldPrice: ["599,699,799"],
      image: [
        "https://via.placeholder.com/300?text=Stand+1",
        "https://via.placeholder.com/300?text=Stand+2",
      ],
      category: "Electronics",
      subCategory: "Accessories",
      color: ["Black", "Silver"],
      sizes: ["One Size"],
      bestseller: true,
      date: Date.now(),
      cc: 15,
      createdBy: sellerId,
      reviews: [
        {
          user: "Sara Lee",
          rating: 4,
          comment: "Sturdy and very useful",
          date: new Date(),
        },
      ],
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with 2.4GHz connection and 18-month battery",
      price: ["599,799,999"],
      oldPrice: ["1099,1299,1499"],
      image: [
        "https://via.placeholder.com/300?text=Mouse+1",
        "https://via.placeholder.com/300?text=Mouse+2",
      ],
      category: "Electronics",
      subCategory: "Computer",
      color: ["Black", "Gray", "White"],
      sizes: ["One Size"],
      bestseller: true,
      date: Date.now(),
      cc: 25,
      createdBy: sellerId,
      reviews: [
        {
          user: "Tom Hardy",
          rating: 5,
          comment: "Perfect for work!",
          date: new Date(),
        },
      ],
    },
  ];

  try {
    await productModel.deleteMany({});
    const createdProducts = await productModel.insertMany(products);
    createdProducts.forEach((product) => {
      product.calculateAverageRating();
      product.save();
    });
    console.log(`✅ ${createdProducts.length} products created`);
    return createdProducts;
  } catch (error) {
    console.log("❌ Error seeding products:", error.message);
    return [];
  }
};

// Seed Orders
const seedOrders = async (users, products) => {
  console.log("🌱 Seeding Orders...");

  if (!users.length || !products.length) {
    console.log("⚠️  Skipping orders - no users or products");
    return [];
  }

  const orders = [
    {
      userId: users[2]._id, // user1@example.com
      items: [
        {
          productId: products[0]._id,
          size: "One Size",
          color: "Black",
          price: 4999,
          quantity: 1,
        },
        {
          productId: products[1]._id,
          size: "L",
          color: "Black",
          price: 399,
          quantity: 2,
        },
      ],
      amount: 5397,
      address: {
        street: "789 User Ave",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipcode: "560001",
      },
      status: "Delivery Done",
      paymentMethod: "Razorpay",
      payment: true,
      date: Date.now() - 86400000,
    },
    {
      userId: users[3]._id, // user2@example.com
      items: [
        {
          productId: products[2]._id,
          size: "750ml",
          color: "Silver",
          price: 1099,
          quantity: 1,
        },
        {
          productId: products[3]._id,
          size: "One Size",
          color: "Black",
          price: 299,
          quantity: 3,
        },
      ],
      amount: 1696,
      address: {
        street: "321 Customer Rd",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        zipcode: "500001",
      },
      status: "Shipped",
      paymentMethod: "Razorpay",
      payment: true,
      date: Date.now() - 172800000,
    },
    {
      userId: users[4]._id, // user3@example.com
      items: [
        {
          productId: products[4]._id,
          size: "One Size",
          color: "Black",
          price: 599,
          quantity: 1,
        },
        {
          productId: products[0]._id,
          size: "One Size",
          color: "Silver",
          price: 5999,
          quantity: 1,
        },
      ],
      amount: 6598,
      address: {
        street: "654 Shop Plaza",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        zipcode: "600001",
      },
      status: "Order Placed",
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now() - 259200000,
    },
  ];

  try {
    await orderModel.deleteMany({});
    const createdOrders = await orderModel.insertMany(orders);
    console.log(`✅ ${createdOrders.length} orders created`);
    return createdOrders;
  } catch (error) {
    console.log("❌ Error seeding orders:", error.message);
    return [];
  }
};

// Seed Banners
const seedBanners = async () => {
  console.log("🌱 Seeding Banners...");

  const banners = [
    {
      image: "https://via.placeholder.com/1200x400?text=Summer+Collection+Sale",
    },
    {
      image: "https://via.placeholder.com/1200x400?text=New+Arrivals",
    },
    {
      image: "https://via.placeholder.com/1200x400?text=Flash+Deal",
    },
    {
      image: "https://via.placeholder.com/1200x400?text=Best+Sellers",
    },
  ];

  try {
    await bannerModel.deleteMany({});
    const createdBanners = await bannerModel.insertMany(banners);
    console.log(`✅ ${createdBanners.length} banners created`);
    return createdBanners;
  } catch (error) {
    console.log("❌ Error seeding banners:", error.message);
    return [];
  }
};

// Seed Income Levels
const seedIncomeLevels = async (users) => {
  console.log("🌱 Seeding Income Levels...");

  // must match the incomeLevel schema defined in models/incomeLevel.js
  // { levelName, left, right, levelType, price }
  const incomeLevels = [
    {
      levelName: "Bronze",
      left: 0,
      right: 10,
      levelType: "userCount",
      price: 100,
    },
    {
      levelName: "Silver",
      left: 11,
      right: 50,
      levelType: "userCount",
      price: 250,
    },
    {
      levelName: "Gold",
      left: 51,
      right: 100,
      levelType: "userCount",
      price: 500,
    },
    {
      levelName: "Platinum",
      left: 101,
      right: 999,
      levelType: "userCount",
      price: 1000,
    },
  ];

  try {
    await incomeLevelModel.deleteMany({});
    const createdLevels = await incomeLevelModel.insertMany(incomeLevels);
    console.log(`✅ ${createdLevels.length} income levels created`);
    return createdLevels;
  } catch (error) {
    console.log("❌ Error seeding income levels:", error.message);
    return [];
  }
};

// Seed Requests (Withdrawal Requests)
const seedRequests = async (users) => {
  console.log("🌱 Seeding Withdrawal Requests...");

  if (!users.length) {
    console.log("⚠️  Skipping requests - no users");
    return [];
  }

  const requests = [
    {
      userId: users[2]._id,
      amount: 1000,
      mode: "upi",
      upiId: "user1@okhdfcbank",
      status: "pending",
    },
    {
      userId: users[3]._id,
      amount: 5000,
      mode: "account",
      account_number: "1234567890123456",
      ifsc_code: "HDFC0000001",
      account_holder_name: "Mike Johnson",
      status: "completed",
    },
    {
      userId: users[4]._id,
      amount: 2500,
      mode: "upi",
      upiId: "user3@paytm",
      status: "pending",
    },
  ];

  try {
    await requestModel.deleteMany({});
    const createdRequests = await requestModel.insertMany(requests);
    console.log(`✅ ${createdRequests.length} withdrawal requests created`);
    return createdRequests;
  } catch (error) {
    console.log("❌ Error seeding requests:", error.message);
    return [];
  }
};

// Main seed function
const seed = async () => {
  try {
    console.log("🚀 Starting database seeding...\n");
    await connectDB();

    const users = await seedUsers();
    const products = await seedProducts(users);
    const orders = await seedOrders(users, products);
    const banners = await seedBanners();
    const incomeLevels = await seedIncomeLevels(users);
    const requests = await seedRequests(users);

    console.log("\n✅ Database seeding completed successfully!");
    console.log(`
📊 Summary:
   - ${users.length} users
   - ${products.length} products
   - ${orders.length} orders
   - ${banners.length} banners
   - ${incomeLevels.length} income levels
   - ${requests.length} withdrawal requests
    `);

    process.exit(0);
  } catch (error) {
    console.log("❌ Seeding error:", error);
    process.exit(1);
  }
};

// Run the seed
seed();
