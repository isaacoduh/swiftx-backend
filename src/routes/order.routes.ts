import { jwtCheck, jwtParse } from "./../middleware/authentication";
import express from "express";
import orderController from "../controllers/order.controller";

const router = express.Router();
router.get("/", jwtCheck, jwtParse, orderController.getMyOrders);
router.post(
  "/create-checkout-session",
  jwtCheck,
  jwtParse,
  orderController.createCheckoutSession
);
router.post("/handle-webhook", orderController.stripeWebhookHandler);

export default router;
