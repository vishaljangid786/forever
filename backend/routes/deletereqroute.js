import express from "express";
import {
  createdeleteRequest,
  getdeleterequests,
  deletedeleterequests,
} from "../controllers/deletecontroler.js";

const deleteRouter = express.Router();

deleteRouter.post("/createdeleterequests", createdeleteRequest);
deleteRouter.get("/getdeleterequests", getdeleterequests);
deleteRouter.post("/deletedeleterequests/:uid", deletedeleterequests);

export default deleteRouter;