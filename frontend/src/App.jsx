import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CloudStatusModal from "./components/CloudStatusModal";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import GeneratePlanPage from "./pages/GeneratePlanPage";
import SavedPlansPage from "./pages/SavedPlansPage";
import CloudFilesPage from "./pages/CloudFilesPage";
import IntakeTrackerPage from "./pages/IntakeTrackerPage";
import { getCurrentStoredUser, setToken, setStoredUser, authApi } from "./services/api";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(getCurrentStoredUser());
  const [activeTab, setActiveTab] = useState(user ? "dashboard" : "landing");
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  useEffect(() => {
    // Validate current session token
    if (localStorage.getItem("diet_cloud_token")) {
      authApi.getMe()
        .then((userData) => {
          setUser(userData);
          setStoredUser(userData);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          setStoredUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
    setActiveTab("landing");
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setActiveTab("dashboard");
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      <main className="main-viewport">
        {activeTab === "landing" && (
          <LandingPage
            onGetStarted={() => setActiveTab(user ? "dashboard" : "auth")}
            onDemoLogin={() => setActiveTab("auth")}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
          />
        )}

        {activeTab === "auth" && (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}

        {user && activeTab === "dashboard" && (
          <DashboardPage user={user} onNavigate={setActiveTab} />
        )}

        {user && activeTab === "profile" && (
          <ProfilePage
            user={user}
            onProfileUpdated={(updated) => setUser(updated)}
          />
        )}

        {user && activeTab === "generate" && (
          <GeneratePlanPage user={user} onPlanSaved={() => setActiveTab("plans")} />
        )}

        {user && activeTab === "plans" && (
          <SavedPlansPage onNavigate={setActiveTab} />
        )}

        {user && activeTab === "files" && (
          <CloudFilesPage />
        )}

        {user && activeTab === "intake" && (
          <IntakeTrackerPage user={user} />
        )}
      </main>

      <CloudStatusModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>NutriCloud AI</strong> — Cloud Computing Capstone Project (SaaS / PaaS / IaaS / Object Storage / AI Fallback).
          </p>
          <p className="footer-subtext">
            Architected for academic evaluation, cloud portfolio demonstrations, and technical placement interviews.
          </p>
        </div>
      </footer>
    </div>
  );
}
