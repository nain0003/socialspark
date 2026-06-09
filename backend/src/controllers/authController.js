import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: "All fields are required." });
  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "An account with that email already exists." });
    const allowedRole = ["user","business"].includes(role) ? role : "user";
    const user = await User.create({ fullName, email, password, role: allowedRole });
    res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });
    res.json({
      token: signToken(user._id),
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
};

export const getProfile = async (req, res) => {
  res.json({ id: req.user._id, fullName: req.user.fullName, email: req.user.email, role: req.user.role });
};
