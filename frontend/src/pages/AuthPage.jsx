import React, { useState } from "react";
import { authApi, setToken, setStoredUser } from "../services/api";
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authApi.login(email, password);
      } else {
        if (!name.trim()) throw new Error("Please enter your full name.");
        res = await authApi.register(name, email, password);
      }

      setToken(res.access_token);
      setStoredUser(res.user);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    setName("Demo Student");
    setEmail("student@cloudproject.com");
    setPassword("CloudPass123!");
    setError("");

    // Try login directly, or if user doesn't exist yet, register demo user
    setLoading(true);
    try {
      const res = await authApi.login("student@cloudproject.com", "CloudPass123!");
      setToken(res.access_token);
      setStoredUser(res.user);
      onAuthSuccess(res.user);
    } catch {
      try {
        const resReg = await authApi.register("Demo Student", "student@cloudproject.com", "CloudPass123!");
        setToken(resReg.access_token);
        setStoredUser(resReg.user);
        onAuthSuccess(resReg.user);
      } catch (err) {
        setError("Demo registration error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h2>{isLogin ? "Sign In to Cloud Account" : "Create Cloud Account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Access your centralized diet plans, intake logs, and cloud storage."
              : "Register a secure tenant profile with JWT authentication."}
          </p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Cloud Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? "Authenticating with Cloud..." : (isLogin ? "Sign In" : "Register Account")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-header">
            <Sparkles size={16} className="text-warning" />
            <span>Placement & Interview Evaluation Shortcut</span>
          </div>
          <p>Quickly test cloud features with a pre-configured demo account:</p>
          <button
            type="button"
            className="btn btn-secondary btn-block btn-sm"
            onClick={handleDemoFill}
            disabled={loading}
          >
            One-Click Instant Demo Login
          </button>
        </div>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Don't have a cloud account?{" "}
              <button className="text-link" onClick={() => { setIsLogin(false); setError(""); }}>
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button className="text-link" onClick={() => { setIsLogin(true); setError(""); }}>
                Sign in here
              </button>
            </p>
          )}
        </div>

        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
}
