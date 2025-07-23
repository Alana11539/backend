import mongoose from "mongoose";

const donorSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    bloodGroup:{
        type: String,
        required: true, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    lastDonation: {
        type: Date,
        required: true,
    },
    contact:{
        type: Number,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    status:{
        type:String
    }

}, {timestamps: true});
const donorModel = mongoose.model("Donor", donorSchema);
export default donorModel;