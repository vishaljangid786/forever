import express from "express";
import { authRole } from "../controllers/userController.js";
import {
  addNewLevel,
  deleteLevel,
  getAllLevel,
  getSingleLevel,
} from "../controllers/incomeLevel.controller.js";
import authUser from "../middleware/auth.js";

const incomeLevelRoute = express.Router();

incomeLevelRoute.post("/addNewLevel", authRole("admin"), addNewLevel);
incomeLevelRoute.get("/getAllLevel", authUser, getAllLevel);

// Define DELETE route
incomeLevelRoute.delete("/delete/:id", authRole("admin"), deleteLevel);
incomeLevelRoute.get("/singlelevel/:id", getSingleLevel);

export default incomeLevelRoute;
