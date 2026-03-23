import Booking from "../models/Booking.js";
import { syncCarAvailabilityState, syncCarsAvailabilityState } from "../utils/carAvailability.js";
import { checkAvailability, normalizeDateRange, validateBookingRequest } from "../utils/bookingCheckout.js";

// API to check availability of cars for the given date range and location.
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    if (!location || !pickupDate || !returnDate) {
      return res.json({
        success: false,
        message: "Location, pickup date, and return date are required",
      });
    }

    const dateRange = normalizeDateRange(pickupDate, returnDate);
    if (!dateRange) {
      return res.json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    await syncCarsAvailabilityState({ location });

    const cars = await Car.find({ location, isListed: { $ne: false } });

    const availableCars = await Promise.all(
      cars.map(async (car) => {
        if (!car.isAvailable) {
          return null;
        }

        const isAvailable = await checkAvailability(car._id, dateRange.picked, dateRange.returned);
        return isAvailable ? car : null;
      })
    );

    return res.json({
      success: true,
      cars: availableCars.filter(Boolean),
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCarBookingStatus = async (req, res) => {
  try {
    const { carId } = req.params;
    const { pickupDate, returnDate } = req.query;

    await syncCarAvailabilityState(carId);

    const car = await Car.findById(carId);
    if (!car || car.isListed === false) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (!pickupDate || !returnDate) {
      return res.json({
        success: true,
        isBookable: car.isAvailable,
        unavailableUntil: car.unavailableUntil,
        message: car.isAvailable ? "Car is available for booking" : "This car is currently unavailable for booking",
      });
    }

    const dateRange = normalizeDateRange(pickupDate, returnDate);
    if (!dateRange) {
      return res.json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    const isBookable = car.isAvailable && await checkAvailability(carId, dateRange.picked, dateRange.returned);

    return res.json({
      success: true,
      isBookable,
      unavailableUntil: car.unavailableUntil,
      message: isBookable
        ? "Car is available for the selected dates"
        : "This car is unavailable for the selected dates",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to create a booking.
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookingValidation = await validateBookingRequest({
      userId: _id,
      bookingInput: req.body,
    });

    if (!bookingValidation.ok) {
      return res.status(bookingValidation.status).json({
        success: false,
        message: bookingValidation.message,
      });
    }

    if (bookingValidation.bookingData.paymentMethod !== "cash") {
      return res.status(400).json({
        success: false,
        message: "Use the online payment flow for card or UPI bookings",
      });
    }

    await Booking.create(bookingValidation.bookingData);
    await syncCarAvailabilityState(bookingValidation.bookingData.car);

    return res.json({
      success: true,
      message: "Booking created successfully. Payment will be collected at pickup.",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to list user bookings.
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to get owner bookings.
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to change booking status.
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();
    await syncCarAvailabilityState(booking.car);

    return res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
