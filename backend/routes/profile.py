"""
User Profile and Biometrics Management Routes
Calculates BMR, TDEE, macro distribution, and hydration requirements.
"""

from fastapi import APIRouter, Depends
from backend.models.schemas import UserProfileUpdateRequest, UserResponse
from backend.utils.security import get_current_user
from cloud.database_service import UserRepository
from ai_engine.diet_engine import calculate_tdee_and_targets

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=dict)
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns user profile details alongside real-time calculated BMR, TDEE, and Macro targets.
    """
    targets = calculate_tdee_and_targets(
        sex=current_user.get("sex", "male"),
        weight_kg=float(current_user.get("weight", 70.0)),
        height_cm=float(current_user.get("height", 170.0)),
        age=int(current_user.get("age", 25)),
        activity_level=current_user.get("activity_level", "moderate"),
        goal=current_user.get("goal", "maintenance")
    )
    user_safe = {k: v for k, v in current_user.items() if k != "password_hash"}
    return {
        "profile": user_safe,
        "targets": targets
    }

@router.put("", response_model=dict)
def update_profile(profile_data: UserProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    """
    Updates the authenticated user's biometrics and dietary preferences in Cloud Database.
    """
    update_dict = profile_data.model_dump(exclude_unset=True)
    updated_user = UserRepository.update_profile(current_user["user_id"], update_dict)
    
    targets = calculate_tdee_and_targets(
        sex=updated_user.get("sex", "male"),
        weight_kg=float(updated_user.get("weight", 70.0)),
        height_cm=float(updated_user.get("height", 170.0)),
        age=int(updated_user.get("age", 25)),
        activity_level=updated_user.get("activity_level", "moderate"),
        goal=updated_user.get("goal", "maintenance")
    )
    user_safe = {k: v for k, v in updated_user.items() if k != "password_hash"}
    return {
        "message": "User profile successfully synchronized with Cloud Database.",
        "profile": user_safe,
        "targets": targets
    }

@router.get("/targets")
def get_biometric_targets(current_user: dict = Depends(get_current_user)):
    """
    Calculates Mifflin-St Jeor BMR and macro splits for the active user.
    """
    return calculate_tdee_and_targets(
        sex=current_user.get("sex", "male"),
        weight_kg=float(current_user.get("weight", 70.0)),
        height_cm=float(current_user.get("height", 170.0)),
        age=int(current_user.get("age", 25)),
        activity_level=current_user.get("activity_level", "moderate"),
        goal=current_user.get("goal", "maintenance")
    )
