import express from "express";
import { protect } from "../middleware/auth.js";
import { confirmPaymentAndCreateBooking, createPaymentIntent } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-intent", protect, createPaymentIntent);
paymentRouter.post("/confirm", protect, confirmPaymentAndCreateBooking);

export default paymentRouter;
