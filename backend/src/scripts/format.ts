// src/db/format.ts
import "dotenv/config";
import mongoose from "mongoose";

(async () => {
  const MONGO_URI = process.env.MONGO_URI || "";
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI in environment.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(MONGO_URI);

    const db = connection.connection.db;
    if (!db) throw new Error("MongoDB connection failed (db undefined).");

    const collections = await db.collections();

    if (collections.length === 0) {
      console.log("No collections found. Database already empty.");
    } else {
      console.log("Clearing all collections...");
      for (const collection of collections) {
        await collection.drop().catch((err) => {
          if (err.message.includes("ns not found")) return;
          throw err;
        });
        console.log(`Dropped ${collection.collectionName}`);
      }
    }

    console.log("Database format complete.");
  } catch (err) {
    console.error("Format failed:", err);
  } finally {
    await mongoose.disconnect();
  }
})();
