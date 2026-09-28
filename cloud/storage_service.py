"""
Cloud Object Storage Service
Provides abstraction for storing unstructured files, meal photos, and exported diet plan documents.
Supports:
1. Local Storage Simulation (Simulated S3/Blob Bucket)
2. Cloud S3 / Firebase Storage adapter interface
3. Security sanitization (file type validation, path traversal prevention, size bounds)
"""

import os
import uuid
from typing import Dict, List, Optional, Tuple, Any
from cloud.database_service import FileMetadataRepository

STORAGE_BUCKET_DIR = os.getenv(
    "STORAGE_BUCKET_DIR",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cloud_storage_bucket")
)

ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".pdf", ".json", ".txt", ".csv"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def ensure_bucket_exists():
    if not os.path.exists(STORAGE_BUCKET_DIR):
        os.makedirs(STORAGE_BUCKET_DIR, exist_ok=True)

ensure_bucket_exists()

class CloudObjectStorageService:
    @staticmethod
    def is_allowed_file(filename: str) -> bool:
        ext = os.path.splitext(filename)[1].lower()
        return ext in ALLOWED_EXTENSIONS

    @staticmethod
    def save_object(
        user_id: str,
        filename: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream"
    ) -> Dict[str, Any]:
        """
        Stores an unstructured object into the cloud bucket with isolated user namespace.
        Saves metadata into Cloud Database.
        """
        if not CloudObjectStorageService.is_allowed_file(filename):
            raise ValueError(f"File extension not permitted. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError(f"File exceeds maximum allowed size of 10 MB (Got: {len(file_bytes) / (1024*1024):.2f} MB)")

        # Namespace under user_id to prevent collision
        user_bucket_dir = os.path.join(STORAGE_BUCKET_DIR, user_id)
        os.makedirs(user_bucket_dir, exist_ok=True)

        clean_filename = os.path.basename(filename)
        unique_prefix = uuid.uuid4().hex[:10]
        stored_filename = f"{unique_prefix}_{clean_filename}"
        storage_path = os.path.join(user_bucket_dir, stored_filename)

        with open(storage_path, "wb") as f:
            f.write(file_bytes)

        # Record metadata into Cloud Database
        record = FileMetadataRepository.record_file(
            user_id=user_id,
            filename=clean_filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
            content_type=content_type
        )
        return record

    @staticmethod
    def get_object(user_id: str, file_id: str) -> Optional[Tuple[bytes, str, str]]:
        """
        Retrieves object bytes, ensuring User A cannot read User B's file.
        Returns: (file_bytes, filename, content_type)
        """
        record = FileMetadataRepository.get_file(user_id, file_id)
        if not record:
            return None

        storage_path = record["storage_path"]
        if not os.path.exists(storage_path):
            return None

        with open(storage_path, "rb") as f:
            data = f.read()

        return data, record["filename"], record["content_type"]

    @staticmethod
    def delete_object(user_id: str, file_id: str) -> bool:
        """Deletes database record and physical blob."""
        storage_path = FileMetadataRepository.delete_file(user_id, file_id)
        if storage_path and os.path.exists(storage_path):
            try:
                os.remove(storage_path)
            except Exception:
                pass
            return True
        return False

    @staticmethod
    def list_objects(user_id: str) -> List[Dict[str, Any]]:
        return FileMetadataRepository.list_files(user_id)

    @staticmethod
    def export_plan_as_file(user_id: str, plan_data: Dict[str, Any], fmt: str = "json") -> Dict[str, Any]:
        """
        Renders a saved diet plan into a file and stores it into cloud object storage.
        """
        plan_id_short = plan_data.get("plan_id", "demo")[:8]
        if fmt == "txt":
            content_str = f"==============================================\n"
            content_str += f"AI-POWERED DIET PLAN (Cloud Storage Export)\n"
            content_str += f"Plan ID: {plan_data.get('plan_id', 'N/A')}\n"
            content_str += f"Date: {plan_data.get('created_at', 'Today')}\n"
            content_str += f"==============================================\n\n"
            
            summary = plan_data.get("nutrition_summary", {})
            content_str += f"NUTRITIONAL TARGETS:\n"
            content_str += f"- Target Calories: {summary.get('target_calories')} kcal\n"
            content_str += f"- Actual Calories: {summary.get('actual_calories')} kcal\n"
            content_str += f"- Protein: {summary.get('actual_protein_g')} g | Carbs: {summary.get('actual_carbs_g')} g | Fat: {summary.get('actual_fat_g')} g\n\n"

            content_str += f"MEAL BREAKDOWN:\n"
            for meal_name in ["breakfast", "lunch", "snack", "dinner"]:
                meal = plan_data.get(meal_name, {})
                content_str += f"\n[{meal_name.upper()}]\n"
                content_str += f"- Dish: {meal.get('name', 'N/A')}\n"
                content_str += f"- Portion: {meal.get('portion_g', 0)} g ({meal.get('calories', 0)} kcal)\n"
                content_str += f"- Protein: {meal.get('protein_g', 0)}g | Carbs: {meal.get('carbs_g', 0)}g | Fat: {meal.get('fat_g', 0)}g\n"
                if meal.get("description"):
                    content_str += f"- Notes: {meal.get('description')}\n"

            content_str += f"\nHYDRATION:\n{summary.get('hydration_reminder', 'Stay hydrated!')}\n"
            content_str += f"\nDISCLAIMER:\n{plan_data.get('disclaimer', 'Educational demo only.')}\n"

            filename = f"Diet_Plan_{plan_id_short}.txt"
            content_bytes = content_str.encode("utf-8")
            content_type = "text/plain"
        else:
            import json
            filename = f"Diet_Plan_{plan_id_short}.json"
            content_bytes = json.dumps(plan_data, indent=2).encode("utf-8")
            content_type = "application/json"

        return CloudObjectStorageService.save_object(
            user_id=user_id,
            filename=filename,
            file_bytes=content_bytes,
            content_type=content_type
        )
