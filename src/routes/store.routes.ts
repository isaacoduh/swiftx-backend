import { jwtCheck, jwtParse } from "./../middleware/authentication";
import express from "express";
import multer from "multer";
import storeController from "../controllers/store.controller";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
});

router.get("/get-my-store", jwtCheck, jwtParse, storeController.getMyStore);
router.post(
  "/create-my-store",
  upload.single("imageFile"),
  jwtCheck,
  jwtParse,
  storeController.createStore
);
router.get("/:storeId", storeController.getStore);
router.get("/search/:city", storeController.searchStore);
router.put(
  "/update-store-products/:storeId",
  jwtCheck,
  jwtParse,
  storeController.updateStoreProducts
);
router.put(
  "/update-my-store",
  upload.single("imageFile"),
  jwtCheck,
  jwtParse,
  storeController.updateStore
);
router.get("/order", jwtCheck, jwtParse, storeController.getMyStoreOrders);
router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  storeController.updateOrderStatus
);
export default router;
