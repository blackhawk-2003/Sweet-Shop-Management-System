import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Normalize email to lowercase (since User schema has lowercase: true)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    // Create new user
    const isAdmin = normalizedEmail === process.env.ADMIN_EMAIL;

    const user = new User({
      username: username.trim(),
      email: normalizedEmail,
      password: password.trim(),
      role: isAdmin ? "admin" : "user",
    });
    await user.save();

    // Generate token for automatic login after registration
    const token = generateToken(user);

    console.log(`User registered successfully: ${user.email}`);
    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `User with this ${field} already exists`,
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalize email to lowercase (since User schema has lowercase: true)
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    // Find user (include password for comparison)
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!user) {
      console.log(`Login failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Debug: Check if user has a password field
    if (!user.password) {
      console.log(
        `Login failed: User password field is missing for email: ${normalizedEmail}`
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    let isPasswordValid;
    try {
      isPasswordValid = await user.comparePassword(trimmedPassword);
      console.log(
        `Password comparison result for ${normalizedEmail}: ${isPasswordValid}`
      );
    } catch (compareError) {
      console.error(
        `Password comparison error for ${normalizedEmail}:`,
        compareError
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!isPasswordValid) {
      console.log(
        `Login failed: Invalid password for email: ${normalizedEmail}. Password comparison returned false.`
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    console.log(`Login successful for user: ${user.email}`);
    res.status(200).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
