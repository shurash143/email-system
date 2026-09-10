import express from "express";

import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updateNotifications,
  changePassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// =========================================================
// AUTH
// =========================================================

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.post("/logout", logout);

// =========================================================
// SETTINGS
// =========================================================

router.put(
  "/settings/profile",
  protect,
  updateProfile
);

router.put(
  "/settings/notifications",
  protect,
  updateNotifications
);

router.put(
  "/settings/password",
  protect,
  changePassword
);

export default router;