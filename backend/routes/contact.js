import express from "express";

import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;