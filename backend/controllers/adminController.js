import User from "../models/User.js";
import Mail from "../models/Mail.js";

export async function dashboard(req, res) {
  try {
    const [
      employees,
      totalEmails,
      inbox,
      sent,
      drafts,
      unread,
    ] = await Promise.all([
      User.countDocuments({
        role: "employee",
        active: true,
      }),

      Mail.countDocuments({
        owner: req.user._id,
      }),

      Mail.countDocuments({
        owner: req.user._id,
        folder: "inbox",
      }),

      Mail.countDocuments({
        owner: req.user._id,
        folder: "sent",
      }),

      Mail.countDocuments({
        owner: req.user._id,
        folder: "drafts",
      }),

      Mail.countDocuments({
        owner: req.user._id,
        read: false,
      }),
    ]);

    res.json({
      employees,
      totalEmails,
      inbox,
      sent,
      drafts,
      unread,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load dashboard statistics.",
    });
  }
}

export async function getEmployees(req, res) {
  try {
    const employees = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      employees,
    });
  } catch (error) {
    console.error(
      "Get employees error:",
      error
    );

    res.status(500).json({
      message: "Failed to load employees.",
    });
  }
}