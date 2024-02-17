import mongoose, { InferSchemaType } from "mongoose";
const productItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type ProductItemType = InferSchemaType<typeof productItemSchema>;

const storeSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  productItems: [productItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

const Store = mongoose.model("Store", storeSchema);
export default Store;
