import User from "../models/user.js";
import Car from "../models/Car.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { syncCarsAvailabilityState } from "../utils/carAvailability.js";


const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

//registeruser
export const registerUser = async (req, res) => {
    try {
        const name = req.body?.name?.trim();
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Name, email and password are required' })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' })
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password:hashedPassword })
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

//login user
export const loginUser = async (req, res) => {
    try {
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({ success: true, token });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message }) 
    }
}


//get user data using token 
export const getUserData=async(req,res)=>{
    try{
        const {user}=req;
        res.json({success:true,user});
    }
    catch(error)
    {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//get all cars from frontend
export const getCars=async(req,res)=>{
    try{
        await syncCarsAvailabilityState();
        const cars=await Car.find({})
        res.json({success:true,cars})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}
