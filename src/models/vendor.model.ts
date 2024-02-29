import { model, Model, Schema } from "mongoose";
import { compare, hash } from "bcryptjs";

const SALT_ROUND = 10;

const vendorSchema: Schema = new Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: "" },
    passwordResetExpires: { type: Number },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
      },
    },
  }
);

vendorSchema.pre("save", async function (this, next: () => void) {
  const hashedPassword: string = await hash(
    this.password as string,
    SALT_ROUND
  );
  this.password = hashedPassword;
  next();
});

vendorSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const hashedPassword: string = this.password;
  return compare(password, hashedPassword);
};

vendorSchema.methods.hashPassword = async function (
  password: string
): Promise<string> {
  return hash(password, SALT_ROUND);
};

const VendorModel = model("Vendor", vendorSchema, "Vendor");
export { VendorModel };
