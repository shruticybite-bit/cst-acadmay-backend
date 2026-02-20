import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Service from "../models/Service.js";

const router = express.Router();

/* ===============================
   MULTER MEMORY STORAGE
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
console.log("Cloudinary Config Check:", cloudinary.config());

/* ===============================
   Helper: Upload Buffer to Cloudinary
================================ */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "services" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ===============================
   ADD SERVICE
================================ */
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const service = await Service.create({
      ...req.body,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: service,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ===============================
   EDIT SERVICE
================================ */
router.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    let updateData = { ...req.body };

    if (req.file) {
      // Delete old image
      if (service.imagePublicId) {
        await cloudinary.uploader.destroy(service.imagePublicId);
      }

      const result = await uploadToCloudinary(req.file.buffer);

      updateData.imageUrl = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ===============================
   DELETE SERVICE
================================ */
router.delete("/delete/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Delete image from Cloudinary
    if (service.imagePublicId) {
      await cloudinary.uploader.destroy(service.imagePublicId);
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Service deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ===============================
   GET ALL SERVICES
================================ */
router.get("/list", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/blogs", async (req, res) => {
  const blogs = await Service.find({ type: "blog" });
  res.json(blogs);
});

router.get("/courses", async (req, res) => {
  const courses = await Service.find({ type: "course" });
  res.json(courses);
});

router.get("/articles", async (req, res) => {
  const articles = await Service.find({ type: "article" });
  res.json(articles);
});
/* ===============================
   GET SERVICE BY SLUG
================================ */
router.get("/detail/:slug", async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
/* ===============================
   GET SAME TYPE + CATEGORY LIST
================================ */
router.get("/by-type-category", async (req, res) => {
  try {
    const { type, category } = req.query;

    if (!type || !category) {
      return res.status(400).json({
        success: false,
        message: "Type and category are required"
      });
    }

    const services = await Service.find({
      type,
      category
    })
    .select("title excerpt imageUrl slug") // 👈 sirf ye fields
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: services.length,
      data: services
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
/* ===============================
   GET CATEGORY + EXCERPT (Navbar)
================================ */
router.get("/navbar-categories", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }

    const categories = await Service.aggregate([
      { $match: { type } }, // type filter
      {
        $group: {
          _id: "$category",
          excerpt: { $first: "$excerpt" }, // ek excerpt le lo
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          excerpt: 1,
        },
      },
      { $sort: { category: 1 } },
    ]);

    res.json({
      success: true,
      total: categories.length,
      data: categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
export default router;
