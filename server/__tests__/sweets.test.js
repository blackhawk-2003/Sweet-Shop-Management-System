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

    // Clean up all collections before sweets tests
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

describe("Sweets Endpoints", () => {
  // Clean up database before each test
  beforeEach(async () => {
    await Sweet.deleteMany({});
  });

  describe("POST /api/sweets", () => {
    it("should create a new sweet with valid data", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      };

      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty("sweet");
      expect(response.body.sweet.name).toBe(sweetData.name);
      expect(response.body.sweet.category).toBe(sweetData.category);
      expect(response.body.sweet.price).toBe(sweetData.price);
      expect(response.body.sweet.quantity).toBe(sweetData.quantity);
      expect(response.body.sweet).toHaveProperty("_id");
    });

    it("should not create sweet without authentication", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      };

      const response = await request(app)
        .post("/api/sweets")
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should not create sweet with missing required fields", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        // Missing category, price, quantity
      };

      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not create sweet with negative price", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: -5.99,
        quantity: 50,
      };

      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not create sweet with negative quantity", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: -10,
      };

      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not create sweet with duplicate name", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      };

      // Create first sweet
      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/sweets", () => {
    beforeEach(async () => {
      // Create test sweets
      const sweets = [
        { name: "Chocolate Bar", category: "Chocolate", price: 5.99, quantity: 50 },
        { name: "Gummy Bears", category: "Gummies", price: 3.99, quantity: 100 },
        { name: "Lollipop", category: "Hard Candy", price: 1.99, quantity: 75 },
      ];

      for (const sweet of sweets) {
        await new Sweet(sweet).save();
      }
    });

    it("should get all sweets", async () => {
      const response = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("sweets");
      expect(Array.isArray(response.body.sweets)).toBe(true);
      expect(response.body.sweets.length).toBe(3);
    });

    it("should not get sweets without authentication", async () => {
      const response = await request(app)
        .get("/api/sweets")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should return empty array when no sweets exist", async () => {
      await Sweet.deleteMany({});

      const response = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.sweets).toEqual([]);
    });
  });

  describe("GET /api/sweets/search", () => {
    beforeEach(async () => {
      const sweets = [
        { name: "Chocolate Bar", category: "Chocolate", price: 5.99, quantity: 50 },
        { name: "Dark Chocolate", category: "Chocolate", price: 6.99, quantity: 30 },
        { name: "Gummy Bears", category: "Gummies", price: 3.99, quantity: 100 },
        { name: "Lollipop", category: "Hard Candy", price: 1.99, quantity: 75 },
      ];

      for (const sweet of sweets) {
        await new Sweet(sweet).save();
      }
    });

    it("should search sweets by name", async () => {
      const response = await request(app)
        .get("/api/sweets/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ name: "Chocolate" })
        .expect(200);

      expect(response.body).toHaveProperty("sweets");
      expect(response.body.sweets.length).toBe(2);
      expect(response.body.sweets[0].name).toContain("Chocolate");
    });

    it("should search sweets by category", async () => {
      const response = await request(app)
        .get("/api/sweets/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ category: "Chocolate" })
        .expect(200);

      expect(response.body).toHaveProperty("sweets");
      expect(response.body.sweets.length).toBe(2);
      expect(response.body.sweets.every((s) => s.category === "Chocolate")).toBe(true);
    });

    it("should search sweets by price range", async () => {
      const response = await request(app)
        .get("/api/sweets/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ minPrice: 2, maxPrice: 5 })
        .expect(200);

      expect(response.body).toHaveProperty("sweets");
      expect(response.body.sweets.length).toBe(1);
      expect(response.body.sweets[0].name).toBe("Gummy Bears");
    });

    it("should search sweets with multiple filters", async () => {
      const response = await request(app)
        .get("/api/sweets/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ category: "Chocolate", minPrice: 5, maxPrice: 7 })
        .expect(200);

      expect(response.body).toHaveProperty("sweets");
      expect(response.body.sweets.length).toBe(2);
      expect(response.body.sweets.every((s) => s.category === "Chocolate")).toBe(true);
    });

    it("should not search without authentication", async () => {
      const response = await request(app)
        .get("/api/sweets/search")
        .query({ name: "Chocolate" })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/sweets/:id", () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = new Sweet({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      });
      await sweet.save();
      sweetId = sweet._id.toString();
    });

    it("should update sweet with valid data", async () => {
      const updateData = {
        name: "Premium Chocolate Bar",
        price: 7.99,
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("sweet");
      expect(response.body.sweet.name).toBe(updateData.name);
      expect(response.body.sweet.price).toBe(updateData.price);
      expect(response.body.sweet.category).toBe("Chocolate"); // Should remain unchanged
    });

    it("should not update sweet without authentication", async () => {
      const updateData = {
        name: "Premium Chocolate Bar",
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should not update non-existent sweet", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: "Premium Chocolate Bar",
      };

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should not update sweet with invalid price", async () => {
      const updateData = {
        price: -10,
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/sweets/:id", () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = new Sweet({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 50,
      });
      await sweet.save();
      sweetId = sweet._id.toString();
    });

    it("should delete sweet as admin", async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Sweet deleted successfully");

      // Verify sweet is deleted
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).toBeNull();
    });

    it("should not delete sweet as regular user", async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error", "Admin access required");

      // Verify sweet still exists
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).not.toBeNull();
    });

    it("should not delete sweet without authentication", async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should not delete non-existent sweet", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });
});

