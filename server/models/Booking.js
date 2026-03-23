import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema(
  {
    car: { type: ObjectId, ref: "Car", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupTime: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    passengerCount: { type: Number, default: null },
    needDriver: { type: Boolean, default: false },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
