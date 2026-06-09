import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`SocialSpark running on port ${PORT}`));
