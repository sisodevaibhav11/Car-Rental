import express from "express"
import { getAvailableLocations, getGoogleAuthConfig, getUserData, googleLogin, loginUser, registerUser ,getCars} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter=express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser)
userRouter.post('/google',googleLogin)
userRouter.get('/auth-config',getGoogleAuthConfig)
userRouter.get('/locations',getAvailableLocations)
userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',getCars)

export default userRouter;
