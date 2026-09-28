"""
Cloud Database Service
Provides centralized cloud database operations for Users, Profiles, Diet Plans, Intake Logs, and File Metadata.
Implements user isolation, transactional safety, and structured querying.
Compatible with SQLite (local/container volume) and extensible to Firestore/PostgreSQL.
"""

import sqlite3
import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(os.path.dirname(DB_DIR), "diet_planner_cloud.db")
DATABASE_PATH = os.getenv("CLOUD_DB_PATH", DEFAULT_DB_PATH)

def get_connection():
    db_path = os.getenv("CLOUD_DB_PATH", DEFAULT_DB_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes schema tables and indexes."""
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        age INTEGER DEFAULT 25,
        height REAL DEFAULT 170.0,
        weight REAL DEFAULT 70.0,
        sex TEXT DEFAULT 'male',
        activity_level TEXT DEFAULT 'moderate',
        dietary_preference TEXT DEFAULT 'veg',
        goal TEXT DEFAULT 'maintenance',
        allergies TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Diet Plans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diet_plans (
        plan_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_title TEXT,
        breakfast TEXT NOT NULL,
        lunch TEXT NOT NULL,
        snack TEXT NOT NULL,
        dinner TEXT NOT NULL,
        nutrition_summary TEXT NOT NULL,
        targets TEXT,
        generation_mode TEXT DEFAULT 'rule_based',
        disclaimer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # User Files table (Object storage metadata)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_files (
        file_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # Intake tracking logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS intake_logs (
        intake_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        food_name TEXT NOT NULL,
        portion_g REAL NOT NULL,
        calories REAL NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL,
        meal_type TEXT DEFAULT 'snack',
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
    """)

    # Create Indexes for fast user queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_plans_user ON diet_plans(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_files_user ON user_files(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_intake_user_date ON intake_logs(user_id, date);")

    conn.commit()
    conn.close()

