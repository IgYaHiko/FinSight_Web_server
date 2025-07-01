// routes/authRoutes.js
import express from 'express';
import { getUser, loginUser, registerUser, updateProfileDetails, updateProfileImage } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleWare.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", loginUser);
router.get("/getUser", protect, getUser);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(404).json({ message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(200).json({ imageUrl }); // ✅ Important: "imageUrl"
});


router.put("/update-image",protect,updateProfileImage);
router.put("/update-profile", protect, updateProfileDetails);

export default router;
