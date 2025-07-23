import donorModel from '../models/donorModel.js';
import bloodBankModel from '../models/bloodbankModel.js';
import sharp from 'sharp';
import fs from 'fs';
import redisClient from '../utils/redisClient.js';

export const registerDonor = async (req, res) => {
  try {
    const { name, bloodGroup, lastDonation, contact, email,  age, status } = req.body;
    if (!name || !bloodGroup || !lastDonation || !contact || !email ||!age||!status) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    // const image = sharp(req.file.path);
    // const metadata = await image.metadata();
    // const resizePath = `uploads/${Date.now()}-resized-${req.file.originalname}`;
    // await sharp(req.file.path).resize(300, 300).toFile(resizePath);
    // fs.unlinkSync(req.file.path);

    const existingDonor = await donorModel.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({ message: 'Donor already exists' });
    }

    const newDonor = new donorModel({
      name,
      bloodGroup,
      lastDonation,
      contact,
      email,
      age,
      status
    });

    await newDonor.save();
    await redisClient.del("all_donors");

    const groupKey = bloodGroup.replace("+", "_Positive").replace("-", "_Negative");
    const updateResult = await bloodBankModel.updateOne(
      {},
      {
        $inc: { [`bloodStock.${groupKey}`]: 1 },
        $set: { lastUpdated: new Date() },
      }
    );

    res.status(201).json({ message: 'Donor created successfully', donor: newDonor });
  } catch (error) {
    console.error('Error in createDonor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllDonors = async (req, res) => {
  try {
    const cached = await redisClient.get("all_donors");
    if (cached) {
      return res.status(200).json({ message: 'Donors retrieved successfully', donors: JSON.parse(cached) });
    }

    const donors = await donorModel.find();
    await redisClient.setEx("all_donors", 3600, JSON.stringify(donors));
    res.status(200).json({ message: 'Donors retrieved successfully', donors });
  } catch (error) {
    console.error('Error in getAllDonors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDonorbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await donorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.status(200).json({ message: 'Donor retrieved successfully', donor });
  } catch (error) {
    console.error('Error in getDonorbyId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bloodGroup, lastDonation, contact, address, age, status} = req.body;
    const donor = await donorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.name = name || donor.name;
    donor.bloodGroup = bloodGroup || donor.bloodGroup;
    donor.lastDonation = lastDonation || donor.lastDonation;
    donor.contact = contact || donor.contact;
    donor.age = age || donor.age;
    donor.status= status|| donor.status;

    await donor.save();
    await redisClient.del("all_donors");

    res.status(200).json({ message: 'Donor updated successfully', donor });
  } catch (error) {
    console.error('Error in updateDonor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await donorModel.findByIdAndDelete(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    await redisClient.del("all_donors");

    res.status(200).json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDonor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addDonationRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { donationDate } = req.body;
    const donor = await donorModel.findById(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.lastDonation = donationDate || donor.lastDonation;
    await donor.save();
    await redisClient.del("all_donors");

    res.status(200).json({ message: 'Donation record added successfully', donor });
  } catch (error) {
    console.error('Error in addDonationRecord:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
