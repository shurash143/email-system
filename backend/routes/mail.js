import express from "express";

import {
  getMail,
  getMailById,
  toggleStar,
  moveMail,
  sendMail,
  saveDraft,
} from "../controllers/mailController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getMail);

router.get("/:id", getMailById);

router.patch("/:id/star", toggleStar);

router.patch("/:id/move", moveMail);

router.post("/send", sendMail);

router.post("/draft", saveDraft);

export default router;