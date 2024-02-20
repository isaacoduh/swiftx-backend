import express from "express";
import orderController from "../controllers/order.controller";

const router = express.Router();
router.post("/create-checkout-session", orderController.createCheckoutSession);
router.post("/handle-webhook", orderController.stripeWebhookHandler);

export default router;
