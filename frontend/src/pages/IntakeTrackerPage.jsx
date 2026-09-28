import React, { useState, useEffect } from "react";
import { intakeApi } from "../services/api";
import { Scale, Plus, Trash2, Wifi, Cpu, Check, AlertCircle, RefreshCw, BarChart2, Flame, Droplet } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

const PRESET_FOODS = [
  { id: "oats_porridge", name: "Rolled Oats Porridge", kcal: 130, p: 4.5, c: 23, f: 2.5 },
  { id: "paneer_bhurji", name: "Spiced Paneer Bhurji", kcal: 210, p: 14, c: 12, f: 11.5 },
  { id: "egg_white_omelette", name: "Egg White Omelette", kcal: 140, p: 15, c: 10, f: 3.5 },
  { id: "tofu_scramble", name: "Savory Tofu Scramble", kcal: 125, p: 12, c: 4, f: 7 },
  { id: "grilled_chicken_quinoa", name: "Grilled Chicken & Quinoa", kcal: 165, p: 22, c: 12, f: 3.2 },
  { id: "roasted_makhana", name: "Roasted Foxnuts (Makhana)", kcal: 350, p: 9.5, c: 64, f: 6.5 },
];

export default function IntakeTrackerPage({ user }) {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual log form
  const [foodName, setFoodName] = useState("");
  const [portionG, setPortionG] = useState(150);
  const [calories, setCalories] = useState(200);
  const [proteinG, setProteinG] = useState(15);
  const [carbsG, setCarbsG] = useState(25);
  const [fatG, setFatG] = useState(5);
  const [mealType, setMealType] = useState("snack");

  // IoT Smart Scale Simulation state
  const [iotFoodId, setIotFoodId] = useState("oats_porridge");
  const [iotGrams, setIotGrams] = useState(175);
  const [iotConsole, setIotConsole] = useState([]);
  const [iotSending, setIotSending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDailyAnalytics();
  }, []);

  const fetchDailyAnalytics = async () => {
    setLoading(true);
    try {
      const data = await intakeApi.getDailyAnalytics();
      setDailyData(data);
    } catch (err) {
      setError("Failed to fetch daily intake: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await intakeApi.logIntake({
        food_name: foodName,
        portion_g: parseFloat(portionG),
        calories: parseFloat(calories),
        protein_g: parseFloat(proteinG),
        carbs_g: parseFloat(carbsG),
        fat_g: parseFloat(fatG),
        meal_type: mealType,
      });
      setMessage(`Logged ${foodName} into daily intake.`);
      setFoodName("");
      fetchDailyAnalytics();
    } catch (err) {
      setError("Logging failed: " + err.message);
    }
  };

  const handleDeleteItem = async (intakeId) => {
    try {
      await intakeApi.deleteIntake(intakeId);
      fetchDailyAnalytics();
      setMessage("Intake entry deleted.");
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const handleSimulateIotScale = async () => {
    if (!user?.user_id) return;
    setIotSending(true);
    setError("");
    const selectedPreset = PRESET_FOODS.find((f) => f.id === iotFoodId) || PRESET_FOODS[0];

    const timestamp = new Date().toLocaleTimeString();
    const log1 = `[${timestamp}] [ESP32-HX711]: Tared plate -> Weighed ${selectedPreset.name}: ${iotGrams}g`;
    const log2 = `[${timestamp}] [WiFi HTTP Client]: Dispatching GET /api/intake/iot/ingest?uid=${user.user_id.slice(0, 8)}...&food_id=${iotFoodId}&grams=${iotGrams}`;

    setIotConsole((prev) => [log2, log1, ...prev.slice(0, 8)]);

    try {
      const res = await intakeApi.ingestIoTScale(user.user_id, iotFoodId, iotGrams);
      const log3 = `[${timestamp}] [Cloud Gateway 200 OK]: Ingested portion! Cal: ${res.logged_item?.calories} kcal, Protein: ${res.logged_item?.protein_g}g`;
      setIotConsole((prev) => [log3, ...prev]);
      setMessage(`IoT Smart Scale successfully logged ${iotGrams}g of ${selectedPreset.name}!`);
      fetchDailyAnalytics();
    } catch (err) {
      const logErr = `[${timestamp}] [IoT Error]: ${err.message}`;
      setIotConsole((prev) => [logErr, ...prev]);
      setError("IoT ingestion error: " + err.message);
    } finally {
      setIotSending(false);
    }
  };

  const targets = dailyData?.targets || {
    target_calories: 2000,
    macros: { protein_g: 125, carbs_g: 220, fat_g: 65 },
  };

  const totalCal = dailyData?.total_calories || 0;
  const adherencePct = dailyData?.adherence?.calorie_percentage || 0;

  return (
    <div className="intake-tracker-container">
      <div className="page-header">
        <h2>Daily Nutritional Intake & IoT Smart Scale Telemetry</h2>
        <p className="page-subtitle">
          Synchronize meal portions from manual inputs or edge microcontrollers (ESP32 + HX711 load cell).
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

      {/* Progress & Target Summary */}
      <div className="intake-summary-card">
        <div className="summary-stat-row">
          <div>
            <span className="stat-label">Consumed Today</span>
            <h3>{totalCal} <span className="unit">kcal</span></h3>
          </div>
          <div>
            <span className="stat-label">Daily Target</span>
            <h3>{targets.target_calories} <span className="unit">kcal</span></h3>
          </div>
          <div>
            <span className="stat-label">Adherence</span>
            <h3 className="text-orange">{adherencePct}%</h3>
          </div>
          <div>
            <span className="stat-label">Remaining Energy</span>
            <h3 className="text-green">{Math.max(targets.target_calories - totalCal, 0)} kcal</h3>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-container mt-4">
          <div
            className="progress-bar-fill bg-gradient-orange"
            style={{ width: `${Math.min(adherencePct, 100)}%` }}
          ></div>
        </div>

        {/* Macros Breakdown */}
        <div className="macro-adherence-grid mt-4">
          <div className="macro-adh-box">
            <span className="macro-name">Protein</span>
            <strong>{dailyData?.total_protein_g || 0}g / {targets.macros?.protein_g}g</strong>
            <span className="macro-pct">{dailyData?.adherence?.protein_adherence_pct || 0}% of target</span>
          </div>
          <div className="macro-adh-box">
            <span className="macro-name">Carbohydrates</span>
            <strong>{dailyData?.total_carbs_g || 0}g / {targets.macros?.carbs_g}g</strong>
            <span className="macro-pct">{dailyData?.adherence?.carbs_adherence_pct || 0}% of target</span>
          </div>
          <div className="macro-adh-box">
            <span className="macro-name">Fats</span>
            <strong>{dailyData?.total_fat_g || 0}g / {targets.macros?.fat_g}g</strong>
            <span className="macro-pct">{dailyData?.adherence?.fat_adherence_pct || 0}% of target</span>
          </div>
        </div>
      </div>

      <div className="intake-split-grid">
        {/* Left: IoT Smart Scale Simulator */}
        <div className="content-card iot-scale-card">
          <div className="card-top-icon">
            <Wifi size={24} className="text-cyan" />
            <div>
              <h3>ESP32 + HX711 Smart Scale Simulator</h3>
              <p className="card-subtitle">Edge device telemetry via REST GET /api/intake/iot/ingest</p>
            </div>
          </div>

          <div className="scale-display-box">
            <div className="scale-weight-indicator">
              <span className="weight-digits">{iotGrams}</span>
              <span className="weight-unit">grams</span>
            </div>
            <p className="scale-status-label">HX711 24-Bit ADC Calibrated (Scale Factor: 2280.0)</p>
          </div>

          <div className="form-group">
            <label>Food Placed on Scale Plate</label>
            <select
              value={iotFoodId}
              onChange={(e) => setIotFoodId(e.target.value)}
            >
              {PRESET_FOODS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.kcal} kcal/100g)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Adjust Portion Weight (grams): {iotGrams}g</label>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={iotGrams}
              onChange={(e) => setIotGrams(parseInt(e.target.value))}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handleSimulateIotScale}
            disabled={iotSending}
          >
            {iotSending ? "Transmitting WiFi Telemetry..." : "Push Weight to Cloud Database"}
          </button>

          {/* IoT Terminal / Console log */}
          <div className="iot-console-window mt-4">
            <div className="console-bar">
              <span className="terminal-title">ESP32 UART Serial Telemetry Console</span>
            </div>
            <div className="console-body">
              {iotConsole.length === 0 ? (
                <p className="console-dim">Waiting for load cell weighing event...</p>
              ) : (
                iotConsole.map((line, idx) => (
                  <p key={idx} className="console-line">{line}</p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Manual Food Logging Form */}
        <div className="content-card">
          <h3>Manual Meal Intake Logger</h3>
          <p className="card-subtitle">Log custom foods and portions</p>

          <form onSubmit={handleManualLog} className="mt-4">
            <div className="form-group">
              <label>Food Item Name</label>
              <input
                type="text"
                placeholder="e.g. Avocado Toast or Dal Tadka"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Portion (grams)</label>
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={portionG}
                  onChange={(e) => setPortionG(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Calories (kcal)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Carbs (g)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Fat (g)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Meal Category</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <button type="submit" className="btn btn-secondary btn-block">
              <Plus size={16} /> Record Intake
            </button>
          </form>
        </div>
      </div>

      {/* Today's Logged Items Table */}
      <div className="logged-items-card mt-6">
        <h3>Today's Cloud Database Intake Ledger</h3>
        {dailyData?.logs?.length === 0 ? (
          <p className="empty-text">No meals logged yet today.</p>
        ) : (
          <div className="table-responsive">
            <table className="intake-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Portion</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dailyData?.logs?.map((item) => (
                  <tr key={item.intake_id}>
                    <td><strong>{item.food_name}</strong></td>
                    <td>{item.portion_g}g</td>
                    <td>{item.calories} kcal</td>
                    <td>{item.protein_g}g</td>
                    <td>{item.carbs_g}g</td>
                    <td>{item.fat_g}g</td>
                    <td><span className="type-badge">{item.meal_type}</span></td>
                    <td>
                      <button
                        className="icon-action-btn text-danger"
                        onClick={() => handleDeleteItem(item.intake_id)}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DisclaimerBanner compact={true} />
    </div>
  );
}
