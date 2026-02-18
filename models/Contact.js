import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  firstName: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;   // ✅ IMPORTANT
