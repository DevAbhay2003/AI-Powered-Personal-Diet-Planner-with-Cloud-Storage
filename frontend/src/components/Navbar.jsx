import React from "react";
import { Cloud, Sparkles, FolderDown, FileText, Activity, User, LogOut, Cpu, HardDrive } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenCloudModal,
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand" onClick={() => setActiveTab("dashboard")}>
          <div className="brand-logo-wrapper">
            <Cloud className="brand-icon" size={24} />
            <Sparkles className="sparkle-badge" size={12} />
          </div>
          <div className="brand-text">
            <span className="brand-title">NutriCloud <span className="brand-highlight">AI</span></span>
            <span className="brand-subtitle">Cloud Computing Diet Planner</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <nav className="nav-links">
            <button
              className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Activity size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-link ${activeTab === "generate" ? "active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <Cpu size={18} />
              <span>Generate AI Plan</span>
            </button>
            <button
              className={`nav-link ${activeTab === "plans" ? "active" : ""}`}
              onClick={() => setActiveTab("plans")}
            >
              <FileText size={18} />
              <span>Saved Plans</span>
            </button>
            <button
              className={`nav-link ${activeTab === "files" ? "active" : ""}`}
              onClick={() => setActiveTab("files")}
            >
              <HardDrive size={18} />
              <span>Cloud Storage</span>
            </button>
            <button
              className={`nav-link ${activeTab === "intake" ? "active" : ""}`}
              onClick={() => setActiveTab("intake")}
            >
              <FolderDown size={18} />
              <span>Intake & IoT Scale</span>
            </button>
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            className="cloud-status-btn"
            onClick={onOpenCloudModal}
            title="Inspect Cloud Architecture"
          >
            <span className="pulse-dot"></span>
            <Cloud size={16} />
            <span className="cloud-btn-text">Cloud Architecture</span>
          </button>

          {user ? (
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user.name}</span>
                <span className="user-role">Cloud User</span>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab("auth")}
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
