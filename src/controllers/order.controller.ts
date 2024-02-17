import { ProductItemType } from "./../models/store.model";
// get my orders
import Stripe from "stripe";
import { Request, Response } from "express";
import Order from "../models/order";
import Store from "../models/store.model";

const STRIPE = new Stripe(process.env.STRIP_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: { productItemId: string; name: string; quantity: string }[];
  deliveryInformation: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  storeId: string;
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";
    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;
    const store = await Store.findById(checkoutSessionRequest.storeId);
    if (!store) {
      throw new Error("Store Not found");
    }

    const newOrder = new Order({
      store: store,
      status: "placed",
      deliveryInformation: checkoutSessionRequest.deliveryInformation,
      cartItem: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      store.productItems
    );
    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      store.deliveryPrice,
      store._id.toString()
    );
    if (!session.url) {
      return res.status(500).json({ message: "Error Creating stripe session" });
    }
    await newOrder.save();
    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  productItems: ProductItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const productItem = productItems.find(
      (item) => item._id.toString() === cartItem.productItemId.toString()
    );
    if (!productItem) {
      throw new Error(`Product Item not found: ${cartItem.productItemId}`);
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "gbp",
        unit_amount: productItem.price,
        product_data: { name: productItem.name },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  storeId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: { amount: deliveryPrice, currency: "gbp" },
        },
      },
    ],
    mode: "payment",
    metadata: { orderId, storeId },
    success_url: `${FRONTEND_URL}/order-status?sucess=true`,
    cancel_url: `${FRONTEND_URL}/detail/${storeId}?cancelled=true`,
  });
  return sessionData;
};

export default { createCheckoutSession, stripeWebhookHandler };
