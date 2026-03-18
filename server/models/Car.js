import mongoose from "mongoose";
const {ObjectId}=mongoose.Schema.Types

const carSchema=new mongoose.Schema({
    owner:{type:ObjectId,ref:'User'},
    brand:{type:String,required:true},
    model:{type:String,required:true},
    image:{type:String,required:true},
    year:{type:String,required:true},
    category:{type:String,required:true},
    seating_capacity:{type:Number,required:true},
    fuel_type:{type:String,required:true},
    transmission:{type:String,required:true},
    pricePerDay:{type:Number,required:true},
    location:{type:String,required:true},
    description:{type:String,required:true},
    isListed:{type:Boolean,default:true},
    isAvailable:{type:Boolean,default:true},
    unavailableUntil:{type:Date,default:null},
},{timestamps:true})

const Car=mongoose.model('Car',carSchema)

export default Car
