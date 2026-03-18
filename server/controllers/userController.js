import User from "../models/user.js";
import Car from "../models/Car.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";
import { syncCarsAvailabilityState } from "../utils/carAvailability.js";

const getGoogleClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

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

        if (!user.password) {
            return res.json({ success: false, message: "Use Google sign-in for this account" })
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

export const googleLogin = async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.json({ success: false, message: "GOOGLE_CLIENT_ID is not configured" })
        }

        const credential = req.body?.credential;
        if (!credential) {
            return res.json({ success: false, message: "Google credential is required" })
        }

        const googleClient = getGoogleClient();
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload?.email?.trim().toLowerCase();

        if (!payload || !payload.sub || !email) {
            return res.json({ success: false, message: "Invalid Google account data" })
        }

        if (!payload.email_verified) {
            return res.json({ success: false, message: "Google email is not verified" })
        }

        let user = await User.findOne({ email });

        if (user && user.googleId && user.googleId !== payload.sub) {
            return res.json({ success: false, message: "Google account mismatch for this email" })
        }

        if (!user) {
            user = await User.create({
                name: payload.name || email.split("@")[0],
                email,
                googleId: payload.sub,
                image: payload.picture || "",
            });
        } else {
            let shouldSave = false;

            if (!user.googleId) {
                user.googleId = payload.sub;
                shouldSave = true;
            }

            if (payload.picture && user.image !== payload.picture) {
                user.image = payload.picture;
                shouldSave = true;
            }

            if (payload.name && user.name !== payload.name) {
                user.name = payload.name;
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }
        }

        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            token,
            message: user.createdAt?.getTime() === user.updatedAt?.getTime()
                ? "Google account connected successfully"
                : "Logged in with Google successfully",
        });
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

export const getGoogleAuthConfig = async (req, res) => {
    try {
        res.json({
            success: true,
            googleClientId: process.env.GOOGLE_CLIENT_ID || "",
        });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
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
        const cars=await Car.find({ isListed: { $ne: false } })
        res.json({success:true,cars})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}
