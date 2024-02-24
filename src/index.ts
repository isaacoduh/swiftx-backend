import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import storeRoutes from "./routes/store.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to Database"));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use("/api/v1/order/handle-webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health Ok!" });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/store", storeRoutes);
app.use("/api/v1/order", orderRoutes);

app.listen(7100, () => {
  console.log("Server started on localhost 7100");
});
