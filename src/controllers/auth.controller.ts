import { Request, Response } from "express";
import {
  createVendor,
  getVendorByUsernameOrEmail,
} from "../services/auth.service";

const createVendorAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;
  const checkIfUserExist = await getVendorByUsernameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new Error("Invalid credentials");
  }

  const result = await createVendor(req.body);
  res
    .status(201)
    .json({ message: "User created successfully!", vendor: result });
};

export default { createVendorAccount };
