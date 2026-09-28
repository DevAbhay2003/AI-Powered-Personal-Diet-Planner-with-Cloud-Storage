"""
Pydantic Schemas for Request Validation and Response Serialization
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Alex Johnson"})
    email: EmailStr = Field(..., json_schema_extra={"example": "alex@example.com"})
    password: str = Field(..., min_length=6, max_length=128, json_schema_extra={"example": "Secret123!"})

class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "alex@example.com"})
    password: str = Field(..., json_schema_extra={"example": "Secret123!"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    height: Optional[float] = Field(None, ge=50.0, le=260.0) # in cm
    weight: Optional[float] = Field(None, ge=20.0, le=350.0) # in kg
    sex: Optional[str] = Field("male", description="'male' or 'female'")
    activity_level: Optional[str] = Field("moderate", description="'sedentary', 'light', 'moderate', 'active', 'very_active'")
    dietary_preference: Optional[str] = Field("veg", description="'veg', 'vegan', 'nonveg'")
    goal: Optional[str] = Field("maintenance", description="'weight_loss', 'maintenance', 'weight_gain', 'fitness'")
    allergies: Optional[List[str]] = Field(default_factory=list)

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    age: int
    height: float
    weight: float
    sex: str
    activity_level: str
    dietary_preference: str
    goal: str
    allergies: List[str]
    created_at: str

class GeneratePlanRequest(BaseModel):
    dietary_preference: Optional[str] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    allergies: Optional[List[str]] = None
    use_external_ai: bool = False
    custom_notes: Optional[str] = None

class SavePlanRequest(BaseModel):
    title: Optional[str] = None
    plan_data: Dict[str, Any]

class IntakeLogRequest(BaseModel):
    food_name: str
    portion_g: float = Field(..., gt=0)
    calories: float = Field(..., ge=0)
    protein_g: float = Field(default=0.0, ge=0)
    carbs_g: float = Field(default=0.0, ge=0)
    fat_g: float = Field(default=0.0, ge=0)
    meal_type: Optional[str] = "snack"
    date: Optional[str] = None

class CloudStatusResponse(BaseModel):
    status: str
    cloud_provider: str
    cloud_region: str
    database_tier: str
    storage_tier: str
    ai_engine_status: str
    security_protocol: str
    timestamp: str
