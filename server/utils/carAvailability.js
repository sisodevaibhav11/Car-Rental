import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

export const syncCarAvailabilityState = async (carId) => {
  const blockingBooking = await Booking.findOne({
    car: carId,
    status: { $ne: "cancelled" },
    returnDate: { $gte: new Date() },
  }).sort({ returnDate: -1 });

  const nextState = blockingBooking
    ? {
        isAvailable: false,
        unavailableUntil: blockingBooking.returnDate,
      }
    : {
        isAvailable: true,
        unavailableUntil: null,
      };

  return Car.findByIdAndUpdate(carId, nextState, { new: true });
};

export const syncCarsAvailabilityState = async (filter = {}) => {
  const cars = await Car.find(filter).select("_id");
  await Promise.all(cars.map((car) => syncCarAvailabilityState(car._id)));
};
