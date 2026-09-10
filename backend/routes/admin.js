import express from "express";

import {
  dashboard,
  getEmployees,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/dashboard", dashboard);

router.get("/employees", getEmployees);

export default router;