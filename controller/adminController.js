import adminModel from '../models/adminModel.js';
import { generateAcessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await adminModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new admin
    const newAdmin = new adminModel({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      address,
      isAdmin: true, // Make sure isAdmin flag is set
    });

    await newAdmin.save();

    // Generate tokens
    const accessToken = generateAcessToken(newAdmin);
    const refreshToken = generateRefreshToken(newAdmin);

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await adminModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAcessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: 'Admin login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, email, phone, address } = req.body;

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;
    admin.address = address || admin.address;

    await admin.save();
    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    await adminModel.findByIdAndDelete(adminId);
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = [
      { label: 'Total Donors', value: 120 },
      { label: 'Total Patients', value: 75 },
      { label: 'Total Requests', value: 30 },
      { label: 'Available Units', value: 500 },
    ];

    const recentActivities = [
      { message: 'Donor John registered', time: '2 minutes ago' },
      { message: 'Patient Sarah received blood', time: '10 minutes ago' },
    ];

    const bloodAvailability = [
      { type: 'A+', units: 50, status: 'Good' },
      { type: 'O+', units: 30, status: 'Medium' },
      { type: 'B+', units: 10, status: 'Low' },
      { type: 'AB-', units: 5, status: 'Critical' },
    ];

    res.json({ stats, recentActivities, bloodAvailability });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = admin.generateResetToken();
    await admin.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await sendEmail({
      to: admin.email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: 'Password reset token sent to email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, newPassword } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({ message: 'Token, email, and new password are required' });
    }

    const admin = await adminModel.findOne({
      email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    admin.password = newPassword;
    admin.resetToken = null;
    admin.resetTokenExpiration = null;

    await admin.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAcessToken(decoded._id, decoded.email, 'admin');
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
