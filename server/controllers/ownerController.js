import { buildImageUrl, uploadImageFile } from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/user.js";
import { syncCarsAvailabilityState } from "../utils/carAvailability.js";

// API to change role from user to owner
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;

    // Find and Update with { new: true } to get the updated document back if needed
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { role: "owner" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.error("ROLE CHANGE ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


//add car by owner
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const carData = req.body?.carData;
    if (!carData) {
      return res.status(400).json({
        success: false,
        message: "carData is required in form-data",
      });
    }

    let car;
    try {
      car = JSON.parse(carData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "carData must be valid JSON string",
      });
    }

    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const uploadResponse = await uploadImageFile(imageFile, "/users");

    await Car.create({
      ...car,
      owner: _id,
      image: buildImageUrl(req, uploadResponse.url),
    });

    res.json({ success: true, message: "Car Added" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



//api to list owner cars
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    await syncCarsAvailabilityState({ owner: _id });
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//api to toggle car availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    //checking is car belong to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();
    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//api to delete car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    //checking is car belong to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.owner = null;
    car.isAvailable = false;
    await car.save();
    res.json({ success: true, message: "Car Removed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//api to get Dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });
    const carIds = cars.map((car) => car._id);
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate("car")
      .sort({ createdAt: -1 });
    const pendingBookings = bookings.filter((booking) => booking.status === "pending");
    const completedBookings = bookings.filter((booking) => booking.status === "confirmed");


    //calculate monthly revenue from booking where status is confirmed
    const monthlyRevenue = completedBookings.reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue
    }

    res.json({ success: true, dashboardData });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//api to upadate user image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const width = Number(req.body.width) || 400;
    const height = Number(req.body.height) || 400;
    const quality = Number(req.body.quality) || 80;

    if (width <= 0 || height <= 0 || quality <= 0 || quality > 100) {
      return res.status(400).json({
        success: false,
        message: "width and height must be > 0, quality must be between 1 and 100",
      });
    }

    // Upload original image and return a transformed delivery URL to control output size.
    const uploadResponse = await uploadImageFile(imageFile, "/users");

    const transformation = `w-${width},h-${height},q-${quality}`;
    const resizedImageUrl = buildImageUrl(req, uploadResponse.url, transformation);

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { image: resizedImageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "User image updated",
      image: updatedUser.image,
    });

  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}
