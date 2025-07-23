import bloodBankModel from "../models/bloodbankModel.js";

export const getBloodStock= async (req, res) => {
    try{
        const bloodBank = await bloodBankModel.findOne().select('bloodStock');
        if (!bloodBank) {
            return res.status(404).json({ message: 'Blood bank not found' });
        }
        res.status(200).json({ message: 'Blood stock retrieved successfully', bloodStock: bloodBank.bloodStock });
    }
    catch (error) {
        console.error('Error in getBloodStock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateBloodStock = async (req, res) => {
    try {
        const { bloodGroup, quantity } = req.body;
        if (!bloodGroup || !quantity) {
            return res.status(400).json({ message: 'Blood group and quantity are required' });
        }
        const bloodBank = await bloodBankModel.findOne();
        if (!bloodBank) {
            return res.status(404).json({ message: 'Blood bank not found' });
        }
        const existingStock = bloodBank.bloodStock[bloodGroup] || 0;
        bloodBank.bloodStock[bloodGroup] = existingStock + quantity;
        await bloodBank.save();
        if(quantity< 0 && Math.abs(quantity)> existingStock) {
             return res.status(400).json({ message: 'Not enough blood stock to reduce' });
        }
        res.status(200).json({ message: 'Blood stock updated successfully', bloodStock: bloodBank.bloodStock });
    } catch (error) {
        console.error('Error in updateBloodStock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const intitalizeBloodStock = async (req, res) => {
    try {
        // 🔍 Yeh structure hona chahiye request ka
        const { name, location, contact, bloodStock } = req.body;

        // 🧠 Validation
        if (!name || !location || !contact || !bloodStock || typeof bloodStock !== 'object') {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 🔁 Check if already initialized
        const existingBank = await bloodBankModel.findOne();
        if (existingBank) {
            return res.status(400).json({ message: 'Blood stock already initialized' });
        }

        // ✅ Create new entry
        const bloodBank = new bloodBankModel({
            name,
            location,
            contact,
            bloodStock
        });

        await bloodBank.save();

        res.status(201).json({
            message: 'Blood stock initialized successfully',
            bloodBank
        });

    } catch (error) {
        console.error('Error in intitalizeBloodStock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
