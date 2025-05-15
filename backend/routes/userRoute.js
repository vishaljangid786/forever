import express from "express";
import {
  fetchReferralCode,
  loginUser,
  registerUser,
  adminLogin,
  fetchUserData,
  authRole,
  fetchAllUsers,
  removeUser,
  sendOtp,
  verifyOtp,
  updateRole,
  getReferredUsers,
  addReferenceMember,
  getTeamMember,
  getOptionTeam,
  fetchMultipleUsers,
  checkrefferalcode,
  blockUser,
  updateblockUser,
  updatepricetopay,
  updateuser,
  // updateamountthroughcc,
  getCount,
  updateProfile,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/admin/dashboard", authRole("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome to the admin dashboard!" });
});

userRouter.get("/seller/dashboard", authRole("seller"), (req, res) => {
  res.json({ success: true, message: "Welcome to the seller dashboard!" });
});
// userRouter.get("/fetchallusers", authRole("admin"), fetchAllUsers);
userRouter.get("/fetchallusers", fetchAllUsers);
userRouter.put("/updateRole", authRole("admin"), updateRole);
userRouter.get("/referalcode", authUser, fetchReferralCode);
userRouter.get("/fetchuserdata", authUser, fetchUserData);
userRouter.delete("/deleteuser", authRole("admin"), removeUser);
userRouter.post("/sendOtp", sendOtp);
userRouter.post("/verifyOtp", verifyOtp);

userRouter.get("/referred", authUser, getReferredUsers);
userRouter.post("/addReferenceMember", authUser, addReferenceMember);
userRouter.get("/getTeamMember", authUser, getTeamMember);
userRouter.get("/getOptionTeam", authUser, getOptionTeam);
userRouter.put("/updateBlocked", authRole("admin"), updateblockUser);
userRouter.post("/check-referral", checkrefferalcode);
userRouter.post("/block", authUser, blockUser);
userRouter.post("/fetchMultipleUsers", authUser, fetchMultipleUsers);
userRouter.put("/updatePrice", authRole("admin"), updatepricetopay);
userRouter.put("/update", authUser, updateuser);
userRouter.put("/updateprofile", authUser, updateProfile);
// userRouter.post("/updateamount", authUser, updateamountthroughcc);
userRouter.get("/referrals/:userId", getCount);

export default userRouter;
