import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import crypto from "crypto";
import productModel from "../models/productModel.js";
import OTP from "../models/otpModel.js";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import IncomeLevel from "../models/incomeLevel.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP in database
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP via Email
    const mailOptions = {
      from: `"VK Marketing" <vkallinmarketing@gmail.com>`,
      to: email,
      subject: "Your OTP Code from VK Marketing (Valid for 5 Minutes)",
      replyTo: "vkallinmarketing@gmail.com",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `<div style="font-family: sans-serif;">
          <h2>Your OTP is: <span style="color: #2d89ef;">${otp}</span></h2>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <br />
          <p style="font-size: 12px; color: gray;">This is an automated message from VK Marketing. Do not reply.</p>
        </div>`,
    };    

    // console.log(otp);

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP sending error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP verified, delete it from DB
    await OTP.deleteOne({ email });

    // If a new password is provided, update user's password
    if (newPassword) {
      const user = await userModel.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();
    }

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// Function to generate a unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase(); // Generates a random 12-character alphanumeric code
};

let currentUID = 10001; // Start from 10002

const generateUID = async () => {
  const lastUser = await userModel.findOne({}).sort({ uid: -1 }).lean();

  if (!lastUser || !lastUser.uid) {
    return "VK10001";
  }

  const lastUIDNum = parseInt(lastUser.uid.replace("VK", ""), 10);
  const newUID = `VK${lastUIDNum + 1}`;
  return newUID;
};

/* --------Routes --------*/

// Route for user login
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      referralCode,
      role,
      option,
      shopName,
    } = req.body;

    // Checking if the user already exists
    const checkExistdata = await userModel.findOne({
      $or: [{ phone }, { email }],
    });

    if (checkExistdata) {
      return res
        .status(409)
        .json({ message: "User already exists with the same credentials" });
    }

    // Validating email, password, and phone number
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid phone number" });
    }

    if (option !== "left" && option !== "right") {
      return res
        .status(400)
        .json({ message: "Option must be 'left' or 'right'" });
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generating a unique referral code
    const newReferralCode = generateReferralCode();
    const UID = await generateUID();

    // Assign role based on referral code
    let assignedRole = "user"; // Default role is "user"

    // Assign role based on referral code or explicit role provided
    if (referralCode === "ADMIN@ADMIN") {
      assignedRole = "admin";
    } else if (referralCode === "SELLER@SELLER") {
      assignedRole = "seller";
    } else if (role === "admin" || role === "seller") {
      assignedRole = role;
    }

    let referredByUserId = null;

    if (
      referralCode &&
      referralCode !== "ADMIN@ADMIN" &&
      referralCode !== "SELLER@SELLER"
    ) {
      const referringUser = await userModel.findOne({ referralCode });
      if (referringUser) {
        referredByUserId = referringUser._id;
      }
    }

    // Creating a new user
    const newUser = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: referredByUserId,
      uid: UID,
      role: assignedRole,
      option: option,
      shopName: shopName || "",
      address: {
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        country: address?.country || "",
        zipcode: address?.zipcode || "",
      },
    });

    const user = await newUser.save();

    // Creating a token
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      UID: user.uid,
      left: 0,
      right: 0,
      referralCode: user.referralCode,
      role: user.role, // Include role in response
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if the requesting user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete users",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user first
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete all products associated with the user
    await productModel.deleteMany({ userId: id });

    // Delete the user
    await userModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User and their products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { uid, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({
        error: "missingField require",
        message: {
          uid: !uid ? "uid is require" : undefined,
          password: !password ? "password is required" : undefined,
        },
      });
    }

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ success: false, message: "Only users can access this route" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Create token with userId instead of id
      const token = jwt.sign(
        {
          userId: user._id, // Changed from id to userId
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { uid, password } = req.body;

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid UID or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token and user info
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const checkrefferalcode = async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      return res
        .status(400)
        .json({ success: false, message: "Referral code is required" });
    }

    const user = await userModel.findOne({ referralCode });

    if (referralCode === "ADMIN@ADMIN" || referralCode === "SELLER@SELLER") {
      return res.json({ success: true, message: "Referral code is valid." });
    }

    if (user) {
      return res.json({ success: true, message: "Referral code is valid." });
    } else {
      return res.json({ success: false, message: "Invalid referral code." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

const authRole = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .json({ success: false, message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the user has the correct role
      if (decoded.role !== role) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      req.user = decoded; // Attach user data to request
      next();
    } catch (error) {
      console.error("Auth Role Error:", error);
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};

// Route to fetch referral code
const fetchReferralCode = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // Get userId from auth middleware
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error("Error fetching referral code:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral code",
    });
  }
};

const getReferredUsers = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const referredUsersRaw = await userModel
      .find({ referredBy: userId })
      .select("name email createdAt cc option lev status phone");

    const referredUsers = referredUsersRaw.map((user) => {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        option: user.option,
        status: user.status,
        cc: parseInt(user.cc || 0),
        lev: parseInt(user.lev || 0),
      };
    });

    res.status(200).json({
      success: true,
      count: referredUsers.length,
      referredUsers,
    });
  } catch (error) {
    console.error("Error fetching referred users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referred users",
    });
  }
};

