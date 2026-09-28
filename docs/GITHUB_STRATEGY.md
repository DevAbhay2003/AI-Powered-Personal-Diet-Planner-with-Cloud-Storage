# GitHub Development Roadmap & Upload Strategy
## AI-Powered Personal Diet Planner with Cloud Storage

To make your GitHub repository look authentic, placement-ready, and genuinely engineered step-by-step, follow this day-wise commit plan rather than uploading all files in a single initial commit.

---

### Step 0: Git Initialization Commands

Run these commands inside the project root:
```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AI-Powered-Personal-Diet-Planner-Cloud.git
```

---

### Day-Wise Development Roadmap (12-Day Plan)

#### Day 1: Architecture & Repository Setup
- **Files:** `README.md`, `.gitignore`, `.env.example`, `requirements.txt`, `sample_data/`
- **Git Commit:**
  ```bash
  git add .gitignore .env.example requirements.txt sample_data/ README.md
  git commit -m "Initialize repository and cloud architecture specification"
  ```
- **Screenshot to Capture:** `01_project_structure.png` (Folder layout in VS Code / IDE)
- **What it Proves:** Clear architectural planning before writing code.

#### Day 2: Frontend Scaffolding & Design System
- **Files:** `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/index.css`, `frontend/src/App.css`
- **Git Commit:**
  ```bash
  git add frontend/
  git commit -m "Scaffold Vite React frontend with modern responsive design system"
  ```
- **Screenshot to Capture:** `02_landing_page.png` (Landing page hero and cloud concepts)
- **What it Proves:** Proficiency with modern React SPAs and responsive UI styling.

#### Day 3: Backend REST API Framework
- **Files:** `backend/app.py`, `backend/utils/config.py`, `backend/models/schemas.py`
- **Git Commit:**
  ```bash
  git add backend/
  git commit -m "Implement FastAPI application core, CORS middleware, and Pydantic schemas"
  ```
- **Screenshot to Capture:** `03_swagger_docs.png` (FastAPI interactive Swagger UI at `/docs`)
- **What it Proves:** Industry-standard REST API schema validation and documentation.

#### Day 4: Authentication & Security Module
- **Files:** `backend/utils/security.py`, `backend/routes/auth.py`, `frontend/src/pages/AuthPage.jsx`
- **Git Commit:**
  ```bash
  git add backend/utils/security.py backend/routes/auth.py frontend/src/pages/AuthPage.jsx
  git commit -m "Add JWT authentication, bcrypt password hashing, and login/register views"
  ```
- **Screenshot to Capture:** `04_registration_and_login.png` (Auth page with 1-click demo button)
- **What it Proves:** Secure token handling, cryptographic salting, and route guards.

#### Day 5: Centralized Cloud Database Service
- **Files:** `cloud/database_service.py`, `backend/routes/profile.py`, `frontend/src/pages/ProfilePage.jsx`
- **Git Commit:**
  ```bash
  git add cloud/database_service.py backend/routes/profile.py frontend/src/pages/ProfilePage.jsx
  git commit -m "Implement cloud database service with user isolation and biometric profile sync"
  ```
- **Screenshot to Capture:** `05_profile_and_targets.png` (Profile view with calculated BMR/TDEE)
- **What it Proves:** Database relational design and tenancy isolation.

#### Day 6: AI Food Catalog & Recommendation Logic
- **Files:** `ai_engine/food_data.json`, `ai_engine/diet_engine.py`
- **Git Commit:**
  ```bash
  git add ai_engine/
  git commit -m "Implement Mifflin-St Jeor BMR calculator and knapsack meal allocation engine"
  ```
- **Screenshot to Capture:** `06_food_catalog.png` (Food database and macro distribution logic)
- **What it Proves:** Algorithmic optimization and nutritional mathematical modeling.

#### Day 7: Resilient AI Engine & Plan Generation API
- **Files:** `backend/routes/plans.py`, `frontend/src/pages/GeneratePlanPage.jsx`
- **Git Commit:**
  ```bash
  git add backend/routes/plans.py frontend/src/pages/GeneratePlanPage.jsx
  git commit -m "Add plan generation REST API with Cloud LLM integration and offline fallback"
  ```
- **Screenshot to Capture:** `07_generated_plan_result.png` (Meal plan breakdown cards)
- **What it Proves:** Fault-tolerant AI design with graceful degradation.

#### Day 8: Cloud Object Storage Integration
- **Files:** `cloud/storage_service.py`, `backend/routes/files.py`, `frontend/src/pages/CloudFilesPage.jsx`
- **Git Commit:**
  ```bash
  git add cloud/storage_service.py backend/routes/files.py frontend/src/pages/CloudFilesPage.jsx cloud_storage_bucket/
  git commit -m "Add cloud object storage bucket service for file uploads and plan exports"
  ```
- **Screenshot to Capture:** `08_cloud_storage_bucket.png` (Files explorer showing stored objects)
- **What it Proves:** Understanding the difference between Cloud Database and Object Storage.

#### Day 9: User Dashboard & Saved Plans Manager
- **Files:** `frontend/src/pages/DashboardPage.jsx`, `frontend/src/pages/SavedPlansPage.jsx`
- **Git Commit:**
  ```bash
  git add frontend/src/pages/DashboardPage.jsx frontend/src/pages/SavedPlansPage.jsx
  git commit -m "Build user analytics dashboard and cloud database saved plans manager"
  ```
- **Screenshot to Capture:** `09_user_dashboard.png` (Tenant dashboard with metrics and adherence)
- **What it Proves:** Complete SaaS user experience and multi-view state synchronization.

#### Day 10: IoT Smart Scale Edge Simulation & Intake Tracker
- **Files:** `backend/routes/intake.py`, `frontend/src/pages/IntakeTrackerPage.jsx`
- **Git Commit:**
  ```bash
  git add backend/routes/intake.py frontend/src/pages/IntakeTrackerPage.jsx
  git commit -m "Implement intake tracker and ESP32 HX711 virtual IoT smart scale telemetry"
  ```
- **Screenshot to Capture:** `10_iot_smart_scale.png` (Virtual scale weighing simulator with UART logs)
- **What it Proves:** Edge-to-cloud IoT data ingestion.

#### Day 11: Automated Test Suite & Containerization
- **Files:** `tests/test_api.py`, `Dockerfile`, `docker-compose.yml`
- **Git Commit:**
  ```bash
  git add tests/ Dockerfile docker-compose.yml
  git commit -m "Add automated pytest suite, Dockerfile, and docker-compose orchestration"
  ```
- **Screenshot to Capture:** `11_test_execution_pass.png` (Terminal showing 100% passed pytests)
- **What it Proves:** Production verification, test coverage, and container readiness.

#### Day 12: Project Documentation & Final Release
- **Files:** `docs/`, `screenshots/`, updated `README.md`
- **Git Commit:**
  ```bash
  git add docs/ screenshots/ README.md
  git commit -m "Finalize comprehensive documentation, viva guide, and project report"
  git push -u origin main
  ```
- **Screenshot to Capture:** `12_github_readme_preview.png` (Rendered GitHub repository homepage)
- **What it Proves:** Polished, professional presentation ready for recruiters and evaluators.
