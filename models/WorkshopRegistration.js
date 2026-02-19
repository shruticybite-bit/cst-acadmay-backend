import mongoose from "mongoose";

const workshopRegistrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WorkshopRegistration = mongoose.model(
  "WorkshopRegistration",
  workshopRegistrationSchema
);

export default WorkshopRegistration;