const addReferenceMember = async (req, res) => {
  const { name, phone, email, pincode, password, option } = req.body;
  const userId = req.user.userId || req.user.id;
  try {
    if (!name || !phone || !email || !pincode || !password) {
      return res.status(400).json({
        error: "MissingField required",
        message: {
          name: !name ? "name is required" : undefined,
          phone: !phone ? "phone is required" : undefined,
          email: !email ? "email is required" : undefined,
          pincode: !pincode ? "pincode is required" : undefined,
          password: !password ? "password is required" : undefined,
          option: !option ? "option must be 'left' or 'right'" : undefined, // Fix here
        },
      });
    }

    if (option !== "left" && option !== "right") {
      return res
        .status(400)
        .json({ message: "Option must be 'left' or 'right'" });
    }

    const checkExistdata = await userModel.findOne({
      $or: [{ phone }, { email }], // Check if either phone or email exists
    });

    if (checkExistdata) {
      // Just check if the user exists
      return res
        .status(409)
        .json({ message: "User already exists with the same credentials" });
    }

    // Generating a unique referral code
    const newReferralCode = generateReferralCode();
    const UID = generateUID();

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const referrer = await userModel.findById(userId);
    if (!referrer) {
      return res.status(404).json({ message: "Referrer user not found" });
    }

    // Creating a new user
    const newUser = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: userId, // Save referrer's ID
      option: option,
      uid: UID,
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipcode: pincode,
      },
    });

    const user = await newUser.save();

    await userModel.findByIdAndUpdate(
      userId,
      { $push: { team: user._id } }, // Push userId into team array
      { new: true }
    );

    res.status(201).json({ message: "add team member successful", user });
  } catch (error) {
    console.error("addReferenceMember Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password"); // Exclude password field

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or role" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updatepricetopay = async (req, res) => {
  try {
    const { userId, price } = req.body;

    // Check for undefined or null, but allow 0 as a valid value
    if (!userId || price === undefined || price === null) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or price" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.pricetopay = price;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Price updated successfully" });
  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getTeamMember = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userTeam = await userModel.findById(userId).populate("team");
    // Count "left" and "right" options
    const count = userTeam.team.reduce(
      (acc, user) => {
        if (user.option === "left") acc.left += 1;
        if (user.option === "right") acc.right += 1;
        return acc;
      },
      { left: 0, right: 0 }
    );

    res.status(200).json({
      message: "Get All Team Data",
      left: count.left,
      right: count.right,
      total: userTeam.team.length,
    });
  } catch (error) {
    console.error("getTeamMember Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOptionTeam = async (req, res) => {
  try {
    const { option } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!["left", "right", "total"].includes(option)) {
      return res
        .status(400)
        .json({ message: "Option must be 'left', 'right' or 'total'" });
    }

    let filter = { referredBy: userId };
    if (option !== "total") {
      filter.option = option;
    }
    const users = await userModel.find(filter);

    res.status(200).json({ message: `Got ${option} team members`, users });
  } catch (error) {
    console.error("getOptionTeam Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchMultipleUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user IDs" });
    }

    // Fetch users whose IDs are in the provided list, excluding passwords
    const users = await userModel
      .find({ _id: { $in: userIds } })
      .select("-password");

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching multiple users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { blocked: true } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updateblockUser = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { blocked: status } },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updateuser = async (req, res) => {
  try {
    const { userId, name, email, phone, address } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Find user and update only provided fields
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: { name, email, phone, address } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, location, address } = req.body;

    // Check for duplicate phone or email
    if (phone) {
      const existingPhoneUser = await userModel.findOne({
        phone,
        _id: { $ne: userId },
      });
      if (existingPhoneUser) {
        return res
          .status(400)
          .json({ success: false, message: "Phone number already in use" });
      }
    }

    if (email) {
      const existingEmailUser = await userModel.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingEmailUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
    }

    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (location !== undefined) updatedFields.location = location;
    if (address !== undefined) updatedFields.address = address;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const sanitizedUser = {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      location: updatedUser.location,
      address: updatedUser.address,
    };

    res.json({ success: true, updatedUser: sanitizedUser });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// const updateamountthroughcc = async (req, res) => {
//   try {
//     const { userId, cc } = req.body;

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User ID is required" });
//     }

//     // Find the user by ID
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Check if cc is greater than a certain value (e.g., 0)
//     if (user.cc >= 10) {
//       user.status = true;
//       user.cc -= 10; // Deduct the cc amount
//       await user.save();
//       return res.status(200).json({
//         success: true,
//         message: "User status updated",
//         status: user.status,
//       });
//     }

//     // If cc is not greater than 0, do nothing and return
//     return res.status(200).json({
//       success: true,
//       message: "No changes made",
//       status: user.status,
//     });
//   } catch (error) {
//     console.error("Error updating user's amount through cc:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// Recursive function to count total team members

const getReferralDetails = async (userId) => {
  try {
    const referredUsers = await userModel.find({ referredBy: userId });

    if (referredUsers.length === 0) return { count: 0, users: [] }; // Base case: No referrals

    // Fetch sub-referrals in parallel
    const subResults = await Promise.all(
      referredUsers.map((user) => getReferralDetails(user._id))
    );

    // Aggregate count and users
    const totalCount =
      referredUsers.length +
      subResults.reduce((acc, result) => acc + result.count, 0);

    const allUsers = [
      ...referredUsers,
      ...subResults.flatMap((res) => res.users),
    ];

    return { count: totalCount, users: allUsers };
  } catch (error) {
    console.error("Error in getReferralDetails:", error);
    return { count: 0, users: [] };
  }
};

const getCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { count, users } = await getReferralDetails(userId);

    // Transform cc and level to int for each user
    const transformedUsers = users.map((user, index) => {
      const mappedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        option: user.option,
        status: user.status,
        cc: parseInt(user.cc || 0),
        level:user.level
      };

      return mappedUser;
    });

    return res.status(200).json({
      success: true,
      message: "Referrals fetched successfully",
      count,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const fetchUserDataweb = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    let user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await processStatusAndLevels();
    user = await userModel.findById(userId).select("-password"); // 🔁 REFRESH

    // ✅ Step 3: No level completed, just return current data
    return res.status(200).json({
      success: true,
      message: "User data fetched",
      user,
    });
  } catch (error) {
    console.error("❌ Error in fetchUserData:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
};

const fetchUserData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    let user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await processStatusAndLevels();
    user = await userModel.findById(userId).select("-password"); // Refresh

    // Convert numeric fields to integers
    const userObj = user.toObject();

    userObj.left = userObj.left !== undefined ? parseInt(userObj.left) : 0;
    userObj.right = userObj.right !== undefined ? parseInt(userObj.right) : 0;
    userObj.pricetopay =
      userObj.pricetopay !== undefined ? parseInt(userObj.pricetopay) : 0;
    userObj.amount =
      userObj.amount !== undefined ? parseInt(userObj.amount) : 0;
    userObj.level = userObj.level !== undefined ? parseInt(userObj.level) : 0;

    // Convert cc (double) to int as well
    userObj.cc = userObj.cc !== undefined ? parseInt(userObj.cc) : 0;

    return res.status(200).json({
      success: true,
      message: "User data fetched",
      user: userObj,
    });
  } catch (error) {
    console.error("❌ Error in fetchUserData:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
};

// // ----------------function to change data for all users on cc upadate--------------------------------------------------------------------------
const processStatusAndLevels = async () => {
  const levels = await IncomeLevel.find().sort({ left: 1 });
  // STEP 1: Promote users who have CC >= 10 and are not yet active
  const usersToActivate = await userModel.find({
    cc: { $gte: 10 },
    status: false,
    level: { $exists: false },
  });

  for (const user of usersToActivate) {
    user.cc -= 10;
    user.status = true;

    const firstLevel = levels[0];
    user.level = firstLevel._id;

    await user.save();
  }

  // STEP 2: For users who already have a level, check for level completion
  const allUsersWithLevel = await userModel.find({
    level: { $exists: true },
  });

  for (const user of allUsersWithLevel) {
    let currentLevelIndex = levels.findIndex(
      (l) => l._id.toString() === user.level?.toString()
    );

    // Only proceed if they are not already at the max level
    while (currentLevelIndex !== -1 && currentLevelIndex < levels.length - 1) {
      const currentLevel = levels[currentLevelIndex];

      // Check if the user qualifies to move to the next level
      if (user.left >= currentLevel.left && user.right >= currentLevel.right) {
        // Deduct left and right counts of the current level
        user.left -= currentLevel.left;
        user.right -= currentLevel.right;

        // Reward the user for completing this level
        user.amount += currentLevel.price;

        // Move to the next level
        const nextLevel = levels[currentLevelIndex + 1];
        user.level = nextLevel._id;

        // Recalculate currentLevelIndex
        currentLevelIndex++;
      } else {
        break; // Stop if the user hasn't met the current level's requirement
      }
    }

    // Update CC for the user after processing
    // user.cc = 0;

    await user.save();
  }

  return { success: true };
};

const fetchReferralsRecursive = async (userId, level, results) => {
  const referredUsers = await userModel.find({ referredBy: userId });

  for (const user of referredUsers) {
    results.push({ ...user._doc, level }); // Tag with level
    await fetchReferralsRecursive(user._id, level + 1, results); // Recurse
  }
};

// Entry function
const newfunction = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("Starting referral tree from user:", userId);

    const results = [];
    await fetchReferralsRecursive(userId, 1, results); // Start at level 1

    res.status(200).json(results);
  } catch (error) {
    console.error("Error building referral tree:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getReferralsByUserId = async (req, res) => {
  try {
    const { userId } = req.body;
    const referredUsers = await userModel.find({ referredBy: userId });
    res.status(200).json(referredUsers);
  } catch (error) {
    console.error("Error fetching referred users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export {
  checkrefferalcode,
  getReferredUsers,
  getReferralsByUserId,
  getCount,
  blockUser,
  updateuser,
  newfunction,
  updateblockUser,
  updateProfile,
  fetchMultipleUsers,
  sendOtp,
  verifyOtp,
  loginUser,
  updateRole,
  fetchAllUsers,
  registerUser,
  adminLogin,
  fetchReferralCode,
  fetchUserData,
  removeUser,
  authRole,
  addReferenceMember,
  getTeamMember,
  getOptionTeam,
  fetchUserDataweb,
  updatepricetopay,
  // updateamountthroughcc,
};
