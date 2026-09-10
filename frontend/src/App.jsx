import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LogOut } from "lucide-react";

import API from "./services/api";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ComposeModal from "./components/ComposeModal";

import Login from "./pages/Login";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import SimpleFolder from "./pages/SimpleFolder";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // AUTH
  // =========================================================

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // =========================================================
  // UI
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  // =========================================================
  // EMAILS
  // =========================================================

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // ADMIN
  // =========================================================

  const [stats, setStats] = useState(null);

  // =========================================================
  // CHECK AUTHENTICATION
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        console.log("Checking authentication...");

        const response = await API.get("/auth/me", {
          timeout: 5000,
        });

        console.log("Auth response:", response.data);

        if (!mounted) return;

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (!mounted) return;

        setUser(null);
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // AUTH STATUS
  // =========================================================

  const isLoggedIn = Boolean(user);

  // =========================================================
  // CURRENT FOLDER
  // =========================================================

  const getFolder = () => {
    switch (location.pathname) {
      case "/":
        return "inbox";

      case "/sent":
        return "sent";

      case "/drafts":
        return "drafts";

      case "/starred":
        return "starred";

      case "/archive":
        return "archive";

      case "/trash":
        return "trash";

      default:
        return "inbox";
    }
  };

  const folder = getFolder();

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setEmails([]);
    setStats(null);
    setComposeOpen(false);
    setSearch("");
    setSidebarOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // LOAD EMAILS
  // =========================================================

  const loadEmails = async () => {
    if (!isLoggedIn) {
      return;
    }

    setLoading(true);

    try {
      let response;

      if (folder === "starred") {
        response = await API.get("/mail", {
          params: {
            starred: true,
            q: search.trim(),
          },
        });
      } else {
        response = await API.get("/mail", {
          params: {
            folder,
            q: search.trim(),
          },
        });
      }

      const messages =
        response.data?.messages ||
        response.data ||
        [];

      setEmails(
        Array.isArray(messages)
          ? messages
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load emails:",
        error
      );

      if (error.response?.status === 401) {
        setUser(null);
        setEmails([]);

        navigate("/login", {
          replace: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD EMAILS WHEN PAGE / SEARCH CHANGES
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const excludedPages = [
      "/profile",
      "/contacts",
      "/settings",
      "/admin",
      "/compose",
    ];

    if (
      excludedPages.includes(
        location.pathname
      )
    ) {
      return;
    }

    loadEmails();
  }, [
    location.pathname,
    search,
    isLoggedIn,
  ]);

  // =========================================================
  // LOAD ADMIN STATS
  // =========================================================

  const loadStats = async () => {
    if (!isLoggedIn) {
      return;
    }

    if (user?.role !== "admin") {
      return;
    }

    try {
      const response = await API.get(
        "/admin/dashboard"
      );

      setStats(response.data);
    } catch (error) {
      console.error(
        "Failed to load admin statistics:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setUser(null);

        navigate("/login", {
          replace: true,
        });
      }
    }
  };

  useEffect(() => {
    if (
      isLoggedIn &&
      user?.role === "admin" &&
      location.pathname === "/admin"
    ) {
      loadStats();
    }
  }, [
    location.pathname,
    isLoggedIn,
    user,
  ]);

  // =========================================================
  // LOGIN SUCCESS
  // =========================================================

  const login = (loggedInUser) => {
    setUser(loggedInUser);
    setSidebarOpen(false);
    setSearch("");

    navigate("/", {
      replace: true,
    });
  };

  // =========================================================
  // COMPOSE
  // =========================================================

  const openCompose = () => {
    setComposeOpen(true);

    navigate("/compose");
  };

  const closeCompose = () => {
    setComposeOpen(false);

    if (
      location.pathname === "/compose"
    ) {
      navigate("/");
    }
  };

  // =========================================================
  // SEND EMAIL
  // =========================================================

  const sendEmail = async (emailData) => {
    try {
      await API.post(
        "/mail/send",
        emailData
      );

      setComposeOpen(false);

      navigate("/sent");

      alert(
        "Email sent successfully."
      );
    } catch (error) {
      console.error(
        "Send email error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send email. Please check your SMTP settings."
      );

      throw error;
    }
  };

  // =========================================================
  // SAVE DRAFT
  // =========================================================

  const saveDraft = async (emailData) => {
    try {
      await API.post(
        "/mail/draft",
        emailData
      );

      setComposeOpen(false);

      navigate("/drafts");

      alert(
        "Draft saved successfully."
      );
    } catch (error) {
      console.error(
        "Save draft error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save draft."
      );

      throw error;
    }
  };

  // =========================================================
  // OPEN EMAIL
  // =========================================================

  const openEmail = async (email) => {
    try {
      const id =
        email?._id ||
        email?.id;

      if (!id) {
        console.error(
          "Email ID is missing."
        );
        return;
      }

      const response =
        await API.get(
          `/mail/${id}`
        );

      const message =
        response.data;

      alert(
        `From: ${
          typeof message.from ===
          "object"
            ? message.from?.email || ""
            : message.from || ""
        }\n\n` +
          `Subject: ${
            message.subject ||
            "(No subject)"
          }\n\n` +
          `${message.text || ""}`
      );

      await loadEmails();
    } catch (error) {
      console.error(
        "Failed to open email:",
        error
      );
    }
  };

  // =========================================================
  // STAR / UNSTAR
  // =========================================================

  const toggleStar = async (email) => {
    try {
      const id =
        email?._id ||
        email?.id;

      if (!id) {
        console.error(
          "Email ID is missing."
        );
        return;
      }

      await API.patch(
        `/mail/${id}/star`
      );

      await loadEmails();
    } catch (error) {
      console.error(
        "Failed to update star:",
        error
      );
    }
  };

  // =========================================================
  // MOVE EMAIL
  // =========================================================

  const moveEmail = async (
    email,
    destinationFolder
  ) => {
    try {
      const id =
        email?._id ||
        email?.id;

      if (!id) {
        console.error(
          "Email ID is missing."
        );
        return;
      }

      await API.patch(
        `/mail/${id}/move`,
        {
          folder: destinationFolder,
        }
      );

      await loadEmails();
    } catch (error) {
      console.error(
        "Failed to move email:",
        error
      );
    }
  };

  // =========================================================
  // DELETE EMAIL
  // =========================================================

  const deleteEmail = async (email) => {
    await moveEmail(
      email,
      "trash"
    );
  };

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (checkingAuth) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-card">
          <div className="loading-spinner" />

          <h2>CargoMail</h2>

          <p>
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={login}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  // =========================================================
  // COMPOSE ROUTE
  // =========================================================

  const isComposeRoute =
    location.pathname ===
    "/compose";

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* MAIN AREA */}

      <main className="main-area">

        {/* TOPBAR */}

        <Topbar
          onMenu={() =>
            setSidebarOpen(true)
          }
          search={search}
          setSearch={setSearch}
          user={user}
        />

        {/* CONTENT */}

        <div className="content">

          <Routes>

            {/* INBOX */}

            <Route
              path="/"
              element={
                <Inbox
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                  onCompose={openCompose}
                />
              }
            />

            {/* SENT */}

            <Route
              path="/sent"
              element={
                <SimpleFolder
                  title="Sent"
                  description="Emails you have sent"
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                />
              }
            />

            {/* DRAFTS */}

            <Route
              path="/drafts"
              element={
                <SimpleFolder
                  title="Drafts"
                  description="Your saved email drafts"
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                />
              }
            />

            {/* STARRED */}

            <Route
              path="/starred"
              element={
                <SimpleFolder
                  title="Starred"
                  description="Your starred emails"
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                />
              }
            />

            {/* ARCHIVE */}

            <Route
              path="/archive"
              element={
                <SimpleFolder
                  title="Archive"
                  description="Archived emails"
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                />
              }
            />

            {/* TRASH */}

            <Route
              path="/trash"
              element={
                <SimpleFolder
                  title="Trash"
                  description="Deleted emails"
                  emails={emails}
                  loading={loading}
                  onOpen={openEmail}
                  onStar={toggleStar}
                  onDelete={deleteEmail}
                  onRefresh={loadEmails}
                />
              }
            />

            {/* PROFILE */}

            <Route
              path="/profile"
              element={
                <Profile user={user} />
              }
            />

            {/* CONTACTS */}

            <Route
              path="/contacts"
              element={
                <Contacts />
              }
            />

            {/* SETTINGS */}

            <Route
              path="/settings"
              element={
                <Settings />
              }
            />

            {/* ADMIN */}

            <Route
              path="/admin"
              element={
                user?.role === "admin" ? (
                  <AdminDashboard
                    stats={stats}
                    onRefresh={loadStats}
                  />
                ) : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
              }
            />

            {/* COMPOSE */}

            <Route
              path="/compose"
              element={
                <div className="page-heading">

                  <span className="eyebrow">
                    EMAIL
                  </span>

                  <h1>
                    Compose Email
                  </h1>

                  <p className="muted">
                    Write and send a new
                    company email.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setComposeOpen(true)
                    }
                  >
                    Open Composer
                  </button>

                </div>
              }
            />

            {/* UNKNOWN */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </div>
      </main>

      {/* LOGOUT */}

      <button
        className="floating-logout"
        onClick={logout}
        title="Logout"
      >
        <LogOut size={17} />

        <span>
          Logout
        </span>
      </button>

      {/* COMPOSE MODAL */}

      {(composeOpen ||
        isComposeRoute) && (
        <ComposeModal
          onClose={closeCompose}
          onSend={sendEmail}
          onSave={saveDraft}
        />
      )}

    </div>
  );
}

export default App;