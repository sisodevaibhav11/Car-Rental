import crypto from "crypto";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { syncCarAvailabilityState } from "./carAvailability.js";

export const normalizeDateRange = (pickupDate, returnDate) => {
  const picked = new Date(pickupDate);
  const returned = new Date(returnDate);

  if (Number.isNaN(picked.getTime()) || Number.isNaN(returned.getTime()) || returned <= picked) {
    return null;
  }

  return { picked, returned };
};

export const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
    status: { $ne: "cancelled" },
  });

  return bookings.length === 0;
};

export const validateBookingRequest = async ({
  userId,
  bookingInput,
  allowPendingCash = true,
}) => {
  const {
    car,
    pickupDate,
    returnDate,
    pickupTime,
    contactNumber,
    passengerCount,
    needDriver,
    specialRequests,
    paymentMethod = "cash",
  } = bookingInput;
  const normalizedContactNumber = typeof contactNumber === "string" ? contactNumber.trim() : "";
  const normalizedPassengerCount = passengerCount === "" || passengerCount === null || passengerCount === undefined
    ? null
    : Number(passengerCount);
  const normalizedNeedDriver = typeof needDriver === "boolean"
    ? needDriver
    : String(needDriver).toLowerCase() === "yes" || String(needDriver).toLowerCase() === "true";

  if (!car || !pickupDate || !returnDate || !normalizedContactNumber) {
    return { ok: false, status: 400, message: "Car, pickup date, return date, and contact number are required" };
  }

  if (!["cash", "card", "upi"].includes(paymentMethod)) {
    return { ok: false, status: 400, message: "Unsupported payment method" };
  }

  if (normalizedPassengerCount !== null) {
    if (!Number.isInteger(normalizedPassengerCount) || normalizedPassengerCount < 1) {
      return { ok: false, status: 400, message: "Passenger count must be a valid positive number" };
    }
  }

  const dateRange = normalizeDateRange(pickupDate, returnDate);
  if (!dateRange) {
    return { ok: false, status: 400, message: "Return date must be after pickup date" };
  }

  await syncCarAvailabilityState(car);

  const carData = await Car.findById(car);
  if (!carData) {
    return { ok: false, status: 404, message: "Car not found" };
  }

  if (carData.isListed === false) {
    return { ok: false, status: 400, message: "This car is hidden from bookings right now" };
  }

  if (!carData.isAvailable) {
    return {
      ok: false,
      status: 400,
      message: carData.unavailableUntil
        ? `This car is blocked until ${new Date(carData.unavailableUntil).toISOString().split("T")[0]}`
        : "This car is currently unavailable",
    };
  }

  const isAvailable = await checkAvailability(car, dateRange.picked, dateRange.returned);
  if (!isAvailable) {
    return { ok: false, status: 400, message: "Car is not available for the selected dates" };
  }

  const noOfDays = Math.ceil((dateRange.returned - dateRange.picked) / (1000 * 60 * 60 * 24));
  const price = carData.pricePerDay * noOfDays;
  const normalizedPaymentMethod = paymentMethod === "cash" ? "cash" : paymentMethod;
  const paymentStatus = normalizedPaymentMethod === "cash" && allowPendingCash ? "pending" : "paid";

  if (normalizedPassengerCount !== null && normalizedPassengerCount > carData.seating_capacity) {
    return {
      ok: false,
      status: 400,
      message: `Passenger count cannot exceed ${carData.seating_capacity} for this car`,
    };
  }

  return {
    ok: true,
    carData,
    price,
    bookingData: {
      car,
      owner: carData.owner,
      user: userId,
      pickupDate,
      returnDate,
      pickupTime: pickupTime || "",
      contactNumber: normalizedContactNumber,
      passengerCount: normalizedPassengerCount,
      needDriver: normalizedNeedDriver,
      specialRequests: specialRequests?.trim() || "",
      price,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus,
    },
  };
};

export const createMockPaymentIntent = ({ amount, paymentMethod, carId, userId }) => {
  const seed = `${userId}:${carId}:${paymentMethod}:${amount}:${Date.now()}`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");

  return {
    orderId: `ord_${hash.slice(0, 18)}`,
    paymentToken: `paytok_${hash.slice(18, 42)}`,
    amount,
  };
};
