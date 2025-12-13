import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";
import User from "../models/User.js";
import Sweet from "../models/Sweet.js";

dotenv.config();

// Create a test app instance
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Connect to test database
const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;

beforeAll(async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI_TEST);
      console.log("Connected to test database");
    } else if (mongoose.connection.readyState !== 1) {
      // If connecting, wait for it
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }
    // Clean up all collections before auth tests
    await User.deleteMany({});
    await Sweet.deleteMany({});
  } catch (error) {
    console.error("Failed to connect to test database:", error.message);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Endpoints", () => {
  // Clean up database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid credentials", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      // Register first user
      await request(app).post("/api/auth/register").send(userData);

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not register user with missing fields", async () => {
      const userData = {
        username: "testuser",
        // Missing email and password
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not register user with invalid email format", async () => {
      const userData = {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should hash password before saving", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await request(app).post("/api/auth/register").send(userData);

      const user = await User.findOne({ email: userData.email }).select(
        "+password"
      );
      expect(user).not.toBeNull();
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hashed passwords are long
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register a user before login tests
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/register").send(userData);
    });

    it("should login user with correct credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should not login user with incorrect password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).not.toHaveProperty("token");
    });

    it("should not login user with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should not login user with missing fields", async () => {
      const loginData = {
        email: "test@example.com",
        // Missing password
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
