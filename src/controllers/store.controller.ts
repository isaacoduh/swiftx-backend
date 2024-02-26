// import { mongoose } from "mongoose";
import { Request, Response } from "express";
import cloudinary from "cloudinary";

import mongoose from "mongoose";

import Store from "../models/store.model";
import Order from "../models/order.model";

const getStore = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found!" });
    }
    res.json(store);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchStore = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCategories = (req.query.selectedCategories as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Store.countDocuments(query);
    if (cityCheck === 0) {
      return res
        .status(404)
        .json({ data: [], pagination: { total: 0, page: 1, pages: 1 } });
    }

    if (selectedCategories) {
      const categoriesArray = selectedCategories
        .split(",")
        .map((category) => new RegExp(category, "i"));
      query["categories"] = { $all: categoriesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { storeName: searchRegex },
        { categories: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const stores = await Store.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Store.countDocuments(query);
    const response = {
      data: stores,
      pagination: { total, page, pages: Math.ceil(total / pageSize) },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getMyStore = async (req: Request, res: Response) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) {
      return res.status(404).json({ message: "Store not found!" });
    }
    res.json(store);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching store!" });
  }
};

const createStore = async (req: Request, res: Response) => {
  try {
    const existingStore = await Store.findOne({ user: req.userId });

    if (existingStore) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }
    // check if existing user for logged in user
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const store = new Store(req.body);
    store.imageUrl = imageUrl;
    store.user = new mongoose.Types.ObjectId(req.userId);
    store.lastUpdated = new Date();
    await store.save();
    res.status(201).send(store);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateStoreProducts = async (req: Request, res: Response) => {
  try {
    const store = await Store.findOne({ _id: req.params.storeId });
    if (!store) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    store.productItems = req.body.productItems;
    store.lastUpdated = new Date();
    await store.save();
    res.status(200).send(store);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateStore = async (req: Request, res: Response) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) {
      return res.status(404).json({ message: "Store not found!" });
    }

    store.storeName = req.body.storeName;
    store.city = req.body.city;
    store.country = req.body.country;
    store.deliveryPrice = req.body.deliveryPrice;
    // categories, estimatedDeliveryTimes
    store.productItems = req.body.productItems;
    store.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      store.imageUrl = imageUrl;
    }

    await store.save();
    res.status(200).send(store);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const getMyStoreOrders = async (req: Request, res: Response) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    console.log(store);
    if (!store) {
      return res.status(404).json({ message: "Store not found!" });
    }

    const orders = await Order.find({ store: store._id })
      .populate("store")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    const store = await Store.findById(order.store);
    if (store?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unale to update order status" });
  }
};

export default {
  getStore,
  searchStore,
  createStore,
  updateStoreProducts,
  updateStore,
  getMyStore,
  getMyStoreOrders,
  updateOrderStatus,
};
