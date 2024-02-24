import { jwtCheck, jwtParse } from "../middleware/authentication";
import express from "express";
import userController from "../controllers/user.controller";
const router = express.Router();

router.post("/create-user", jwtCheck, userController.createCurrentUser);
router.get("/current-user", jwtCheck, jwtParse, userController.getCurrentUser);
router.put(
  "/update-user",
  jwtCheck,
  jwtParse,
  userController.updateCurrentUser
);

export default router;
