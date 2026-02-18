import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { firstName, email, phone, service, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newContact = new Contact({ firstName, email, phone, service, message });
    await newContact.save();

    res.status(201).json({ success: true, message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving data" });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching contacts" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting contact" });
  }
});

export default router;
