import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================================================
// PROTECT AUTHENTICATED ROUTES
// =========================================================

export async function protect(req, res, next) {
  try {
    console.log("AUTH: checking session...");

    const token = req.cookies?.token;

    if (!token) {
      console.log("AUTH: no token cookie found");

      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    console.log("AUTH: token cookie found");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "AUTH: token verified:",
      decoded.id
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      console.log("AUTH: user not found");

      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    if (user.active === false) {
      console.log("AUTH: user inactive");

      return res.status(403).json({
        message: "Account is inactive.",
      });
    }

    req.user = user;

    console.log(
      "AUTH: authenticated:",
      user.email
    );

    next();
  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired authentication.",
    });
  }
}

// =========================================================
// ADMIN ONLY
// =========================================================

export function adminOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "ADMIN AUTH ERROR:",
      error.message
    );

    return res.status(403).json({
      message: "Admin access denied.",
    });
  }
}