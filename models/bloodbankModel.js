import mongoose from "mongoose";

const bloodBankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: { 
        type: String,
        required: true, 
    },
    contact: {
        type: Number,
        required: true,
    },
    bloodStock: {
        A_Positive: { type: Number, default: 0 },
        A_Negative: { type: Number, default: 0 },
        B_Positive: { type: Number, default: 0 },
        B_Negative: { type: Number, default: 0 },
        AB_Positive: { type: Number, default: 0 },
        AB_Negative: { type: Number, default: 0 },
        O_Positive: { type: Number, default: 0 },
        O_Negative: { type: Number, default: 0 },
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
const bloodBankModel = mongoose.model("BloodBank", bloodBankSchema);
export default bloodBankModel;