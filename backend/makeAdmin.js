import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./src/models/User.js";

const email = process.argv[2];
if (!email) { console.log("Usage: node makeAdmin.js your@email.com"); process.exit(1); }

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
if (!user) console.log("User not found:", email);
else console.log(`Success! ${user.fullName} is now an admin.`);
await mongoose.disconnect();
