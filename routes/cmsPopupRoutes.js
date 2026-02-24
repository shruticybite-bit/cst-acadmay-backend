import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import CmsPopup from "../models/CmsPopup.js";

const router = express.Router();

/* ===============================
   MULTER MEMORY STORAGE
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ===============================
   Upload Buffer to Cloudinary
================================ */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "cms_popup" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ===============================
   CREATE / UPDATE CMS
================================ */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, hours, minutes, seconds, enabled } = req.body;

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    let existing = await CmsPopup.findOne();

    if (existing) {
      existing.title = title;
      existing.description = description;
      existing.hours = hours;
      existing.minutes = minutes;
      existing.seconds = seconds;
      existing.enabled = enabled;

      if (imageUrl) {
        if (existing.imagePublicId) {
          await cloudinary.uploader.destroy(existing.imagePublicId);
        }
        existing.image = imageUrl;
        existing.imagePublicId = imagePublicId;
      }

      await existing.save();

      return res.json({
        success: true,
        message: "CMS Updated",
        data: existing,
      });
    }

    const cms = await CmsPopup.create({
      title,
      description,
      image: imageUrl,
      imagePublicId,
      hours,
      minutes,
      seconds,
      enabled,
    });

    res.json({
      success: true,
      message: "CMS Created",
      data: cms,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ===============================
   GET CMS
================================ */
router.get("/", async (req, res) => {
  try {
    const cms = await CmsPopup.findOne();
    res.json({ success: true, data: cms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;