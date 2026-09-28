# AI-Powered Personal Diet Planner with Cloud Storage 🥗☁️

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://www.python.org)
[![Cloud Storage](https://img.shields.io/badge/Cloud%20Storage-S3%20%2F%20Blob-FF9900.svg?style=flat&logo=AmazonS3&logoColor=white)](https://aws.amazon.com/s3/)
[![JWT Auth](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-000000.svg?style=flat&logo=JSONWebTokens&logoColor=white)](https://jwt.io)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-success.svg?style=flat&logo=Pytest&logoColor=white)](https://pytest.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE)

> **Industry-grade Cloud Computing Course Capstone Project:** A distributed, multi-tenant diet planning and wellness monitoring web platform featuring centralized relational cloud database storage, partitioned cloud object storage (S3/Blob), edge IoT smart scale telemetry (ESP32), and a hybrid AI recommendation engine with **100% resilient offline fallback**.

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Problem Statement & Why Cloud Matters](#-problem-statement--why-cloud-matters)
- [Core Features](#-core-features)
- [Cloud Computing Concepts Demonstrated](#-cloud-computing-concepts-demonstrated)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Technology Stack Options](#-technology-stack-options)
- [Database & Storage Design](#-database--storage-design)
- [AI Recommendation Engine & Resilient Fallback](#-ai-recommendation-engine--resilient-fallback)
- [IoT Edge Telemetry (ESP32 + HX711)](#-iot-edge-telemetry-esp32--hx711)
- [Authentication & Security](#-authentication--security)
- [REST API Reference](#-rest-api-reference)
- [Project Folder Structure](#-project-folder-structure)
- [Local Setup & Virtual Simulation](#-local-setup--virtual-simulation)
- [Automated Testing Strategy](#-automated-testing-strategy)
- [Cloud Deployment (Render / Vercel / GCP / AWS)](#-cloud-deployment)
- [Scalability Analysis (10 → 1k → 100k Users)](#-scalability-analysis)
- [Screenshots & Proof Checklist](#-screenshots--proof-checklist)
- [Educational & Medical Disclaimer](#-educational--medical-disclaimer)
- [Author & Academic Attribution](#-author--academic-attribution)

---

## 🌟 Project Overview
The **AI-Powered Personal Diet Planner with Cloud Storage** is designed to demonstrate foundational cloud computing concepts in a tangible, highly functional application. Users can authenticate securely, input their physical biometrics, receive personalized daily meal plans calculated using clinical thermodynamic formulas (Mifflin-St Jeor), save plans into a centralized cloud database, upload health photos and documents into partitioned cloud object storage, and simulate smart scale edge hardware logging.

---

## ❓ Problem Statement & Why Cloud Matters
### The Problem:
1. **Planning Friction:** Calculating metabolic calorie expenditure and balancing macronutrients requires complex calculations that lead to user abandonment.
2. **Data Fragmentation:** Desktop fitness tools store logs on a single PC. When a user changes devices or wants to log intake from a smart scale, data drifts or is lost.
3. **Cloud Architecture Confusion:** Students often conflate structured databases with unstructured object stores or build brittle applications that crash when an external AI API reaches its quota limit.

### Why Cloud Computing Solves This:
- **Centralized Synchronization (SaaS):** The web app allows ubiquitous multi-device access across desktop browsers, tablets, and mobile devices.
- **Decoupled Architecture:** Frontend assets, stateless API servers, databases, and object buckets scale independently.
- **Fault-Tolerant Resilience:** The hybrid AI engine gracefully degrades to deterministic offline rules if external AI services experience downtime.

---

## ✨ Core Features
- 🔐 **Multi-Tenant JWT Authentication:** Secure registration, login, and bearer authorization with 12-round bcrypt salt hashing.
- ⚡ **1-Click Demo Evaluation Shortcut:** Evaluators can click a single button to auto-authenticate with demo credentials.
- 📐 **Biometrics & Energy Targets:** Automated computation of Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and target macros based on user goals (Cut, Bulk, Maintain, Fitness).
- 🥦 **Allergen & Preference Filtering:** Strict exclusion of allergens (lactose, gluten, nuts, eggs, shellfish) across Vegetarian, Vegan, and Non-Vegetarian diets.
- 🤖 **Hybrid AI Synthesis:** Google Gemini Cloud LLM integration paired with a 100% resilient rule-based knapsack optimization fallback.
- 💾 **Centralized Cloud Database:** Stores structured user profiles, diet plans, and daily intake ledgers with strict tenancy isolation.
- 🪣 **Cloud Object Storage (S3/Blob):** Upload meal prep photos and nutritional PDFs, and export diet plans to persistent cloud bucket storage.
- ⚖️ **Virtual ESP32 + HX711 IoT Smart Scale:** Interactive edge microcontroller simulator that transmits weighed portions over HTTP REST endpoints directly into the cloud intake ledger.
- 🔍 **Live Cloud Architecture Inspector:** Built-in modal displaying live PaaS compute status, database latency, storage bucket isolation, and security protocols.

---

## ☁️ Cloud Computing Concepts Demonstrated

| Concept | Implementation in this Project |
|---------|--------------------------------|
| **SaaS (Software as a Service)** | Cross-device React SPA accessible via browser without installation. |
| **PaaS (Platform as a Service)** | Python FastAPI microservice deployed on containerized application hosts. |
| **IaaS (Infrastructure as a Service)** | Underlying virtual hosts, SSD persistent disk volumes, and networking. |
| **Cloud Database (Structured)** | Centralized relational tables (`users`, `diet_plans`, `intake_logs`) with foreign keys and tenancy indexing. |
| **Cloud Object Storage (Unstructured)** | Binary blob bucket partitioned by user ID (`cloud_storage_bucket/{user_id}/`) for files and exported plans. |
| **Stateless REST Architecture** | Client requests carry complete authentication tokens (JWT) without server session state. |
| **Fault Tolerance & Fallback** | Automated fallback to local knapsack algorithm if external AI API times out or key is missing. |
| **Edge Computing / IoT Telemetry** | Microcontroller endpoint (`/api/intake/iot/ingest`) ingesting load-cell strain gauge telemetry. |
| **Multi-Tenancy & Data Isolation** | User A cannot query or mutate User B's records or storage files (strict HTTP 404 enforcement). |

---

## 🏗️ System Architecture & Data Flow

```text
User Web Browser (SaaS Client)
              │
      HTTPS / React SPA
              ▼
   FastAPI Gateway (PaaS)
   ├── CORS Middleware
   ├── JWT Bearer Authorization
   └── Pydantic Input Validation
              │
    ┌─────────┴─────────┐
    ▼                   ▼
Cloud Database      Cloud Object Storage (S3/Blob)
(Structured Tables) (Unstructured Bucket)
 - Users & Profiles  - Meal Photos & Receipts
 - Saved Diet Plans  - Exported Plan Files (.json/.txt)
 - Daily Intake Logs - Health Documents
    ▲                   ▲
    │                   │
    ├───────────────────┘
    ▼
AI Recommendation Engine (Hybrid)
 ├── Primary: Google Gemini Cloud LLM API
 └── Fallback: Mifflin-St Jeor Knapsack Optimizer (100% Uptime)
    ▲
    │ REST GET Telemetry
Edge IoT Smart Scale (ESP32 + HX711 Load Cell)
```

---

## 🛠️ Technology Stack Options

| Option | Architecture | Difficulty | Free-Tier Feasibility | Recommendation |
|--------|--------------|------------|-----------------------|----------------|
| **Option A (Beginner)** | Vanilla HTML/CSS/JS + Flask + SQLite | Low | 100% Free | Good for simple viva, but lacks modern portfolio depth. |
| **Option B (Selected)** | **React (Vite) + FastAPI + Cloud DB + S3 Bucket + Fallback AI** | **Intermediate** | **100% Free / Local Simulated** | ⭐ **Best for placements, GitHub proof, and cloud exams.** |
| **Option C (Enterprise)** | Next.js + FastAPI + AWS Aurora + S3 + CloudFront + EKS | Advanced | Requires Paid AWS Account | High complexity and cloud billing overhead. |

---

## 🗄️ Database & Storage Design

### Cloud Database (Structured)
- **`users`:** `user_id` (PK), `name`, `email` (UNIQUE), `password_hash`, `age`, `height`, `weight`, `sex`, `activity_level`, `dietary_preference`, `goal`, `allergies`.
- **`diet_plans`:** `plan_id` (PK), `user_id` (FK), `plan_title`, `breakfast`, `lunch`, `snack`, `dinner`, `nutrition_summary`, `targets`, `generation_mode`, `created_at`.
- **`user_files`:** `file_id` (PK), `user_id` (FK), `filename`, `storage_path`, `file_size`, `content_type`, `uploaded_at`.
- **`intake_logs`:** `intake_id` (PK), `user_id` (FK), `date`, `food_name`, `portion_g`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `meal_type`.

### Cloud Object Storage (Unstructured)
- Physical partitioning: `cloud_storage_bucket/{user_id}/{unique_prefix}_{filename}`.
- Allowed extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`, `.json`, `.txt`.
- Max object size: 10 MB per upload.

---

## 🧠 AI Recommendation Engine & Resilient Fallback

### 1. Thermodynamic Calculations
- **Mifflin-St Jeor Formula for BMR:**
  - $\text{Male}: 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} + 5$
  - $\text{Female}: 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 161$
- **Total Daily Energy Expenditure (TDEE):** $TDEE = BMR \times \text{Physical Activity Level (1.2 to 1.9)}$
- **Goal Offset:** Cut ($-15\%$), Maintenance ($0\%$), Bulk ($+15\%$).

### 2. Resilient Fallback Architecture
```text
[ Client Request ] ──> [ Check Gemini API Key ]
                             ├──> Key Present & API Responsive ──> [ Return LLM Plan ]
                             └──> Key Missing / Quota / Error  ──> [ Fallback to Knapsack Optimizer ]
```
This ensures that the project can be run anywhere without requiring a paid API key or risking evaluation failures.

---

## 📡 IoT Edge Telemetry (ESP32 + HX711)

The platform supports hardware logging from a smart food scale:
- **Microcontroller:** ESP32-WROOM WiFi MCU
- **ADC:** HX711 24-bit strain gauge amplifier
- **Circuit Pinout:**
  - HX711 DT  -> ESP32 GPIO 18
  - HX711 SCK -> ESP32 GPIO 19
  - VCC       -> ESP32 3V3 (Never 5V!)
  - GND       -> ESP32 GND
- **Firmware Endpoint:** `GET /api/intake/iot/ingest?uid=USER_ID&food_id=oats_porridge&grams=175`

---

## 🔒 Authentication & Security
- **Passwords:** Hashed with random salts using `bcrypt` (12 computational rounds).
- **JWT Authorization:** Tokens signed with HS256 algorithm and configured expiration.
- **Tenancy Isolation:** Endpoints verify ownership on every read, write, or delete request.
- **Input Sanitization:** Pydantic schemas enforce type bounds and reject payload exploits.

---

## 🔌 REST API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user identity | Yes |
| `GET` | `/api/profile` | Retrieve biometrics and calculated targets | Yes |
| `PUT` | `/api/profile` | Update user metrics and preferences | Yes |
| `POST` | `/api/plans/generate` | Generate personalized meal plan | Yes |
| `POST` | `/api/plans` | Save generated plan to Cloud Database | Yes |
| `GET` | `/api/plans` | List saved plans for authenticated user | Yes |
| `GET` | `/api/plans/{id}` | Get specific plan (isolated) | Yes |
| `POST` | `/api/plans/{id}/export` | Export plan as JSON/TXT to Cloud Storage | Yes |
| `POST` | `/api/files/upload` | Upload meal photo/file to Cloud Storage | Yes |
| `GET` | `/api/files` | List files in user's cloud bucket | Yes |
| `GET` | `/api/files/{id}/download` | Stream object bytes from cloud bucket | Yes |
| `POST` | `/api/intake` | Log food portion manually | Yes |
| `GET` | `/api/intake/daily` | Get today's intake vs target adherence | Yes |
| `GET` | `/api/intake/iot/ingest` | ESP32 HX711 IoT scale weight telemetry | No (Keyed by UID) |
| `GET` | `/health` | Container liveness probe | No |
| `GET` | `/cloud-status` | Cloud architecture inspection status | No |

---

## 📁 Project Folder Structure

```text
AI-Personal-Diet-Planner-Cloud/
│
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # Navbar, DisclaimerBanner, CloudStatusModal
│   │   ├── pages/                # Dashboard, Profile, Generate, Saved, Files, Intake
│   │   ├── services/             # Centralized Axios/Fetch API client & JWT manager
│   │   ├── App.jsx               # Application root & view coordinator
│   │   ├── App.css               # Comprehensive responsive design system
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python FastAPI Application
│   ├── app.py                    # Server entry point & CORS configuration
│   ├── routes/                   # auth.py, profile.py, plans.py, files.py, intake.py
│   ├── models/                   # Pydantic schemas (schemas.py)
│   └── utils/                    # config.py, security.py (JWT + Bcrypt)
│
├── ai_engine/                    # Recommendation Engine & Nutrition Database
│   ├── diet_engine.py            # BMR/TDEE math, knapsack planner, LLM & fallback
│   └── food_data.json            # Curated catalog with calories, macros, and allergens
│
├── cloud/                        # Cloud Architecture Abstraction Layer
│   ├── database_service.py       # Centralized Cloud DB repositories & schemas
│   └── storage_service.py        # Cloud Object Storage bucket service
│
├── tests/                        # Automated Test Suite
│   └── test_api.py               # 7 comprehensive pytest test cases
│
├── sample_data/                  # Demo profiles & meal logs for presentation
├── docs/                         # INTERVIEW_PREP.md, PROJECT_REPORT.md, etc.
├── screenshots/                  # Standardized screenshots for proof of work
├── cloud_storage_bucket/         # Partitioned cloud object storage simulation
├── Dockerfile                    # Production container build specification
├── docker-compose.yml            # Multi-container orchestration
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
└── README.md                     # Project documentation
```

---

## 💻 Local Setup & Virtual Simulation

### 1. Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed

### 2. Clone & Setup Python Virtual Environment
```bash
cd AI-Personal-Diet-Planner-Cloud
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Start the Application
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
# Windows
.\venv\Scripts\python -m uvicorn backend.app:app --port 8000 --reload
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing Strategy

Run the complete test suite:
```bash
.\venv\Scripts\pytest -v tests/test_api.py
```
**Test Results: 7 Passed (100%)**
- `test_health_and_cloud_status` (Probes and architecture status)
- `test_user_registration_and_login` (Registration, duplicate check, bcrypt auth)
- `test_profile_update_and_targets` (Mifflin-St Jeor calculations)
- `test_diet_plan_generation_and_fallback` (Allergens & offline fallback resilience)
- `test_plan_persistence_and_user_isolation` (Multi-tenant security: User B cannot access User A's plan)
- `test_cloud_object_storage_and_export` (Upload, streaming download, bucket export)
- `test_iot_smart_scale_telemetry` (ESP32 HTTP telemetry ingestion)

---

## 🚀 Cloud Deployment

### Approach A: Free-Tier Deployment (Render + Vercel)
1. **Frontend:** Deploy `frontend/` to **Vercel** or **Render Static Site**. Set `VITE_API_URL` to your live backend URL.
2. **Backend:** Deploy repository to **Render Web Service** using Python or Docker environment.
3. **Environment Variables:** Set `JWT_SECRET`, `PORT=8080`, `STORAGE_PROVIDER=cloud_object_storage_simulated`.

### Approach B: Docker Containerization
```bash
docker build -t diet-planner-cloud .
docker run -p 8000:8080 diet-planner-cloud
```
Or launch using Docker Compose:
```bash
docker-compose up -d
```

---

## 📈 Scalability Analysis

| Active Users | Architecture Adaptation |
|--------------|-------------------------|
| **10 Users** | Single virtual machine / container instance handles all traffic. |
| **1,000 Users** | Horizontal scaling of FastAPI container instances behind a Cloud Load Balancer; connection pooling via PgBouncer. |
| **100,000 Users** | Decouple microservices; add Redis caching for food catalogs; utilize AWS S3 pre-signed URLs to upload images directly; queue heavy batch exports via AWS SQS / Celery. |

---

## 📸 Screenshots & Proof Checklist
Refer to [screenshots/README.md](screenshots/README.md) for full image capture guidelines:
- `01_project_structure.png` — Folder tree
- `02_landing_page.png` — Hero view
- `05_one_click_demo_login.png` — Auth view
- `06_user_profile_and_targets.png` — BMR & TDEE calculation
- `08_generated_plan_result.png` — AI meal synthesis
- `12_cloud_object_storage.png` — S3 bucket explorer
- `15_iot_smart_scale_simulator.png` — Virtual ESP32 scale
- `16_cloud_inspector_modal.png` — Cloud infrastructure probe
- `18_automated_pytest_pass.png` — Test suite execution

---

## ⚠️ Educational & Medical Disclaimer
> **IMPORTANT:** This software application is engineered strictly for **educational coursework and cloud computing demonstration purposes**. The caloric equations, macronutrient splits, and meal recommendations are calculated using generalized algorithms and do **not** constitute medical advice, clinical nutrition therapy, or dietary diagnoses. Users must consult a licensed medical professional or registered dietitian before making dietary changes.

---

## 👤 Author & Academic Attribution
- **Project:** AI-Powered Personal Diet Planner with Cloud Storage
- **Course:** Cloud Computing Capstone
- **Core Competencies:** Cloud Architecture, FastAPI, React, Cloud Database, Object Storage, IoT Telemetry, Pytest.
