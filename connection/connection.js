import mongoose from 'mongoose';

export const connectToDB = async () => {
    // if (process.env.NODE_ENV === "test") return; 
   mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'bloodBank',
    })
    .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
    })
    .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
    });
}