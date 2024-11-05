import dotenv from "dotenv";
dotenv.config();
console.log(dotenv.config());

import mongoose from "mongoose";

const MONGODBURI = process.env.MONGODB_URI;

console.log("MONGODB_URI", process.env.MONGODB_URI);
console.log("MONGODBURI", MONGODBURI);

if (!MONGODBURI) {
  console.error("Error: MONGODB_URI is not defined in .env file.");
  process.exit(1); // Exit the process if the connection string is missing
}

console.log("Connecting to MongoDB...");

const db = async (): Promise<typeof mongoose.connection> => {
  try {
    await mongoose.connect(MONGODBURI);
    console.log("Database connected successfully.");
    return mongoose.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed.");
  }
};

export default db;
