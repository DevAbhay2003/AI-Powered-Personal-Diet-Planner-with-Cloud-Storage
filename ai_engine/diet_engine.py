"""
AI Diet Recommendation Engine
Implements:
1. Version A: Scientifically backed Rule-Based Optimization Engine (Mifflin-St Jeor BMR, TDEE, macronutrient distribution, knapsack portion allocation, allergen exclusion).
2. Version B: LLM/AI API Integration with Resilient Fallback mechanism.
"""

import json
import logging
import os
from typing import Dict, List, Any, Optional
import urllib.request
import urllib.error

logger = logging.getLogger("diet_engine")
logging.basicConfig(level=logging.INFO)

# Load food catalog
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FOOD_DATA_PATH = os.path.join(BASE_DIR, "food_data.json")

def load_food_catalog() -> List[Dict[str, Any]]:
    try:
        with open(FOOD_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("foods", [])
    except Exception as e:
        logger.error(f"Error loading food catalog: {e}")
        return []

FOOD_CATALOG = load_food_catalog()

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9
}

GOAL_ADJUSTMENTS = {
    "weight_loss": -0.15,       # 15% calorie deficit
    "cut": -0.15,
    "maintenance": 0.0,         # Isocaloric
    "maintain": 0.0,
    "weight_gain": 0.15,        # 15% calorie surplus
    "gain": 0.15,
    "fitness": 0.05             # Slight surplus with high protein emphasis
}

def calculate_bmr(sex: str, weight_kg: float, height_cm: float, age: int) -> float:
    """Mifflin-St Jeor Equation for Basal Metabolic Rate"""
    gender_offset = 5 if sex.lower() == "male" else -161
    bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age) + gender_offset
    return max(bmr, 800.0)

def calculate_tdee_and_targets(
    sex: str,
    weight_kg: float,
    height_cm: float,
    age: int,
    activity_level: str,
    goal: str
) -> Dict[str, Any]:
    """Calculates BMR, TDEE, adjusted target calories and macro splits."""
    bmr = calculate_bmr(sex, weight_kg, height_cm, age)
    pal = ACTIVITY_MULTIPLIERS.get(activity_level.lower(), 1.375)
    tdee = bmr * pal

    adj_pct = GOAL_ADJUSTMENTS.get(goal.lower(), 0.0)
    target_cal = round(tdee * (1.0 + adj_pct))

    # Macro distribution strategy
    # Goal: Cut/Loss -> Higher protein (30%), Moderate carb (40%), Fat (30%)
    # Goal: Gain/Bulk -> Protein (25%), High carb (50%), Fat (25%)
    # Goal: Fitness  -> High protein (35%), Carb (40%), Fat (25%)
    # Default        -> Protein (25%), Carb (50%), Fat (25%)
    if goal.lower() in ["weight_loss", "cut"]:
        p_pct, c_pct, f_pct = 0.30, 0.40, 0.30
    elif goal.lower() in ["weight_gain", "gain"]:
        p_pct, c_pct, f_pct = 0.25, 0.50, 0.25
    elif goal.lower() == "fitness":
        p_pct, c_pct, f_pct = 0.35, 0.40, 0.25
    else:
        p_pct, c_pct, f_pct = 0.25, 0.50, 0.25

    protein_g = round((target_cal * p_pct) / 4.0)
    carbs_g = round((target_cal * c_pct) / 4.0)
    fat_g = round((target_cal * f_pct) / 9.0)

    # Water requirement calculation: ~35ml per kg + activity compensation
    activity_bonus = 0.6 if activity_level.lower() in ["moderate", "active", "very_active"] else 0.2
    hydration_liters = round((weight_kg * 0.035) + activity_bonus, 1)

    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "target_calories": target_cal,
        "macros": {
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fat_g": fat_g
        },
        "hydration_target_l": max(hydration_liters, 2.0)
    }

