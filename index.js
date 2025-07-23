import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import redisClient from './utils/redisClient.js';
import cors from 'cors';
import bloodBankRoutes from './routes/bloodBankRoute.js';
import donorRoutes from './routes/donorRoute.js';
import patientRoutes from './routes/patientRoute.js';
import adminRoutes from './routes/adminRoute.js';
import { connectToDB } from './connection/connection.js';
import morgan from "morgan"

dotenv.config();

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://localhost:3000",
      "https://frontend-me.vercel.app"
    ],
    credentials: true,
  })
);

app.use('/api/bloodbank', bloodBankRoutes);
app.use('/api/v1', donorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);

connectToDB();

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
  });
}

export default app;
