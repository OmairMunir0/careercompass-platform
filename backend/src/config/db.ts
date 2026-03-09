import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
console.log(MONGO_URI);

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
  }
}
