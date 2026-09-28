"""
Diet Plan Generation, Persistence, Retrieval, and Cloud Export Routes
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from backend.models.schemas import GeneratePlanRequest, SavePlanRequest
from backend.utils.security import get_current_user
from cloud.database_service import DietPlanRepository
from cloud.storage_service import CloudObjectStorageService
from ai_engine.diet_engine import generate_rule_based_plan, generate_ai_llm_plan

router = APIRouter(prefix="/plans", tags=["Diet Plans"])

@router.post("/generate", response_model=dict)
def generate_diet_plan(req: GeneratePlanRequest, current_user: dict = Depends(get_current_user)):
    """
    Generates a personalized AI meal plan based on user biometrics and goals.
    Uses Rule-Based optimization or external Cloud LLM with resilient fallback.
    """
    profile_merged = {
        "user_id": current_user["user_id"],
        "name": current_user.get("name"),
        "age": current_user.get("age", 25),
        "height": current_user.get("height", 170.0),
        "weight": current_user.get("weight", 70.0),
        "sex": current_user.get("sex", "male"),
        "activity_level": req.activity_level or current_user.get("activity_level", "moderate"),
        "dietary_preference": req.dietary_preference or current_user.get("dietary_preference", "veg"),
        "goal": req.goal or current_user.get("goal", "maintenance"),
        "allergies": req.allergies if req.allergies is not None else current_user.get("allergies", []),
        "custom_notes": req.custom_notes
    }

    if req.use_external_ai:
        plan = generate_ai_llm_plan(profile_merged)
    else:
        plan = generate_rule_based_plan(profile_merged)

    return plan

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def save_diet_plan(req: SavePlanRequest, current_user: dict = Depends(get_current_user)):
    """
    Persists a generated diet plan into the Cloud Database.
    Ensures isolation by tying the record to current_user['user_id'].
    """
    saved = DietPlanRepository.save_plan(
        user_id=current_user["user_id"],
        plan_data=req.plan_data,
        title=req.title
    )
    return {
        "message": "Diet plan successfully stored in Cloud Database.",
        "plan": saved
    }

@router.get("", response_model=List[dict])
def list_diet_plans(current_user: dict = Depends(get_current_user), limit: int = Query(50, ge=1, le=100)):
    """
    Lists all saved diet plans belonging exclusively to the authenticated user.
    """
    return DietPlanRepository.list_by_user(current_user["user_id"], limit=limit)

@router.get("/{plan_id}", response_model=dict)
def get_diet_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves a single diet plan.
    Enforces user isolation: Returns 404 if plan does not belong to user.
    """
    plan = DietPlanRepository.get_by_id(current_user["user_id"], plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found or access unauthorized."
        )
    return plan

@router.delete("/{plan_id}", response_model=dict)
def delete_diet_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes a diet plan from the Cloud Database.
    """
    success = DietPlanRepository.delete_plan(current_user["user_id"], plan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found or unauthorized to delete."
        )
    return {"message": "Diet plan deleted successfully from Cloud Database."}

@router.post("/{plan_id}/export", response_model=dict)
def export_plan_to_cloud_storage(
    plan_id: str,
    format: str = Query("json", pattern="^(json|txt)$"),
    current_user: dict = Depends(get_current_user)
):
    """
    Demonstrates Cloud Object Storage integration:
    Exports a structured database plan into an unstructured file (JSON or TXT)
    and saves it to Cloud Object Storage.
    """
    plan = DietPlanRepository.get_by_id(current_user["user_id"], plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found."
        )

    file_record = CloudObjectStorageService.export_plan_as_file(
        user_id=current_user["user_id"],
        plan_data=plan,
        fmt=format
    )

    return {
        "message": f"Diet plan exported and stored to Cloud Object Storage as {format.upper()}.",
        "file": file_record
    }
