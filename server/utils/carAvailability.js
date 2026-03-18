import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

export const syncCarAvailabilityState = async (carId) => {
  const now = new Date();
  const activeBooking = await Booking.findOne({
    car: carId,
    status: { $ne: "cancelled" },
    pickupDate: { $lte: now },
    returnDate: { $gte: new Date() },
  }).sort({ returnDate: 1 });

  const upcomingBooking = await Booking.findOne({
    car: carId,
    status: { $ne: "cancelled" },
    pickupDate: { $gt: now },
  }).sort({ pickupDate: 1 });

  const nextState = activeBooking
    ? {
        isAvailable: false,
        unavailableUntil: activeBooking.returnDate,
      }
    : {
        isAvailable: true,
        unavailableUntil: upcomingBooking?.pickupDate || null,
      };

  return Car.findByIdAndUpdate(carId, nextState, { new: true });
};

export const syncCarsAvailabilityState = async (filter = {}) => {
  const cars = await Car.find(filter).select("_id");
  await Promise.all(cars.map((car) => syncCarAvailabilityState(car._id)));
};
