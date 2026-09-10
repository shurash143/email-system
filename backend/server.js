import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import mailRoutes from "./routes/mail.js";
import adminRoutes from "./routes/admin.js";
import contactRoutes from "./routes/contact.js";

import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// =========================================================
// TEST ROUTE — REGISTER THIS FIRST
// =========================================================

app.get("/api/health", (req, res) => {
  console.log("HEALTH REQUEST RECEIVED");

  return res.status(200).json({
    ok: true,
    service: "CargoMail Backend",
    message: "Backend is working",
    time: new Date().toISOString(),
  });
});

// =========================================================
// BASIC MIDDLEWARE
// =========================================================

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

// =========================================================
// REQUEST LOGGER
// =========================================================

app.use((req, res, next) => {
  console.log(
    `REQUEST: ${req.method} ${req.originalUrl}`
  );

  next();
});

// =========================================================
// COMPANY
// =========================================================

app.get("/api/company", (req, res) => {
  return res.json({
    name:
      process.env.COMPANY_NAME ||
      "Cargo Company",

    groupEmail:
      process.env.GROUP_EMAIL ||
      "info@cargocompany.com",

    logo: null,
  });
});

// =========================================================
// AUTH
// =========================================================

app.use("/api/auth", authRoutes);

// =========================================================
// MAIL
// =========================================================

app.use("/api/mail", mailRoutes);

// =========================================================
// ADMIN
// =========================================================

app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes);
// =========================================================
// 404
// =========================================================

app.use((req, res) => {
  console.log(
    `404: ${req.method} ${req.originalUrl}`
  );

  return res.status(404).json({
    message: "API route not found.",
    path: req.originalUrl,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message:
      err.message || "Internal server error.",
  });
});

// =========================================================
// CREATE ADMIN
// =========================================================

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "ADMIN_EMAIL or ADMIN_PASSWORD is missing."
    );

    return;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingAdmin =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingAdmin) {
    console.log(
      `Admin account already exists: ${normalizedEmail}`
    );

    return;
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  await User.create({
    name:
      process.env.ADMIN_NAME ||
      "System Administrator",

    email: normalizedEmail,

    password: hashedPassword,

    role: "admin",

    department: "Administration",

    position: "System Administrator",

    active: true,
  });

  console.log(
    `Admin account created: ${normalizedEmail}`
  );
}

// =========================================================
// START SERVER
// =========================================================

async function startServer() {
  try {
    console.log(
      "=========================================="
    );
    console.log("Starting CargoMail backend...");
    console.log(
      "=========================================="
    );

    // -----------------------------------------------------
    // ENVIRONMENT
    // -----------------------------------------------------

    if (!process.env.MONGODB_URL) {
      throw new Error(
        "MONGODB_URL is missing from .env"
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing from .env"
      );
    }

    // -----------------------------------------------------
    // START HTTP SERVER FIRST
    // -----------------------------------------------------

    app.listen(PORT, () => {
      console.log(
        `CargoMail server listening on http://localhost:${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );
    });

    // -----------------------------------------------------
    // DATABASE
    // -----------------------------------------------------

    console.log("Connecting to MongoDB...");

    await mongoose.connect(
      process.env.MONGODB_URL,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "MongoDB connected successfully."
    );

    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    await createAdmin();

    console.log(
      "CargoMail backend initialization complete."
    );
  } catch (error) {
    console.error(
      "BACKEND STARTUP ERROR:",
      error
    );
  }
}

startServer();