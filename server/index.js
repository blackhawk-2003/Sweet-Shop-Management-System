import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB (non-blocking for server startup)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    // Server will continue to run even if MongoDB connection fails
    // This is useful for development/testing
  });

// Routes
import authRoutes from "./routes/auth.js";

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Sweet Shop Management System API");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
