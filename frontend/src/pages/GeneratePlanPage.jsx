import React, { useState } from "react";
import { plansApi } from "../services/api";
import { Sparkles, Cpu, Check, Download, Bookmark, RefreshCw, AlertCircle, Coffee, Sun, Cookie, Moon, Droplet, FileDown } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function GeneratePlanPage({ user, onPlanSaved }) {
  const [dietPref, setDietPref] = useState(user?.dietary_preference || "veg");
  const [goal, setGoal] = useState(user?.goal || "maintenance");
  const [activity, setActivity] = useState(user?.activity_level || "moderate");
  const [useExternalAi, setUseExternalAi] = useState(false);
  const [customNotes, setCustomNotes] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError("");
    setSavedSuccess(false);
    setExportMessage("");

    try {
      const plan = await plansApi.generatePlan({
        dietary_preference: dietPref,
        goal: goal,
        activity_level: activity,
        allergies: user?.allergies || [],
        use_external_ai: useExternalAi,
        custom_notes: customNotes,
      });
      setGeneratedPlan(plan);
    } catch (err) {
      setError("AI Generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!generatedPlan) return;
    setSaveLoading(true);
    setError("");
    try {
      const title = `Plan (${dietPref.toUpperCase()} - ${goal.replace("_", " ").toUpperCase()})`;
      const res = await plansApi.savePlan(title, generatedPlan);
      setSavedSuccess(true);
      if (onPlanSaved) onPlanSaved(res.plan);
    } catch (err) {
      setError("Failed to save to cloud database: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExportToStorage = async (format) => {
    if (!generatedPlan) return;
    setSaveLoading(true);
    setExportMessage("");
    setError("");
    try {
      // First ensure it's saved in DB to get an ID if needed
      let planToExport = generatedPlan;
      if (!planToExport.plan_id) {
        const saveRes = await plansApi.savePlan(`Auto-Saved Plan (${format})`, generatedPlan);
        planToExport = saveRes.plan;
        setGeneratedPlan(planToExport);
        setSavedSuccess(true);
      }

      const res = await plansApi.exportPlan(planToExport.plan_id, format);
      setExportMessage(`Plan exported & stored in Cloud Object Storage bucket as ${res.file.filename}!`);
    } catch (err) {
      setError("Export failed: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="generate-plan-container">
      <div className="page-header">
        <h2>AI Diet Plan Synthesis Engine</h2>
        <p className="page-subtitle">
          Leverages Cloud AI and algorithmic optimization to assemble daily nutrient targets, meal distributions, and portion recommendations.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {exportMessage && (
        <div className="alert-box alert-success">
          <Check size={18} />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Input Controls */}
      <div className="plan-generator-form-card">
        <form onSubmit={handleGenerate}>
          <div className="form-row-3">
            <div className="form-group">
              <label>Dietary Preference</label>
              <select value={dietPref} onChange={(e) => setDietPref(e.target.value)}>
                <option value="veg">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="weight_loss">Weight Loss / Cut (-15%)</option>
                <option value="maintenance">Maintenance (0%)</option>
                <option value="weight_gain">Weight Gain / Surplus (+15%)</option>
                <option value="fitness">High-Protein Fitness</option>
              </select>
            </div>

            <div className="form-group">
              <label>Activity Multiplier</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>AI Synthesis Engine Mode</label>
              <div className="ai-mode-toggle">
                <label className={`toggle-option ${!useExternalAi ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="ai_mode"
                    checked={!useExternalAi}
                    onChange={() => setUseExternalAi(false)}
                  />
                  <span>⚡ Rule-Based Optimization (Offline, Fast)</span>
                </label>
                <label className={`toggle-option ${useExternalAi ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="ai_mode"
                    checked={useExternalAi}
                    onChange={() => setUseExternalAi(true)}
                  />
                  <span>☁️ Cloud LLM (Gemini API with Fallback)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Custom Preferences / Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Prefer legume bowls, low oil, quick prep"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={generating}>
            {generating ? (
              <>
                <RefreshCw size={18} className="spinner" /> Synthesizing Personalized Plan in Cloud...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Personalized Meal Plan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Result Display */}
      {generatedPlan && (
        <div className="generated-plan-result mt-6">
          <div className="result-header-row">
            <div>
              <div className="mode-pill">
                <Cpu size={16} />
                <span>Engine: {generatedPlan.generation_mode}</span>
              </div>
              <h3 className="result-title">Generated Daily Nutrition Plan</h3>
            </div>

            <div className="result-actions-row">
              <button
                className="btn btn-success"
                onClick={handleSaveToCloud}
                disabled={saveLoading || savedSuccess}
              >
                {savedSuccess ? <Check size={16} /> : <Bookmark size={16} />}
                {savedSuccess ? "Saved to Cloud DB" : "Save to Cloud Database"}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleExportToStorage("json")}
                disabled={saveLoading}
              >
                <Download size={16} /> Export JSON to Bucket
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleExportToStorage("txt")}
                disabled={saveLoading}
              >
                <FileDown size={16} /> Export TXT to Bucket
              </button>
            </div>
          </div>

          {generatedPlan.fallback_reason && (
            <div className="alert-box alert-info">
              <Sparkles size={18} />
              <span>
                <strong>Resilient Fallback Triggered:</strong> {generatedPlan.fallback_reason}
              </span>
            </div>
          )}

          {/* 4 Meals Grid */}
          <div className="meals-cards-grid">
            {/* Breakfast */}
            <div className="meal-card">
              <div className="meal-card-top">
                <div className="meal-icon-wrapper bg-orange">
                  <Coffee size={20} />
                </div>
                <div>
                  <span className="meal-card-tag">BREAKFAST • 25% CALORIES</span>
                  <h4>{generatedPlan.breakfast?.name}</h4>
                </div>
              </div>
              <p className="meal-description">{generatedPlan.breakfast?.description}</p>
              <div className="meal-macro-badges">
                <span className="badge-portion">{generatedPlan.breakfast?.portion_g} g</span>
                <span className="badge-cal">{generatedPlan.breakfast?.calories} kcal</span>
                <span className="badge-macro">P: {generatedPlan.breakfast?.protein_g}g</span>
                <span className="badge-macro">C: {generatedPlan.breakfast?.carbs_g}g</span>
                <span className="badge-macro">F: {generatedPlan.breakfast?.fat_g}g</span>
              </div>
            </div>

            {/* Lunch */}
            <div className="meal-card">
              <div className="meal-card-top">
                <div className="meal-icon-wrapper bg-blue">
                  <Sun size={20} />
                </div>
                <div>
                  <span className="meal-card-tag">LUNCH • 35% CALORIES</span>
                  <h4>{generatedPlan.lunch?.name}</h4>
                </div>
              </div>
              <p className="meal-description">{generatedPlan.lunch?.description}</p>
              <div className="meal-macro-badges">
                <span className="badge-portion">{generatedPlan.lunch?.portion_g} g</span>
                <span className="badge-cal">{generatedPlan.lunch?.calories} kcal</span>
                <span className="badge-macro">P: {generatedPlan.lunch?.protein_g}g</span>
                <span className="badge-macro">C: {generatedPlan.lunch?.carbs_g}g</span>
                <span className="badge-macro">F: {generatedPlan.lunch?.fat_g}g</span>
              </div>
            </div>

            {/* Snack */}
            <div className="meal-card">
              <div className="meal-card-top">
                <div className="meal-icon-wrapper bg-purple">
                  <Cookie size={20} />
                </div>
                <div>
                  <span className="meal-card-tag">SNACK • 15% CALORIES</span>
                  <h4>{generatedPlan.snack?.name}</h4>
                </div>
              </div>
              <p className="meal-description">{generatedPlan.snack?.description}</p>
              <div className="meal-macro-badges">
                <span className="badge-portion">{generatedPlan.snack?.portion_g} g</span>
                <span className="badge-cal">{generatedPlan.snack?.calories} kcal</span>
                <span className="badge-macro">P: {generatedPlan.snack?.protein_g}g</span>
                <span className="badge-macro">C: {generatedPlan.snack?.carbs_g}g</span>
                <span className="badge-macro">F: {generatedPlan.snack?.fat_g}g</span>
              </div>
            </div>

            {/* Dinner */}
            <div className="meal-card">
              <div className="meal-card-top">
                <div className="meal-icon-wrapper bg-green">
                  <Moon size={20} />
                </div>
                <div>
                  <span className="meal-card-tag">DINNER • 25% CALORIES</span>
                  <h4>{generatedPlan.dinner?.name}</h4>
                </div>
              </div>
              <p className="meal-description">{generatedPlan.dinner?.description}</p>
              <div className="meal-macro-badges">
                <span className="badge-portion">{generatedPlan.dinner?.portion_g} g</span>
                <span className="badge-cal">{generatedPlan.dinner?.calories} kcal</span>
                <span className="badge-macro">P: {generatedPlan.dinner?.protein_g}g</span>
                <span className="badge-macro">C: {generatedPlan.dinner?.carbs_g}g</span>
                <span className="badge-macro">F: {generatedPlan.dinner?.fat_g}g</span>
              </div>
            </div>
          </div>

          {/* Daily Summary & Hydration Banner */}
          <div className="plan-summary-banner">
            <div className="summary-left">
              <h4>Daily Energy Budget Total</h4>
              <div className="summary-numbers">
                <span className="total-cal">{generatedPlan.nutrition_summary?.actual_calories} kcal</span>
                <span className="target-cal">Target: {generatedPlan.nutrition_summary?.target_calories} kcal</span>
              </div>
              <div className="summary-macros-line">
                <span>Protein: {generatedPlan.nutrition_summary?.actual_protein_g}g</span>
                <span>•</span>
                <span>Carbs: {generatedPlan.nutrition_summary?.actual_carbs_g}g</span>
                <span>•</span>
                <span>Fat: {generatedPlan.nutrition_summary?.actual_fat_g}g</span>
              </div>
            </div>

            <div className="summary-right">
              <div className="hydration-chip">
                <Droplet className="text-blue" size={20} />
                <div>
                  <strong>Hydration Guidance</strong>
                  <p>{generatedPlan.nutrition_summary?.hydration_reminder}</p>
                </div>
              </div>
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      )}
    </div>
  );
}
