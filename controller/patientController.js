import bloodBankModel from '../models/bloodbankModel.js';
import patientModel from '../models/patientModel.js';
import redisClient from '../utils/redisClient.js';

export const createPatient = async (req, res) => {
  try {
    const { name, bloodGroupType, phone,  age, medicalHistory, addmissiondate, urgency, hospital } = req.body;
    console.log('Patient creation attempt with data:', req.body);

    const existingPatient = await patientModel.findOne({ contact });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const newPatient = new patientModel({
      name,
      bloodGroupType,
      phone,
      age,
      medicalHistory,
      urgency,
      addmissiondate,
      hospital
    });

    await newPatient.save();
    await redisClient.del("all_patients");

    const groupKey = bloodGroupType.replace("+", "_Positive").replace("-", "_Negative");
    const updateResult = await bloodBankModel.updateOne(
      {},
      {
        $inc: { [`bloodStock.${groupKey}`]: -1 },
        $set: { lastUpdated: new Date() },
      }
    );

    if (updateResult.modifiedCount === 0) {
      console.log("Warning: Blood bank stock was not updated");
    }

    res.status(201).json({ message: 'Patient created successfully', patient: newPatient });
  } catch (error) {
    console.error('Error in createPatient:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const cached = await redisClient.get("all_patients");
    if (cached) {
      return res.status(200).json({ message: 'Patients retrieved successfully', patients: JSON.parse(cached) });
    }

    const patients = await patientModel.find();
    await redisClient.setEx("all_patients", 3600, JSON.stringify(patients));
    res.status(200).json({ message: 'Patients retrieved successfully', patients });
  } catch (error) {
    console.error('Error in getAllPatients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientModel.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient retrieved successfully', patient });
  } catch (error) {
    console.error('Error in getPatientById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bloodGroupType, contact, age, medicalHistory } = req.body;

    const patient = await patientModel.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.name = name || patient.name;
    patient.bloodGroupType = bloodGroupType || patient.bloodGroupType;
    patient.phone = phone || patient.phone;
    patient.age = age || patient.age;
    patient.medicalHistory = medicalHistory || patient.medicalHistory;

    await patient.save();
    await redisClient.del("all_patients");

    res.status(200).json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    console.error('Error in updatePatient:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientModel.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await redisClient.del("all_patients");

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error in deletePatient:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requestBlood = async (req, res) => {
  try {
    const { patientId, bloodGroupType, quantity } = req.body;

    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Custom logic for handling blood requests can go here
    res.status(200).json({ message: 'Blood request submitted successfully', patient });
  } catch (error) {
    console.error('Error in requestBlood:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
