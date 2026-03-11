import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { syncCarAvailabilityState, syncCarsAvailabilityState } from "../utils/carAvailability.js";

// Returns true when the car has no overlapping bookings in the requested range.
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
    status: { $ne: "cancelled" },
  });

  return bookings.length === 0;
};

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

    await syncCarsAvailabilityState({ location });

    const cars = await Car.find({ location, isAvailable: true });

    const availableCars = await Promise.all(
      cars.map(async (car) => {
        const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
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

// API to create a booking.
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      car,
      pickupDate,
      returnDate,
      pickupTime,
      contactNumber,
      passengerCount,
      needDriver,
      specialRequests,
    } = req.body;

    if (!car || !pickupDate || !returnDate || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Car, pickup date, return date, and contact number are required",
      });
    }

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({ success: false, message: "Car is not available" });
    }

    const carData = await Car.findById(car);
    if (!carData) {
      return res.json({ success: false, message: "Car not found" });
    }

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    if (Number.isNaN(picked.getTime()) || Number.isNaN(returned.getTime()) || returned <= picked) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * noOfDays;

    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      pickupTime: pickupTime || "",
      contactNumber,
      passengerCount: passengerCount || null,
      needDriver: Boolean(needDriver),
      specialRequests: specialRequests || "",
      price,
    });

    await syncCarAvailabilityState(car);

    return res.json({ success: true, message: "Booking created successfully" });
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
