import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";
import sweetsRoutes from "../routes/sweets.js";
import User from "../models/User.js";
import Sweet from "../models/Sweet.js";
import { authenticate } from "../middleware/auth.js";

dotenv.config();

// Create a test app instance
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/sweets", authenticate, sweetsRoutes);

// Connect to test database
const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;

let authToken;
let adminToken;
let testUserId;

beforeAll(async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI_TEST);
      console.log("Connected to test database");
    } else if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    // Clean up all collections before inventory tests
    await User.deleteMany({});
    await Sweet.deleteMany({});

    // Create a regular user for testing
    const user = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "user",
    });
    await user.save();
    testUserId = user._id;

    // Create an admin user for testing
    const admin = new User({
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    await admin.save();

    // Get auth tokens
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    authToken = userLogin.body.token;

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.token;
  } catch (error) {
    console.error("Test setup error:", error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Inventory Endpoints", () => {
  // Clean up sweets before each test
  beforeEach(async () => {
    await Sweet.deleteMany({});
  });

  describe("POST /api/sweets/:id/purchase", () => {
    let sweetId;

    beforeEach(async () => {
      // Create a sweet with quantity for purchase tests
      const sweet = new Sweet({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      });
      await sweet.save();
      sweetId = sweet._id.toString();
    });

    it("should purchase a sweet and decrease quantity by 1", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Purchase successful");
      expect(response.body).toHaveProperty("sweet");
      expect(response.body.sweet.quantity).toBe(49);

      // Verify quantity was updated in database
      const updatedSweet = await Sweet.findById(sweetId);
      expect(updatedSweet.quantity).toBe(49);
    });

    it("should purchase a sweet with custom quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.sweet.quantity).toBe(45);

      // Verify quantity was updated in database
      const updatedSweet = await Sweet.findById(sweetId);
      expect(updatedSweet.quantity).toBe(45);
    });

    it("should not purchase sweet without authentication", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .expect(401);

      expect(response.body).toHaveProperty("error");

      // Verify quantity was not changed
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it("should not purchase more than available quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: 100 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.toLowerCase()).toContain("insufficient");

      // Verify quantity was not changed
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(50);
    });

    it("should not purchase sweet with zero quantity", async () => {
      // Set quantity to 0
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("out of stock");
    });

    it("should not purchase non-existent sweet", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should not allow negative purchase quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not allow zero purchase quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/sweets/:id/restock", () => {
    let sweetId;

    beforeEach(async () => {
      // Create a sweet for restock tests
      const sweet = new Sweet({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 10,
      });
      await sweet.save();
      sweetId = sweet._id.toString();
    });

    it("should restock a sweet as admin and increase quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Restock successful");
      expect(response.body).toHaveProperty("sweet");
      expect(response.body.sweet.quantity).toBe(30);

      // Verify quantity was updated in database
      const updatedSweet = await Sweet.findById(sweetId);
      expect(updatedSweet.quantity).toBe(30);
    });

    it("should not restock sweet without authentication", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 20 })
        .expect(401);

      expect(response.body).toHaveProperty("error");

      // Verify quantity was not changed
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(10);
    });

    it("should not restock sweet as regular user (admin only)", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: 20 })
        .expect(403);

      expect(response.body).toHaveProperty("error", "Admin access required");

      // Verify quantity was not changed
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(10);
    });

    it("should not restock non-existent sweet", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 20 })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should not restock with negative quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: -10 })
        .expect(400);

      expect(response.body).toHaveProperty("error");

      // Verify quantity was not changed
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(10);
    });

    it("should not restock with zero quantity", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should require quantity field for restock", async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});

