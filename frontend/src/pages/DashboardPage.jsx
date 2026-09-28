import React, { useEffect, useState } from "react";
import { profileApi, plansApi, filesApi, intakeApi } from "../services/api";
import { Activity, Flame, Droplet, Dumbbell, FileText, HardDrive, Plus, ArrowRight, Sparkles, Scale, CheckCircle2 } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function DashboardPage({ user, onNavigate }) {
  const [profileData, setProfileData] = useState(null);
  const [latestPlan, setLatestPlan] = useState(null);
  const [filesCount, setFilesCount] = useState(0);
  const [dailyIntake, setDailyIntake] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, plansRes, filesRes, intakeRes] = await Promise.allSettled([
        profileApi.getProfile(),
        plansApi.listPlans(),
        filesApi.listFiles(),
        intakeApi.getDailyAnalytics(),
      ]);

      if (profRes.status === "fulfilled") setProfileData(profRes.value);
      if (plansRes.status === "fulfilled" && plansRes.value.length > 0) {
        setLatestPlan(plansRes.value[0]);
      }
      if (filesRes.status === "fulfilled") setFilesCount(filesRes.value.length);
      if (intakeRes.status === "fulfilled") setDailyIntake(intakeRes.value);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const targets = profileData?.targets || {
    target_calories: 2000,
    macros: { protein_g: 125, carbs_g: 220, fat_g: 65 },
    hydration_target_l: 2.8,
  };

  const consumedCalories = dailyIntake?.total_calories || 0;
  const caloriePercent = Math.min(
    Math.round((consumedCalories / (targets.target_calories || 2000)) * 100),
    100
  );

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text">
          <span className="welcome-subtitle">Cloud Tenant Dashboard</span>
          <h2>Welcome back, {user?.name || "Cloud User"} 👋</h2>
          <div className="user-goal-tags">
            <span className="tag tag-goal">
              🎯 Goal: {user?.goal ? user.goal.replace("_", " ").toUpperCase() : "MAINTENANCE"}
            </span>
            <span className="tag tag-diet">
              🥗 Diet: {user?.dietary_preference ? user.dietary_preference.toUpperCase() : "VEG"}
            </span>
            <span className="tag tag-activity">
              ⚡ Activity: {user?.activity_level ? user.activity_level.toUpperCase() : "MODERATE"}
            </span>
          </div>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
            <Sparkles size={18} /> Generate AI Plan
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate("intake")}>
            <Scale size={18} /> IoT Scale & Intake
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-orange">
            <Flame size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Daily Calorie Target</span>
            <h3 className="metric-value">{targets.target_calories} <span className="unit">kcal</span></h3>
            <span className="metric-subtext">BMR {targets.bmr} • TDEE {targets.tdee}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-red">
            <Dumbbell size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Target Protein</span>
            <h3 className="metric-value">{targets.macros?.protein_g} <span className="unit">g</span></h3>
            <span className="metric-subtext">Carbs: {targets.macros?.carbs_g}g • Fat: {targets.macros?.fat_g}g</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue">
            <Droplet size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Hydration Target</span>
            <h3 className="metric-value">{targets.hydration_target_l} <span className="unit">Liters</span></h3>
            <span className="metric-subtext">Spread evenly across day</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple">
            <HardDrive size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Cloud Object Storage</span>
            <h3 className="metric-value">{filesCount} <span className="unit">files</span></h3>
            <span className="metric-subtext">Encrypted user bucket</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-content-grid">
        {/* Left Column: Today's Adherence & Intake */}
        <div className="content-card">
          <div className="card-header-row">
            <div>
              <h3>Today's Nutrition Intake</h3>
              <p className="card-subtitle">Real-time telemetry and food logs</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate("intake")}>
              Log Food
            </button>
          </div>

          <div className="adherence-box">
            <div className="adherence-stats-row">
              <div>
                <span className="stat-label">Consumed</span>
                <span className="stat-number text-orange">{consumedCalories} kcal</span>
              </div>
              <div>
                <span className="stat-label">Target</span>
                <span className="stat-number">{targets.target_calories} kcal</span>
              </div>
              <div>
                <span className="stat-label">Remaining</span>
                <span className="stat-number text-green">
                  {Math.max(targets.target_calories - consumedCalories, 0)} kcal
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill bg-gradient-orange"
                style={{ width: `${caloriePercent}%` }}
              ></div>
            </div>
            <div className="progress-bar-labels">
              <span>0 kcal</span>
              <span>{caloriePercent}% of daily budget</span>
              <span>{targets.target_calories} kcal</span>
            </div>

            {/* Macro Breakdown Pills */}
            <div className="macro-pills-row">
              <div className="macro-pill">
                <span className="macro-title">Protein</span>
                <span className="macro-val">{dailyIntake?.total_protein_g || 0} / {targets.macros?.protein_g}g</span>
              </div>
              <div className="macro-pill">
                <span className="macro-title">Carbs</span>
                <span className="macro-val">{dailyIntake?.total_carbs_g || 0} / {targets.macros?.carbs_g}g</span>
              </div>
              <div className="macro-pill">
                <span className="macro-title">Fat</span>
                <span className="macro-val">{dailyIntake?.total_fat_g || 0} / {targets.macros?.fat_g}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Latest AI Diet Plan */}
        <div className="content-card">
          <div className="card-header-row">
            <div>
              <h3>Latest Cloud Diet Plan</h3>
              <p className="card-subtitle">Stored in Centralized Cloud DB</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("plans")}>
              All Plans
            </button>
          </div>

          {latestPlan ? (
            <div className="latest-plan-box">
              <div className="plan-title-badge">
                <h4>{latestPlan.plan_title || "Recent AI Meal Plan"}</h4>
                <span className="badge badge-info">{latestPlan.generation_mode || "rule_based"}</span>
              </div>

              <div className="meals-quick-list">
                <div className="meal-item-row">
                  <span className="meal-type-label">Breakfast:</span>
                  <span className="meal-name-text">{latestPlan.breakfast?.name}</span>
                  <span className="meal-cal-pill">{latestPlan.breakfast?.calories} kcal</span>
                </div>
                <div className="meal-item-row">
                  <span className="meal-type-label">Lunch:</span>
                  <span className="meal-name-text">{latestPlan.lunch?.name}</span>
                  <span className="meal-cal-pill">{latestPlan.lunch?.calories} kcal</span>
                </div>
                <div className="meal-item-row">
                  <span className="meal-type-label">Snack:</span>
                  <span className="meal-name-text">{latestPlan.snack?.name}</span>
                  <span className="meal-cal-pill">{latestPlan.snack?.calories} kcal</span>
                </div>
                <div className="meal-item-row">
                  <span className="meal-type-label">Dinner:</span>
                  <span className="meal-name-text">{latestPlan.dinner?.name}</span>
                  <span className="meal-cal-pill">{latestPlan.dinner?.calories} kcal</span>
                </div>
              </div>

              <div className="latest-plan-footer">
                <button className="btn btn-outline btn-block" onClick={() => onNavigate("plans")}>
                  View Full Breakdown & Cloud Export <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={40} className="empty-icon text-muted" />
              <h4>No Diet Plan Stored in Cloud Yet</h4>
              <p>Generate your first personalized meal plan tailored to your biometrics.</p>
              <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
                <Plus size={16} /> Generate Plan Now
              </button>
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
