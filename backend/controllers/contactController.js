import Contact from "../models/Contact.js";

export async function getContacts(req, res) {
  try {
    const contacts = await Contact.find({
      owner: req.user._id,
    }).sort({ name: 1 });

    res.json({
      contacts,
      count: contacts.length,
    });
  } catch (error) {
    console.error("Get contacts error:", error);

    res.status(500).json({
      message: "Failed to load contacts.",
    });
  }
}

export async function getContactById(req, res) {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found.",
      });
    }

    res.json(contact);
  } catch (error) {
    console.error("Get contact error:", error);

    res.status(500).json({
      message: "Failed to load contact.",
    });
  }
}

export async function createContact(req, res) {
  try {
    const {
      name,
      email,
      phone,
      company,
      notes,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    const existing = await Contact.findOne({
      email: email.toLowerCase().trim(),
      owner: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        message: "This contact already exists.",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      notes,
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Contact created successfully.",
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);

    res.status(500).json({
      message: "Failed to create contact.",
    });
  }
}

export async function updateContact(req, res) {
  try {
    const {
      name,
      email,
      phone,
      company,
      notes,
    } = req.body;

    const contact = await Contact.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found.",
      });
    }

    contact.name = name ?? contact.name;
    contact.email = email ?? contact.email;
    contact.phone = phone ?? contact.phone;
    contact.company = company ?? contact.company;
    contact.notes = notes ?? contact.notes;

    await contact.save();

    res.json({
      message: "Contact updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    res.status(500).json({
      message: "Failed to update contact.",
    });
  }
}

export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found.",
      });
    }

    res.json({
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact error:", error);

    res.status(500).json({
      message: "Failed to delete contact.",
    });
  }
}