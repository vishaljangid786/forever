import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cartRouter from "./routes/cartRoute.js";
import bannerRoute from "./routes/banner.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import incomeLevelRoute from "./routes/incomeLevel.routes.js";
import requestRouter from "./routes/requestRoute.js";
import deleteRouter from "./routes/deletereqroute.js";
import billRouter from "./routes/billRoute.js";
import SellerTransactionRouter from "./routes/SellerTransactionsRoute.js";

// App Config
const app = express();
const port = process.env.PORT;
connectDB();
connectCloudinary();

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// middlewares
app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/banner", bannerRoute);
app.use("/api/level", incomeLevelRoute);
app.use("/api/request", requestRouter);
app.use("/api/delete", deleteRouter);
app.use("/api/bill", billRouter);
app.use("/api/sellerTransaction", SellerTransactionRouter);

app.get("/", (req, res) => {
  res.send("API Working properly!");
});

app.listen(port, () => console.log("Server started on PORT : " + port));
