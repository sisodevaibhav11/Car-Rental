import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { syncCarsAvailabilityState } from "./utils/carAvailability.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

//inititalise express app
const app=express();

//connectd db
await connectDB();
await syncCarsAvailabilityState();

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/',(req,res)=>res.send("server is running"));
app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/booking',bookingRouter)
app.use('/api/bookings', bookingRouter)


// Handle multipart/form-data parsing errors (multer/busboy) with clear client messages.
app.use((err, req, res, next) => {
  if (!err) return next();

  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (typeof err.message === "string" && err.message.includes("Malformed part header")) {
    return res.status(400).json({
      success: false,
      message: "Invalid multipart form-data. Do not set Content-Type manually in Postman.",
    });
  }

  console.error("UNHANDLED ERROR:", err.message);
  return res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT=process.env.PORT || 3000;

setInterval(() => {
  syncCarsAvailabilityState().catch((error) => {
    console.error("AVAILABILITY SYNC ERROR:", error.message);
  });
}, 60 * 1000);

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Sever running on port ${PORT}`));
}

export default app;
