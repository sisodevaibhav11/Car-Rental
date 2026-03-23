import express from "express"
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, getCarBookingStatus, getOwnerBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect, requireOwner } from "../middleware/auth.js"

const bookingRouter=express.Router();

bookingRouter.post('/check-availability',checkAvailabilityOfCar);
bookingRouter.get('/car-status/:carId',getCarBookingStatus);
bookingRouter.post('/create',protect,createBooking);
bookingRouter.get('/user',protect,getUserBookings);
bookingRouter.get('/owner',protect,requireOwner,getOwnerBookings);
bookingRouter.post('/change-status',protect,requireOwner,changeBookingStatus);

export default bookingRouter;
