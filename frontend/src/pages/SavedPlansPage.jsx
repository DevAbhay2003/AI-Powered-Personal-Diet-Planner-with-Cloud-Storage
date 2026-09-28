import React, { useEffect, useState } from "react";
import { plansApi } from "../services/api";
import { FileText, Trash2, Download, Eye, Calendar, Sparkles, RefreshCw, X, AlertCircle, Check } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function SavedPlansPage({ onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const data = await plansApi.listPlans();
      setPlans(data);
    } catch (err) {
      setError("Failed to load saved plans: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this diet plan from Cloud Database?")) return;
    try {
      await plansApi.deletePlan(planId);
      setPlans(plans.filter((p) => p.plan_id !== planId));
      if (selectedPlan?.plan_id === planId) setSelectedPlan(null);
      setMessage("Diet plan removed from Cloud Database.");
    } catch (err) {
      setError("Failed to delete plan: " + err.message);
    }
  };

  const handleExport = async (planId, format) => {
    try {
      const res = await plansApi.exportPlan(planId, format);
      setMessage(`Plan exported as ${res.file.filename} into Cloud Object Storage!`);
    } catch (err) {
      setError("Export failed: " + err.message);
    }
  };

  return (
    <div className="saved-plans-container">
      <div className="page-header-row">
        <div>
          <h2>Centralized Cloud Database: Saved Plans</h2>
          <p className="page-subtitle">
            Relational storage of generated diet plans isolated by your unique User ID tenant key.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
          <Sparkles size={16} /> Generate New Plan
        </button>
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

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spinner" size={32} />
          <p>Querying Cloud Database for user records...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon text-muted" />
          <h3>No Diet Plans Saved in Cloud Database</h3>
          <p>Generate a personalized meal plan and click "Save to Cloud Database".</p>
          <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
            Generate Your First Plan
          </button>
        </div>
      ) : (
        <div className="saved-plans-grid">
          {plans.map((p) => (
            <div key={p.plan_id} className="saved-plan-card">
              <div className="plan-card-header">
                <div>
                  <span className="badge badge-info">{p.generation_mode || "rule_based"}</span>
                  <h4>{p.plan_title || "Personal Diet Plan"}</h4>
                </div>
                <button
                  className="icon-btn-delete"
                  onClick={() => handleDelete(p.plan_id)}
                  title="Delete from Cloud DB"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="plan-meta-row">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}</span>
                </div>
                <div className="meta-item">
                  <strong>{p.nutrition_summary?.actual_calories || 0} kcal</strong>
                </div>
              </div>

              <div className="plan-meals-brief">
                <p><strong>Breakfast:</strong> {p.breakfast?.name}</p>
                <p><strong>Lunch:</strong> {p.lunch?.name}</p>
                <p><strong>Dinner:</strong> {p.dinner?.name}</p>
              </div>

              <div className="plan-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedPlan(p)}>
                  <Eye size={14} /> View Details
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleExport(p.plan_id, "json")}
                  title="Export to Cloud Storage Bucket"
                >
                  <Download size={14} /> Cloud S3 Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="modal-backdrop" onClick={() => setSelectedPlan(null)}>
          <div className="modal-content plan-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedPlan.plan_title}</h3>
                <p className="modal-subtitle">Cloud Plan ID: {selectedPlan.plan_id}</p>
              </div>
              <button className="icon-btn-close" onClick={() => setSelectedPlan(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="meals-detail-list">
                {["breakfast", "lunch", "snack", "dinner"].map((mKey) => {
                  const m = selectedPlan[mKey];
                  return (
                    <div key={mKey} className="modal-meal-row">
                      <div className="meal-tag-pill">{mKey.toUpperCase()}</div>
                      <div className="meal-info-block">
                        <strong>{m?.name}</strong>
                        <p>{m?.description}</p>
                        <span className="nutrition-line">
                          {m?.portion_g}g • {m?.calories} kcal • P: {m?.protein_g}g | C: {m?.carbs_g}g | F: {m?.fat_g}g
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-callout mt-4">
                <strong>Nutrition Summary:</strong> {selectedPlan.nutrition_summary?.actual_calories} kcal (Target: {selectedPlan.nutrition_summary?.target_calories} kcal)
                <br />
                <span>{selectedPlan.nutrition_summary?.hydration_reminder}</span>
              </div>

              <div className="mt-4">
                <DisclaimerBanner compact={true} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => handleExport(selectedPlan.plan_id, "json")}>
                <Download size={16} /> Export JSON to Bucket
              </button>
              <button className="btn btn-outline" onClick={() => handleExport(selectedPlan.plan_id, "txt")}>
                <Download size={16} /> Export TXT to Bucket
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedPlan(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
