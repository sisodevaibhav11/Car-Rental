import Booking from "../models/Booking.js";
import { syncCarAvailabilityState } from "../utils/carAvailability.js";
import { createMockPaymentIntent, validateBookingRequest } from "../utils/bookingCheckout.js";

export const createPaymentIntent = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookingValidation = await validateBookingRequest({
      userId: _id,
      bookingInput: req.body,
      allowPendingCash: false,
    });

    if (!bookingValidation.ok) {
      return res.status(bookingValidation.status).json({
        success: false,
        message: bookingValidation.message,
      });
    }

    if (bookingValidation.bookingData.paymentMethod === "cash") {
      return res.status(400).json({
        success: false,
        message: "Cash bookings do not need an online payment intent",
      });
    }

    const intent = createMockPaymentIntent({
      amount: bookingValidation.price,
      paymentMethod: bookingValidation.bookingData.paymentMethod,
      carId: bookingValidation.bookingData.car,
      userId: _id.toString(),
    });

    return res.json({
      success: true,
      message: "Payment intent created",
      payment: {
        ...intent,
        paymentMethod: bookingValidation.bookingData.paymentMethod,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmPaymentAndCreateBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { paymentToken, orderId } = req.body;

    if (!paymentToken || !orderId) {
      return res.status(400).json({
        success: false,
        message: "paymentToken and orderId are required",
      });
    }

    const bookingValidation = await validateBookingRequest({
      userId: _id,
      bookingInput: req.body,
      allowPendingCash: false,
    });

    if (!bookingValidation.ok) {
      return res.status(bookingValidation.status).json({
        success: false,
        message: bookingValidation.message,
      });
    }

    if (bookingValidation.bookingData.paymentMethod === "cash") {
      return res.status(400).json({
        success: false,
        message: "Cash bookings must use the normal booking endpoint",
      });
    }

    const existingBooking = await Booking.findOne({ orderId });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "This payment order has already been used",
      });
    }

    const booking = await Booking.create({
      ...bookingValidation.bookingData,
      paymentStatus: "paid",
      orderId,
      paymentId: paymentToken.replace("paytok_", "txn_"),
      paidAt: new Date(),
    });

    await syncCarAvailabilityState(booking.car);

    return res.json({
      success: true,
      message: "Payment confirmed and booking created successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
