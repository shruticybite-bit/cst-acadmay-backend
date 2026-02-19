import express from "express";
import WorkshopRegistration from "../models/WorkshopRegistration.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name and Email are required",
      });
    }

    // 🔥 Check if already registered
    const existingUser = await WorkshopRegistration.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this workshop.",
      });
    }

    const newRegistration = new WorkshopRegistration({
      firstName,
      lastName,
      phone,
      email,
    });

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "Workshop registration successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// =========================
// ✅ GET ALL REGISTRATIONS
// =========================
router.get("/", async (req, res) => {
  try {
    const registrations = await WorkshopRegistration
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// ✅ DELETE BY ID
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await WorkshopRegistration.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
export default router;
