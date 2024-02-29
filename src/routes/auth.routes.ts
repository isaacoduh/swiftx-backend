import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post("/vendor/create-account", authController.createVendorAccount);

export default router;
