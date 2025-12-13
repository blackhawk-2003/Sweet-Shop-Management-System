import express from "express";
import Sweet from "../models/Sweet.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/sweets - Add a new sweet
router.post("/", async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    // Validation
    if (!name || !category || price === undefined || quantity === undefined) {
      return res
        .status(400)
        .json({ error: "Name, category, price, and quantity are required" });
    }

    if (price < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    // Create new sweet
    const sweet = new Sweet({ name, category, price, quantity });
    await sweet.save();

    res.status(201).json({
      message: "Sweet created successfully",
      sweet,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Sweet with this name already exists" });
    }
    console.error("Create sweet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sweets - View a list of all available sweets
router.get("/", async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });

    res.status(200).json({
      sweets,
    });
  } catch (error) {
    console.error("Get sweets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sweets/search - Search for sweets by name, category, or price range
router.get("/search", async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query = {};

    // Search by name (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // Search by category
    if (category) {
      query.category = category;
    }

    // Search by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      sweets,
    });
  } catch (error) {
    console.error("Search sweets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sweets/:id/purchase - Purchase a sweet, decreasing its quantity
router.post("/:id/purchase", async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseQuantity = req.body?.quantity ?? 1;

    // Validation
    if (purchaseQuantity <= 0) {
      return res
        .status(400)
        .json({ error: "Purchase quantity must be greater than 0" });
    }

    if (!Number.isInteger(purchaseQuantity)) {
      return res
        .status(400)
        .json({ error: "Purchase quantity must be an integer" });
    }

    // Find the sweet
    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    // Check if sweet is in stock
    if (sweet.quantity === 0) {
      return res.status(400).json({ error: "Sweet is out of stock" });
    }

    // Check if sufficient quantity is available
    if (sweet.quantity < purchaseQuantity) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${sweet.quantity}, Requested: ${purchaseQuantity}`,
      });
    }

    // Decrease quantity
    sweet.quantity -= purchaseQuantity;
    await sweet.save();

    res.status(200).json({
      message: "Purchase successful",
      sweet,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid sweet ID" });
    }
    console.error("Purchase sweet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sweets/:id/restock - Restock a sweet, increasing its quantity (Admin only)
router.post("/:id/restock", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity: restockQuantity } = req.body;

    // Validation
    if (!restockQuantity || restockQuantity <= 0) {
      return res.status(400).json({
        error: "Restock quantity is required and must be greater than 0",
      });
    }

    if (!Number.isInteger(restockQuantity)) {
      return res
        .status(400)
        .json({ error: "Restock quantity must be an integer" });
    }

    // Find the sweet
    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    // Increase quantity
    sweet.quantity += restockQuantity;
    await sweet.save();

    res.status(200).json({
      message: "Restock successful",
      sweet,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid sweet ID" });
    }
    console.error("Restock sweet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/sweets/:id - Update a sweet's details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    // Validation for price if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // Validation for quantity if provided
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    res.status(200).json({
      message: "Sweet updated successfully",
      sweet,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Sweet with this name already exists" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid sweet ID" });
    }
    console.error("Update sweet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/sweets/:id - Delete a sweet (Admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    res.status(200).json({
      message: "Sweet deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid sweet ID" });
    }
    console.error("Delete sweet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
