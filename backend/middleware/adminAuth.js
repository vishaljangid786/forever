import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    // Check if user exists and is admin
    const user = await userModel.findById(decoded.userId);
    

    if (!user || !user.role== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as admin" });
    }

    // Add user data to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default adminAuth;
