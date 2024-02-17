import express from "express";
import orderController from "../controllers/order.controller";

const router = express.Router();
router.post("/checkout/create-checkout-session");
router.post("/checkout/webhook", orderController.stripeWebhookHandler);

export default router;