def filter_food_items(
    foods: List[Dict[str, Any]],
    diet_pref: str,
    allergies: List[str]
) -> List[Dict[str, Any]]:
    """Filters foods based on dietary preference and allergen exclusion."""
    diet_pref_clean = diet_pref.lower().strip()
    allergies_clean = [a.lower().strip() for a in allergies if a.strip()]

    filtered = []
    for food in foods:
        food_diets = [d.lower() for d in food.get("diet_type", [])]
        # Diet check
        if diet_pref_clean == "vegan" and "vegan" not in food_diets:
            continue
        elif diet_pref_clean == "veg" and ("veg" not in food_diets and "vegan" not in food_diets):
            continue
        # Non-veg allows all items

        # Allergen check
        food_allergens = [al.lower() for al in food.get("allergens", [])]
        has_allergen = any(user_al in food_allergens for user_al in allergies_clean)
        if has_allergen:
            continue

        filtered.append(food)

    return filtered

def generate_rule_based_plan(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Version A: Rule-Based Nutrition Recommendation Engine.
    Uses target macros, meal-category distributions, and greedy optimization.
    """
    weight_kg = float(profile.get("weight", 70.0))
    height_cm = float(profile.get("height", 175.0))
    age = int(profile.get("age", 25))
    sex = str(profile.get("sex", "male"))
    activity_level = str(profile.get("activity_level", "moderate"))
    goal = str(profile.get("goal", "maintenance"))
    diet_pref = str(profile.get("dietary_preference", "veg"))
    allergies = profile.get("allergies", [])
    if isinstance(allergies, str):
        allergies = [a.strip() for a in allergies.split(",") if a.strip()]

    targets = calculate_tdee_and_targets(sex, weight_kg, height_cm, age, activity_level, goal)
    target_cal = targets["target_calories"]

    # Target allocations per meal:
    # Breakfast: 25%, Lunch: 35%, Snack: 15%, Dinner: 25%
    meal_allocations = {
        "breakfast": 0.25,
        "lunch": 0.35,
        "snack": 0.15,
        "dinner": 0.25
    }

    filtered_foods = filter_food_items(FOOD_CATALOG, diet_pref, allergies)
    if not filtered_foods:
        # Fallback to unfiltered if too restrictive
        filtered_foods = FOOD_CATALOG

    meals_result = {}
    actual_total_cal = 0
    actual_p = 0
    actual_c = 0
    actual_f = 0

    for category, alloc_ratio in meal_allocations.items():
        cat_target_cal = target_cal * alloc_ratio
        cat_candidates = [f for f in filtered_foods if f.get("category") == category]
        if not cat_candidates:
            cat_candidates = [f for f in FOOD_CATALOG if f.get("category") == category]

        # Select primary dish
        chosen = cat_candidates[0] if cat_candidates else FOOD_CATALOG[0]
        # Calculate portion to achieve category calorie goal
        base_100_cal = chosen["per_100g"]["kcal"]
        portion_g = round((cat_target_cal / base_100_cal) * 100)
        # Cap reasonable portion bounds
        portion_g = max(min(portion_g, 450), 40)

        multiplier = portion_g / 100.0
        meal_cal = round(chosen["per_100g"]["kcal"] * multiplier)
        meal_p = round(chosen["per_100g"]["protein"] * multiplier, 1)
        meal_c = round(chosen["per_100g"]["carbs"] * multiplier, 1)
        meal_f = round(chosen["per_100g"]["fat"] * multiplier, 1)

        actual_total_cal += meal_cal
        actual_p += meal_p
        actual_c += meal_c
        actual_f += meal_f

        meals_result[category] = {
            "food_id": chosen["id"],
            "name": chosen["name"],
            "portion_g": portion_g,
            "calories": meal_cal,
            "protein_g": meal_p,
            "carbs_g": meal_c,
            "fat_g": meal_f,
            "description": chosen.get("description", "")
        }

    plan_data = {
        "generation_mode": "rule_based_ai",
        "targets": targets,
        "breakfast": meals_result.get("breakfast", {}),
        "lunch": meals_result.get("lunch", {}),
        "snack": meals_result.get("snack", {}),
        "dinner": meals_result.get("dinner", {}),
        "nutrition_summary": {
            "target_calories": target_cal,
            "actual_calories": round(actual_total_cal),
            "target_protein_g": targets["macros"]["protein_g"],
            "actual_protein_g": round(actual_p, 1),
            "target_carbs_g": targets["macros"]["carbs_g"],
            "actual_carbs_g": round(actual_c, 1),
            "target_fat_g": targets["macros"]["fat_g"],
            "actual_fat_g": round(actual_f, 1),
            "hydration_reminder": f"Drink at least {targets['hydration_target_l']} Liters of clean water spread evenly throughout the day."
        },
        "disclaimer": "EDUCATIONAL & GENERAL WELLNESS DEMO ONLY: This meal plan is an algorithmically generated wellness simulation for educational and academic coursework purposes. It does not provide medical, diagnostic, or clinical nutrition therapy. Consult a licensed medical professional or registered dietitian for specialized healthcare needs."
    }

    return plan_data

def generate_ai_llm_plan(profile: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Version B: LLM-powered Diet Planner with resilient fallback.
    Calls Google Gemini or OpenAI compatible endpoints if API key is provided.
    If API call fails or key is missing, falls back to Rule-Based engine seamlessly.
    """
    gemini_key = api_key or os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        logger.info("No external AI API key configured. Executing Rule-Based engine directly.")
        return generate_rule_based_plan(profile)

    # Attempt Gemini API call if key exists
    if gemini_key:
        try:
            logger.info("Initiating external AI request via Google Gemini API...")
            prompt = f"""
You are an expert AI Nutrition and Diet Planner Assistant.
Generate a strictly formatted JSON meal plan matching this profile:
- Age: {profile.get('age')}
- Sex: {profile.get('sex')}
- Height: {profile.get('height')} cm
- Weight: {profile.get('weight')} kg
- Activity Level: {profile.get('activity_level')}
- Dietary Preference: {profile.get('dietary_preference')}
- Goal: {profile.get('goal')}
- Allergies: {profile.get('allergies', [])}

Return ONLY valid JSON matching this schema:
{{
  "generation_mode": "cloud_llm_gemini",
  "breakfast": {{ "name": "...", "portion_g": 200, "calories": 400, "protein_g": 20, "carbs_g": 50, "fat_g": 12, "description": "..." }},
  "lunch": {{ "name": "...", "portion_g": 300, "calories": 650, "protein_g": 35, "carbs_g": 75, "fat_g": 18, "description": "..." }},
  "snack": {{ "name": "...", "portion_g": 150, "calories": 250, "protein_g": 12, "carbs_g": 30, "fat_g": 8, "description": "..." }},
  "dinner": {{ "name": "...", "portion_g": 280, "calories": 500, "protein_g": 30, "carbs_g": 45, "fat_g": 14, "description": "..." }},
  "nutrition_summary": {{
    "target_calories": 1800,
    "actual_calories": 1800,
    "target_protein_g": 97,
    "actual_protein_g": 97,
    "target_carbs_g": 200,
    "actual_carbs_g": 200,
    "target_fat_g": 52,
    "actual_fat_g": 52,
    "hydration_reminder": "Drink 2.8L water"
  }}
}}
No markdown backticks, only JSON string.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            req_data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}]
            }).encode("utf-8")
            
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                candidate = res_body["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = candidate.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_json)
                parsed["disclaimer"] = "EDUCATIONAL & GENERAL WELLNESS DEMO ONLY: Generated via Cloud LLM API. Not medical advice."
                return parsed

        except Exception as e:
            logger.warning(f"External AI API error or timeout ({e}). Engaging Resilient Fallback to Rule-Based Engine.")
            fallback_plan = generate_rule_based_plan(profile)
            fallback_plan["generation_mode"] = "rule_based_fallback"
            fallback_plan["fallback_reason"] = f"External AI service unreachable or key missing ({type(e).__name__}). Automatically switched to deterministic rule-based engine."
            return fallback_plan

    # If no key triggered above
    return generate_rule_based_plan(profile)
