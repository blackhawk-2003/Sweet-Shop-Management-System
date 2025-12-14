import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware - CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

// Log allowed origins for debugging
console.log("Allowed CORS origins:", allowedOrigins);
console.log("FRONTEND_URL from env:", process.env.FRONTEND_URL);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Normalize origins for comparison (remove trailing slashes, convert to lowercase)
    const normalizeOrigin = (url) => {
      if (!url) return "";
      return url.toLowerCase().replace(/\/$/, "");
    };

    const normalizedOrigin = normalizeOrigin(origin);

    // Check if origin exactly matches any allowed origin
    const exactMatch = allowedOrigins.some((allowed) => {
      return normalizeOrigin(allowed) === normalizedOrigin;
    });

    if (exactMatch) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
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
import sweetsRoutes from "./routes/sweets.js";
import { authenticate } from "./middleware/auth.js";

app.use("/api/auth", authRoutes);
app.use("/api/sweets", authenticate, sweetsRoutes);

app.get("/", (req, res) => {
  res.send("Sweet Shop Management System API");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
