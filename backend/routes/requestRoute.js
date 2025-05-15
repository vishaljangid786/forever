import express from "express";
import {
  createrequest,
  deleteRequest,
  failrequest,
  getrequests,
getUserTransactions,
  updateRequestStatus,
} from "../controllers/requestController.js"; // ✅ Add .js

const requestRouter = express.Router();

requestRouter.post("/createrequest", createrequest);
requestRouter.get("/getrequests", getrequests);
requestRouter.post("/updatestatus", updateRequestStatus);
requestRouter.post("/failrequest", failrequest);
requestRouter.post("/transactions", getUserTransactions);
requestRouter.delete("/delete/:requestId", deleteRequest); // Add this line

export default requestRouter;
