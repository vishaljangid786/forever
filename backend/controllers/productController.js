import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

// function for add product

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      color,
      oldPrice,
      cc,
      sizes,
      bestseller,
    } = req.body;

    // Ensure user is authenticated
    if (!req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid user data",
      });
    }

    const userId = req.user.userId;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !oldPrice ||
      !category ||
      !cc ||
      !subCategory ||
      !color ||
      !sizes
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Handle images
    const images = ["image1", "image2", "image3", "image4"]
      .map((key) => req.files[key] && req.files[key][0])
      .filter(Boolean);

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Upload images to Cloudinary
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Create product data
    const productData = {
      name,
      description,
      category,
      price: price,
      oldPrice: oldPrice,
      subCategory,
      cc: Number(cc),
      color: Array.isArray(color)
        ? color
        : typeof color === "string"
        ? color.split(",").map((c) => c.trim())
        : [],
      bestseller: bestseller === "true",
      sizes: Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]"),
      image: imagesUrl,
      date: Date.now(),
      createdBy: userId,
    };

    // Save product
    const product = new productModel(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Added",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      color,
      cc,
      oldPrice,
    } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (oldPrice) product.oldPrice = oldPrice;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (sizes) product.sizes = Array.isArray(sizes) ? sizes : product.sizes;
    if (color) product.color = Array.isArray(color) ? color : product.color;
    if (cc) product.cc = cc;

    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Product updated", product });
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// function for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("createdBy", "name location address blocked shopName");

    // Filter out products where createdBy is blocked
    const filteredProducts = products.filter(
      (product) => !product.createdBy?.blocked
    );
    res.json({ success: true, products: filteredProducts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// function for removing product
const removeProduct = async (req, res) => {
  try {
    const productId = req.params.id || req.body.id; // Get ID from params OR body

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    await userModel.updateMany(
      { products: productId },
      { $pull: { products: productId } }
    );
    await productModel.findByIdAndDelete(productId);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body || req.params;
    

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await productModel
      .findById(productId)
      .populate("createdBy", "name email location address");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const fetchcategory = async (req, res) => {
  try {
    // Aggregate to get unique categories and subcategories
    const result = await productModel.aggregate([
      {
        $group: {
          _id: null, // No need to group by any field
          categories: { $addToSet: "$category" }, // Collect unique categories
          subCategories: { $addToSet: "$subCategory" }, // Collect unique subcategories
        },
      },
    ]);

    // Send the result as a response
    if (result.length > 0) {
      return res.json({
        success: true,
        categories: result[0].categories,
        subCategories: result[0].subCategories,
      });
    } else {
      return res.json({
        success: false,
        message: "No categories or subcategories found",
      });
    }
  } catch (err) {
    console.error("Error fetching categories and subcategories:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addReview = async (req, res) => {
  try {
    let { productId, user, rating, comment } = req.body;

    // Ensure productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid Product ID" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Check if the user has already reviewed
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === user
    );

    if (existingReview) {
      // Update the existing review
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      existingReview.date = new Date();
    } else {
      // Add new review
      const newReview = {
        user,
        rating: Number(rating),
        comment,
        date: new Date(),
      };
      product.reviews.push(newReview);
    }

    // Recalculate average rating
    product.calculateAverageRating();

    await product.save();
    res.json({
      success: true,
      message: "Review added/updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Fetch reviews for a product
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params; // Getting from params instead of body

    // Add validation for productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format",
      });
    }

    const product = await productModel.findById(
      productId,
      "reviews averageRating"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
};

// Delete a review from a product
const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Filter out the review to be deleted
    product.reviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId
    );

    // Recalculate average rating
    product.calculateAverageRating();

    await product.save();
    res.json({
      success: true,
      message: "Review deleted successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add this new function to fetch products by user ID
const listUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch user's products from DB
    const validProducts = await productModel.find({ createdBy: userId });

    // Extract valid product IDs
    const validProductIds = validProducts.map((product) =>
      product._id.toString()
    );

    // Find and remove invalid product IDs from user's `products` array
    const updatedProductIds = user.products.filter((productId) =>
      validProductIds.includes(productId.toString())
    );

    // If the user's product array needs cleaning
    if (user.products.length !== updatedProductIds.length) {
      user.products = updatedProductIds;
      await user.save();
    }

    res.json({ success: true, products: validProducts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const fetchmultipleproducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product IDs" });
    }

    // Fetch products from MongoDB
    const products = await productModel.find({ _id: { $in: productIds } });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching multiple products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  fetchcategory,
  addReview,
  getReviews,
  deleteReview,
  listUserProducts,
  fetchmultipleproducts,
  updateProduct,
};
