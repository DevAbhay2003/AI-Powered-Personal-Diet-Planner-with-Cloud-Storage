import React, { useState, useEffect } from "react";
import { profileApi } from "../services/api";
import { User, Activity, Dumbbell, Flame, Droplet, Heart, Check, Save, RefreshCw, AlertCircle } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

const ALLERGEN_OPTIONS = ["lactose", "gluten", "nuts", "peanuts", "eggs", "shellfish", "soy"];

export default function ProfilePage({ user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age || 25,
    height: user?.height || 170,
    weight: user?.weight || 70,
    sex: user?.sex || "male",
    activity_level: user?.activity_level || "moderate",
    dietary_preference: user?.dietary_preference || "veg",
    goal: user?.goal || "maintenance",
    allergies: user?.allergies || [],
  });

  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getProfile();
      if (res.profile) {
        setFormData({
          name: res.profile.name || "",
          age: res.profile.age || 25,
          height: res.profile.height || 170,
          weight: res.profile.weight || 70,
          sex: res.profile.sex || "male",
          activity_level: res.profile.activity_level || "moderate",
          dietary_preference: res.profile.dietary_preference || "veg",
          goal: res.profile.goal || "maintenance",
          allergies: res.profile.allergies || [],
        });
      }
      if (res.targets) {
        setTargets(res.targets);
      }
    } catch (err) {
      setError("Failed to fetch profile from cloud database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAllergyToggle = (allergen) => {
    setFormData((prev) => {
      const exists = prev.allergies.includes(allergen);
      const updated = exists
        ? prev.allergies.filter((a) => a !== allergen)
        : [...prev.allergies, allergen];
      return { ...prev, allergies: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await profileApi.updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        sex: formData.sex,
        activity_level: formData.activity_level,
        dietary_preference: formData.dietary_preference,
        goal: formData.goal,
        allergies: formData.allergies,
      });

      setTargets(res.targets);
      setMessage("Profile synchronized with Cloud Database successfully!");
      if (onProfileUpdated) onProfileUpdated(res.profile);
    } catch (err) {
      setError("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="page-header">
        <h2>User Profile & Biometric Metrics</h2>
        <p className="page-subtitle">
          Configure physical parameters used by the cloud AI engine to compute Mifflin-St Jeor BMR and macro targets.
        </p>
      </div>

      {message && (
        <div className="alert-box alert-success">
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="profile-layout-grid">
        {/* Left: Input Form */}
        <div className="profile-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">
              <User size={18} className="text-primary" />
              <span>Personal Identity</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Biological Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                >
                  <option value="male">Male (Mifflin +5 offset)</option>
                  <option value="female">Female (Mifflin -161 offset)</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Age (years)</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  step="0.5"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-section-title mt-4">
              <Dumbbell size={18} className="text-orange" />
              <span>Lifestyle & Nutrition Targets</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Activity Level (PAL Multiplier)</label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                >
                  <option value="sedentary">Sedentary (Desk job, multiplier 1.2)</option>
                  <option value="light">Light (1-3 days exercise, multiplier 1.375)</option>
                  <option value="moderate">Moderate (3-5 days workout, multiplier 1.55)</option>
                  <option value="active">Active (6-7 days training, multiplier 1.725)</option>
                  <option value="very_active">Very Active (Heavy athlete, multiplier 1.9)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Health Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="weight_loss">Weight Loss / Cut (-15% deficit)</option>
                  <option value="maintenance">Maintenance / General Wellness (0%)</option>
                  <option value="weight_gain">Weight Gain / Lean Bulk (+15% surplus)</option>
                  <option value="fitness">Fitness & Athletic Conditioning</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Dietary Preference</label>
              <div className="radio-group-cards">
                <label className={`radio-card ${formData.dietary_preference === "veg" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="dietary_preference"
                    value="veg"
                    checked={formData.dietary_preference === "veg"}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                  />
                  <span className="radio-title">🥦 Vegetarian</span>
                  <span className="radio-sub">Dairy & plant-based foods</span>
                </label>

                <label className={`radio-card ${formData.dietary_preference === "vegan" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="dietary_preference"
                    value="vegan"
                    checked={formData.dietary_preference === "vegan"}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                  />
                  <span className="radio-title">🌱 Vegan</span>
                  <span className="radio-sub">100% plant foods, zero dairy</span>
                </label>

                <label className={`radio-card ${formData.dietary_preference === "nonveg" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="dietary_preference"
                    value="nonveg"
                    checked={formData.dietary_preference === "nonveg"}
                    onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                  />
                  <span className="radio-title">🍗 Non-Vegetarian</span>
                  <span className="radio-sub">Eggs, poultry, fish & plant foods</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Allergen Exclusions (Filters Cloud Food Catalog)</label>
              <div className="allergy-tags-group">
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    className={`allergy-pill ${formData.allergies.includes(allergen) ? "active" : ""}`}
                    onClick={() => handleAllergyToggle(allergen)}
                  >
                    {allergen.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={saving}>
              {saving ? "Synchronizing with Cloud DB..." : "Save Biometrics to Cloud DB"}
              {!saving && <Save size={18} />}
            </button>
          </form>
        </div>

        {/* Right: Live Biometric Calculation Card */}
        <div className="profile-targets-card">
          <div className="target-card-header">
            <Activity className="text-primary" size={24} />
            <div>
              <h3>Calculated Energy Targets</h3>
              <p className="card-subtitle">Mifflin-St Jeor Thermodynamic Formula</p>
            </div>
          </div>

          {targets ? (
            <div className="targets-breakdown">
              <div className="target-stat-box highlight">
                <span className="stat-label">Target Daily Calories</span>
                <span className="stat-val">{targets.target_calories} <span className="unit">kcal</span></span>
                <span className="stat-formula">
                  Adjusted for goal: {formData.goal.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="target-stat-row">
                <div className="stat-col">
                  <span className="stat-label">BMR (Basal Rate)</span>
                  <span className="stat-number">{targets.bmr} kcal</span>
                </div>
                <div className="stat-col">
                  <span className="stat-label">TDEE (Daily Energy)</span>
                  <span className="stat-number">{targets.tdee} kcal</span>
                </div>
              </div>

              <div className="macro-target-bars">
                <h4>Macronutrient Target Split</h4>
                <div className="macro-bar-item">
                  <div className="bar-header">
                    <span>Protein (4 kcal/g)</span>
                    <strong>{targets.macros?.protein_g} g</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bg-red" style={{ width: "30%" }}></div>
                  </div>
                </div>

                <div className="macro-bar-item">
                  <div className="bar-header">
                    <span>Carbohydrates (4 kcal/g)</span>
                    <strong>{targets.macros?.carbs_g} g</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bg-blue" style={{ width: "45%" }}></div>
                  </div>
                </div>

                <div className="macro-bar-item">
                  <div className="bar-header">
                    <span>Fats (9 kcal/g)</span>
                    <strong>{targets.macros?.fat_g} g</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bg-orange" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>

              <div className="hydration-target-box">
                <Droplet className="text-blue" size={20} />
                <div>
                  <strong>Daily Water Goal: {targets.hydration_target_l} Liters</strong>
                  <p>Calculated as 35ml / kg + workout offset</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-state">
              <RefreshCw className="spinner" size={24} />
              <p>Calculating targets...</p>
            </div>
          )}

          <div className="mt-4">
            <DisclaimerBanner compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
