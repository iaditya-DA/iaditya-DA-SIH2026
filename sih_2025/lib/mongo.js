import mongoose from 'mongoose';


const MONGO_URI = 'mongodb+srv://Gautam:jaiswani@imcoolthanyou.ovv6hm0.mongodb.net/?retryWrites=true&w=majority&appName=imcoolthanyou';


if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not set in environment variables");
}

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export default connectDB;

