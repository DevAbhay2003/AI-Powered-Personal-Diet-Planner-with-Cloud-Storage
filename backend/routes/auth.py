"""
Authentication Routes: Register, Login, and Current Session Validation
"""

from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from backend.utils.security import hash_password, verify_password, create_access_token, get_current_user
from cloud.database_service import UserRepository

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterRequest):
    """
    Registers a new user into the Cloud Database.
    Hashes password using bcrypt with random salt.
    Returns JWT bearer token for immediate access.
    """
    existing = UserRepository.get_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    pwd_hash = hash_password(user_data.password)
    new_user = UserRepository.create_user(
        name=user_data.name,
        email=user_data.email,
        password_hash=pwd_hash
    )

    access_token = create_access_token(data={"sub": new_user["user_id"], "email": new_user["email"]})
    
    # Exclude password hash from response
    user_safe = {k: v for k, v in new_user.items() if k != "password_hash"}
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_safe
    }

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLoginRequest):
    """
    Validates user credentials and signs a new JWT Bearer token.
    """
    user = UserRepository.get_by_email(creds.email)
    if not user or not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify credentials."
        )

    access_token = create_access_token(data={"sub": user["user_id"], "email": user["email"]})
    user_safe = {k: v for k, v in user.items() if k != "password_hash"}

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_safe
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    Guarantees that the JWT token is valid and active.
    """
    return current_user
