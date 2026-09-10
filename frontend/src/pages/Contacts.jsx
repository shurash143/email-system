import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  UserRound,
  Mail,
  Phone,
  Building2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import API from "../services/api";
import "./Contacts.css";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const loadContacts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/contacts");

      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openAddForm = () => {
    setEditingContact(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    });

    setShowForm(true);
  };

  const openEditForm = (contact) => {
    setEditingContact(contact);

    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      notes: contact.notes || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingContact) {
        await API.patch(
          `/contacts/${editingContact._id}`,
          form
        );
      } else {
        await API.post("/contacts", form);
      }

      closeForm();
      loadContacts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save contact."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/contacts/${id}`);

      loadContacts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete contact."
      );
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const value = search.toLowerCase();

    return (
      contact.name?.toLowerCase().includes(value) ||
      contact.email?.toLowerCase().includes(value) ||
      contact.company?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="contacts-page">

      <div className="contacts-header">
        <div>
          <h1>Contacts</h1>
          <p>
            Manage your company's customers and business contacts.
          </p>
        </div>

        <button
          className="add-contact-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      <div className="contacts-toolbar">

        <div className="contacts-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="contacts-count">
          {filteredContacts.length} contact
          {filteredContacts.length !== 1 ? "s" : ""}
        </div>

      </div>

      {loading ? (
        <div className="contacts-empty">
          Loading contacts...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="contacts-empty">

          <div className="empty-icon">
            <UserRound size={28} />
          </div>

          <h3>No contacts found</h3>

          <p>
            Add your first customer or business contact.
          </p>

          <button
            className="add-contact-btn"
            onClick={openAddForm}
          >
            <Plus size={17} />
            Add Contact
          </button>

        </div>
      ) : (
        <div className="contacts-grid">

          {filteredContacts.map((contact) => (
            <div
              className="contact-card"
              key={contact._id}
            >

              <div className="contact-top">

                <div className="contact-avatar">
                  {contact.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="contact-name">
                  <h3>{contact.name}</h3>

                  {contact.company && (
                    <span>
                      {contact.company}
                    </span>
                  )}
                </div>

                <div className="contact-actions">

                  <button
                    onClick={() =>
                      openEditForm(contact)
                    }
                    title="Edit contact"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(contact._id)
                    }
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

              <div className="contact-details">

                <div>
                  <Mail size={15} />
                  <span>{contact.email}</span>
                </div>

                {contact.phone && (
                  <div>
                    <Phone size={15} />
                    <span>{contact.phone}</span>
                  </div>
                )}

                {contact.company && (
                  <div>
                    <Building2 size={15} />
                    <span>{contact.company}</span>
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

      {showForm && (
        <div className="contact-modal-overlay">

          <div className="contact-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingContact
                    ? "Edit Contact"
                    : "Add Contact"}
                </h2>

                <p>
                  Add business contact information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Full Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ahmed Hassan"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. ahmed@example.com"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254..."
                />
              </label>

              <label>
                Company
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </label>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional information..."
                  rows="3"
                />
              </label>

              <div className="modal-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-contact-btn"
                >
                  {editingContact
                    ? "Save Changes"
                    : "Add Contact"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}