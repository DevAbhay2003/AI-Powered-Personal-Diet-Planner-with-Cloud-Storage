"""
Daily Intake Tracking, Nutritional Progress Analytics, and IoT Smart Scale Ingestion Routes
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List, Dict, Any
from backend.models.schemas import IntakeLogRequest
from backend.utils.security import get_current_user
from cloud.database_service import IntakeRepository, UserRepository
from ai_engine.diet_engine import calculate_tdee_and_targets, FOOD_CATALOG

router = APIRouter(prefix="/intake", tags=["Daily Intake & IoT Logging"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def log_food_intake(req: IntakeLogRequest, current_user: dict = Depends(get_current_user)):
    """
    Logs a consumed food item and its macronutrient values for the user.
    """
    logged = IntakeRepository.log_intake(
        user_id=current_user["user_id"],
        intake_data=req.model_dump()
    )
    return {
        "message": "Intake item recorded successfully.",
        "intake": logged
    }

@router.get("/daily", response_model=dict)
def get_daily_intake_analytics(
    date: Optional[str] = Query(None, description="Format YYYY-MM-DD. Defaults to today."),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns daily intake breakdown, total calories, macros consumed,
    and adherence metrics compared to target BMR/TDEE.
    """
    from datetime import timezone
    target_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    summary = IntakeRepository.get_daily_summary(current_user["user_id"], target_date)

    # Compute target macros for comparison
    targets = calculate_tdee_and_targets(
        sex=current_user.get("sex", "male"),
        weight_kg=float(current_user.get("weight", 70.0)),
        height_cm=float(current_user.get("height", 170.0)),
        age=int(current_user.get("age", 25)),
        activity_level=current_user.get("activity_level", "moderate"),
        goal=current_user.get("goal", "maintenance")
    )

    consumed_cal = summary["total_calories"]
    target_cal = targets["target_calories"]
    cal_pct = round((consumed_cal / target_cal * 100) if target_cal > 0 else 0, 1)

    target_p = targets["macros"]["protein_g"]
    target_c = targets["macros"]["carbs_g"]
    target_f = targets["macros"]["fat_g"]

    summary["targets"] = targets
    summary["adherence"] = {
        "calorie_percentage": cal_pct,
        "calories_remaining": max(round(target_cal - consumed_cal, 1), 0),
        "protein_adherence_pct": round((summary["total_protein_g"] / target_p * 100) if target_p > 0 else 0, 1),
        "carbs_adherence_pct": round((summary["total_carbs_g"] / target_c * 100) if target_c > 0 else 0, 1),
        "fat_adherence_pct": round((summary["total_fat_g"] / target_f * 100) if target_f > 0 else 0, 1)
    }

    return summary

@router.delete("/{intake_id}", response_model=dict)
def delete_intake_item(intake_id: str, current_user: dict = Depends(get_current_user)):
    """
    Removes a logged food intake item.
    """
    deleted = IntakeRepository.delete_log(current_user["user_id"], intake_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake log not found or unauthorized to delete."
        )
    return {"message": "Intake entry deleted successfully."}

@router.get("/iot/ingest", response_model=dict)
def ingest_iot_scale_weight(
    uid: str = Query(..., description="User ID receiving the portion log"),
    food_id: str = Query(..., description="Food catalog ID (e.g. oats, paneer, apple)"),
    grams: float = Query(..., description="Weighed portion in grams from HX711 scale")
):
    """
    IoT Smart Scale Endpoint:
    Receives HTTP GET telemetry from an ESP32 microcontroller with HX711 load cell.
    Calculates calories & macros based on food catalog, and logs directly to user's daily record.
    """
    user = UserRepository.get_by_id(uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IoT user not found")

    grams_clean = max(1.0, min(float(grams), 3000.0))

    # Match food in catalog
    matched = next((f for f in FOOD_CATALOG if f["id"] == food_id), None)
    if not matched:
        # Generic food default
        food_name = food_id.replace("_", " ").title()
        per_100 = {"kcal": 150, "protein": 5.0, "carbs": 20.0, "fat": 4.0}
    else:
        food_name = matched["name"]
        per_100 = matched["per_100g"]

    multiplier = grams_clean / 100.0
    cal = round(per_100["kcal"] * multiplier, 1)
    p = round(per_100["protein"] * multiplier, 1)
    c = round(per_100["carbs"] * multiplier, 1)
    f = round(per_100["fat"] * multiplier, 1)

    logged = IntakeRepository.log_intake(
        user_id=uid,
        intake_data={
            "food_name": f"{food_name} (IoT Smart Scale)",
            "portion_g": round(grams_clean, 1),
            "calories": cal,
            "protein_g": p,
            "carbs_g": c,
            "fat_g": f,
            "meal_type": "smart_scale_log"
        }
    )

    return {
        "ok": True,
        "status": "IoT telemetry ingested successfully into Cloud Database",
        "logged_item": logged
    }
