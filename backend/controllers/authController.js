import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =========================================================
// CREATE JWT
// =========================================================

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// =========================================================
// AUTH COOKIE
// =========================================================

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// =========================================================
// REGISTER
// =========================================================

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      department,
      position,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department: department || "",
      position: position || "",
      role: "employee",
    });

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Failed to create account.",
    });
  }
}

// =========================================================
// LOGIN
// =========================================================

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Your account is inactive.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
}

// =========================================================
// GET CURRENT USER
// =========================================================

export async function getMe(req, res) {
  return res.json({
    user: req.user,
  });
}

// =========================================================
// LOGOUT
// =========================================================

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.json({
    message: "Logged out successfully.",
  });
}

// =========================================================
// UPDATE PROFILE
// PUT /api/auth/settings/profile
// =========================================================

export async function updateProfile(req, res) {
  try {
    const userId = req.user._id;

    const {
      name,
      email,
      department,
      position,
      avatar,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email cannot be empty.",
        });
      }

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: { $ne: userId },
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Another account already uses this email.",
        });
      }

      user.email = normalizedEmail;
    }

    if (department !== undefined) {
      user.department = department;
    }

    if (position !== undefined) {
      user.position = position;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update profile.",
    });
  }
}

// =========================================================
// UPDATE NOTIFICATIONS
// PUT /api/auth/settings/notifications
// =========================================================

export async function updateNotifications(
  req,
  res
) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const {
      emailNotifications,
      newMailNotifications,
      messageNotifications,
      browserNotifications,
    } = req.body;

    /*
      Only update fields that were actually sent.
      This keeps the function compatible with
      different settings-page field names.
    */

    if (
      emailNotifications !== undefined
    ) {
      user.emailNotifications =
        Boolean(emailNotifications);
    }

    if (
      newMailNotifications !== undefined
    ) {
      user.newMailNotifications =
        Boolean(newMailNotifications);
    }

    if (
      messageNotifications !== undefined
    ) {
      user.messageNotifications =
        Boolean(messageNotifications);
    }

    if (
      browserNotifications !== undefined
    ) {
      user.browserNotifications =
        Boolean(browserNotifications);
    }

    await user.save();

    return res.json({
      message:
        "Notification settings updated successfully.",
      user: {
        id: user._id,
        emailNotifications:
          user.emailNotifications,
        newMailNotifications:
          user.newMailNotifications,
        messageNotifications:
          user.messageNotifications,
        browserNotifications:
          user.browserNotifications,
      },
    });
  } catch (error) {
    console.error(
      "Update notifications error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update notification settings.",
    });
  }
}

// =========================================================
// CHANGE PASSWORD
// PUT /api/auth/settings/password
// =========================================================

export async function changePassword(
  req,
  res
) {
  try {
    const userId = req.user._id;

    const {
      currentPassword,
      newPassword,
      password,
    } = req.body;

    // Support either newPassword or password
    const newPasswordValue =
      newPassword || password;

    if (
      !currentPassword ||
      !newPasswordValue
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required.",
      });
    }

    if (newPasswordValue.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    const samePassword =
      await bcrypt.compare(
        newPasswordValue,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          "New password must be different from your current password.",
      });
    }

    user.password =
      await bcrypt.hash(
        newPasswordValue,
        12
      );

    await user.save();

    return res.json({
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
}