# User Repository
class UserRepository:
    @staticmethod
    def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (user_id, name, email, password_hash)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, name, email.lower().strip(), password_hash)
        )
        conn.commit()
        conn.close()
        return UserRepository.get_by_id(user_id)

    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            d["allergies"] = json.loads(d.get("allergies") or "[]")
            return d
        return None

    @staticmethod
    def get_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            d["allergies"] = json.loads(d.get("allergies") or "[]")
            return d
        return None

    @staticmethod
    def update_profile(user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        allergies_json = json.dumps(profile_data.get("allergies", []))
        cursor.execute(
            """
            UPDATE users SET
                name = COALESCE(?, name),
                age = COALESCE(?, age),
                height = COALESCE(?, height),
                weight = COALESCE(?, weight),
                sex = COALESCE(?, sex),
                activity_level = COALESCE(?, activity_level),
                dietary_preference = COALESCE(?, dietary_preference),
                goal = COALESCE(?, goal),
                allergies = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (
                profile_data.get("name"),
                profile_data.get("age"),
                profile_data.get("height"),
                profile_data.get("weight"),
                profile_data.get("sex"),
                profile_data.get("activity_level"),
                profile_data.get("dietary_preference"),
                profile_data.get("goal"),
                allergies_json,
                user_id
            )
        )
        conn.commit()
        conn.close()
        return UserRepository.get_by_id(user_id)

# Diet Plan Repository
class DietPlanRepository:
    @staticmethod
    def save_plan(user_id: str, plan_data: Dict[str, Any], title: Optional[str] = None) -> Dict[str, Any]:
        plan_id = str(uuid.uuid4())
        if not title:
            from datetime import timezone
            title = f"Meal Plan - {datetime.now(timezone.utc).strftime('%b %d, %Y %H:%M')}"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO diet_plans (
                plan_id, user_id, plan_title, breakfast, lunch, snack, dinner,
                nutrition_summary, targets, generation_mode, disclaimer
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                plan_id,
                user_id,
                title,
                json.dumps(plan_data.get("breakfast", {})),
                json.dumps(plan_data.get("lunch", {})),
                json.dumps(plan_data.get("snack", {})),
                json.dumps(plan_data.get("dinner", {})),
                json.dumps(plan_data.get("nutrition_summary", {})),
                json.dumps(plan_data.get("targets", {})),
                plan_data.get("generation_mode", "rule_based"),
                plan_data.get("disclaimer", "")
            )
        )
        conn.commit()
        conn.close()
        return DietPlanRepository.get_by_id(user_id, plan_id)

    @staticmethod
    def get_by_id(user_id: str, plan_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM diet_plans WHERE plan_id = ? AND user_id = ?", (plan_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["breakfast"] = json.loads(d["breakfast"])
        d["lunch"] = json.loads(d["lunch"])
        d["snack"] = json.loads(d["snack"])
        d["dinner"] = json.loads(d["dinner"])
        d["nutrition_summary"] = json.loads(d["nutrition_summary"])
        d["targets"] = json.loads(d["targets"]) if d.get("targets") else {}
        return d

    @staticmethod
    def list_by_user(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM diet_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit)
        )
        rows = cursor.fetchall()
        conn.close()
        plans = []
        for r in rows:
            d = dict(r)
            d["breakfast"] = json.loads(d["breakfast"])
            d["lunch"] = json.loads(d["lunch"])
            d["snack"] = json.loads(d["snack"])
            d["dinner"] = json.loads(d["dinner"])
            d["nutrition_summary"] = json.loads(d["nutrition_summary"])
            d["targets"] = json.loads(d["targets"]) if d.get("targets") else {}
            plans.append(d)
        return plans

    @staticmethod
    def delete_plan(user_id: str, plan_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM diet_plans WHERE plan_id = ? AND user_id = ?", (plan_id, user_id))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()
        return rows_affected > 0

# File Metadata Repository
class FileMetadataRepository:
    @staticmethod
    def record_file(user_id: str, filename: str, storage_path: str, file_size: int, content_type: str) -> Dict[str, Any]:
        file_id = str(uuid.uuid4())
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO user_files (file_id, user_id, filename, storage_path, file_size, content_type)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (file_id, user_id, filename, storage_path, file_size, content_type)
        )
        conn.commit()
        conn.close()
        return FileMetadataRepository.get_file(user_id, file_id)

    @staticmethod
    def get_file(user_id: str, file_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_files WHERE file_id = ? AND user_id = ?", (file_id, user_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def list_files(user_id: str) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_files WHERE user_id = ? ORDER BY uploaded_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def delete_file(user_id: str, file_id: str) -> Optional[str]:
        """Deletes record and returns storage_path to delete physical blob."""
        record = FileMetadataRepository.get_file(user_id, file_id)
        if not record:
            return None
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_files WHERE file_id = ? AND user_id = ?", (file_id, user_id))
        conn.commit()
        conn.close()
        return record["storage_path"]

# Intake Tracker Repository
class IntakeRepository:
    @staticmethod
    def log_intake(user_id: str, intake_data: Dict[str, Any]) -> Dict[str, Any]:
        intake_id = str(uuid.uuid4())
        from datetime import timezone
        date_str = intake_data.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO intake_logs (
                intake_id, user_id, date, food_name, portion_g, calories,
                protein_g, carbs_g, fat_g, meal_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                intake_id,
                user_id,
                date_str,
                intake_data.get("food_name"),
                float(intake_data.get("portion_g", 100)),
                float(intake_data.get("calories", 0)),
                float(intake_data.get("protein_g", 0)),
                float(intake_data.get("carbs_g", 0)),
                float(intake_data.get("fat_g", 0)),
                intake_data.get("meal_type", "snack")
            )
        )
        conn.commit()
        conn.close()
        return {
            "intake_id": intake_id,
            "user_id": user_id,
            "date": date_str,
            **intake_data
        }

    @staticmethod
    def get_daily_logs(user_id: str, date: str) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM intake_logs WHERE user_id = ? AND date = ? ORDER BY logged_at ASC",
            (user_id, date)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_daily_summary(user_id: str, date: str) -> Dict[str, Any]:
        logs = IntakeRepository.get_daily_logs(user_id, date)
        total_cal = sum(item["calories"] for item in logs)
        total_p = sum(item["protein_g"] for item in logs)
        total_c = sum(item["carbs_g"] for item in logs)
        total_f = sum(item["fat_g"] for item in logs)
        return {
            "date": date,
            "items_count": len(logs),
            "total_calories": round(total_cal, 1),
            "total_protein_g": round(total_p, 1),
            "total_carbs_g": round(total_c, 1),
            "total_fat_g": round(total_f, 1),
            "logs": logs
        }

    @staticmethod
    def delete_log(user_id: str, intake_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM intake_logs WHERE intake_id = ? AND user_id = ?", (intake_id, user_id))
        count = cursor.rowcount
        conn.commit()
        conn.close()
        return count > 0

# Auto-initialize database schema
init_db()
