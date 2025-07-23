import mongoose from "mongoose";
 
const patientSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
bloodGroupType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
},
contact: {
    type: Number,
    
},
hospital:{
    type: String
},
    age: {
        type: Number,
        required: true,
    },
    medicalHistory: {
        type: String,
        
    },
    urgency:{
        type:String
    },
    addmissionDate:{
        type: Number
    }

}, {timestamps: true});
const patientModel = mongoose.model("Patient", patientSchema);
export default patientModel;
