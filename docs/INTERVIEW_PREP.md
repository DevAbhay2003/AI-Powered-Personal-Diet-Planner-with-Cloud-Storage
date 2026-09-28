# Cloud Computing Interview Preparation & Viva Voce Guide
## AI-Powered Personal Diet Planner with Cloud Storage

---

### Question 1: Explain your project.
**Answer:**
> "In this project, I engineered an industry-oriented cloud application titled **'AI-Powered Personal Diet Planner with Cloud Storage'**. The core objective was to demonstrate foundational cloud computing concepts—such as multi-tenant architecture, centralized cloud databases, cloud object storage, and fault-tolerant AI orchestration—rather than just building a standalone fitness utility.
>
> From a software architecture perspective:
> - **Client Layer (SaaS):** A modern React single-page application built with Vite and responsive CSS that provides cross-device access.
> - **Application Layer (PaaS):** A high-performance Python FastAPI REST API with structured Pydantic data validation and stateless JSON Web Token (JWT) authentication.
> - **Data Layer (Cloud Database):** Centralized relational database storing user biometrics, calculated Mifflin-St Jeor BMR/TDEE targets, meal plans, and daily intake ledgers with strict tenancy isolation.
> - **Storage Layer (Cloud Object Storage):** An isolated blob/bucket storage system partitioned by user ID to store unstructured files like meal photos and exported JSON/TXT diet plans.
> - **AI & Edge Layer:** A hybrid recommendation engine combining Cloud LLM generation (Google Gemini API) with a 100% resilient rule-based knapsack optimization fallback, along with an IoT endpoint capable of receiving real-time portion telemetry from an ESP32 microcontroller with an HX711 load cell smart scale."

---

### Question 2: Why is Cloud Computing essential for this project compared to a local desktop software?
**Answer:**
> "A local desktop application confines user data, configuration, and compute logic to a single physical machine. Cloud computing provides three critical advantages:
> 1. **Centralized Data & Ubiquitous Access (SaaS):** A user can generate a diet plan on their laptop, weigh their lunch using an edge IoT scale connected to WiFi, and review their intake on their smartphone without data drift.
> 2. **Decoupled Scalability & Microservices:** The frontend static assets, REST API servers, database, and object storage can scale independently across elastic cloud clusters based on load.
> 3. **Managed High Availability & Backups:** Cloud databases and object stores provide automated replication, point-in-time snapshots, and 99.99% service level agreements (SLAs) that prevent local hardware data loss."

---

### Question 3: What is the fundamental difference between Cloud Database and Cloud Object Storage in your project?
**Answer:**
> "I deliberately integrated both to highlight their architectural distinctions:
> - **Cloud Database (Structured Data):** Designed for transactional, row-and-column or document-based structured records that require high-speed indexing, relational integrity, querying, and filtering. In my project, this includes user account records, profile biometrics (age, height, weight), target macronutrient targets, and daily intake logs.
> - **Cloud Object Storage (Unstructured Blobs):** Designed for immutable or semi-structured binary objects (BLOBs) stored under unique keys in a bucket without requiring an execution schema. In my project, this stores user-uploaded meal prep images, nutritional labels, health PDFs, and exported diet plan files. Storing large binary files in a relational database degrades query latency and wastes buffer pool memory, so delegating them to object storage optimizes system throughput and minimizes cost."

---

### Question 4: How does your AI recommendation engine work, and how did you guarantee high availability?
**Answer:**
> "The engine operates on a hybrid, two-tier architecture:
> 1. **Version A (Rule-Based Optimization Engine):** Computes Basal Metabolic Rate (BMR) using the clinically validated Mifflin-St Jeor formula, scales it by the user's Physical Activity Level (PAL) to determine Total Daily Energy Expenditure (TDEE), and applies a target offset (-15% deficit for fat loss, +15% surplus for muscle hypertrophy). It then runs a greedy knapsack algorithm across a curated food catalog (`food_data.json`), filtering out user-specified allergens (such as lactose or gluten) and categorizing dishes across Breakfast (25%), Lunch (35%), Snack (15%), and Dinner (25%).
> 2. **Version B (Cloud LLM API):** Formats user biometrics and dietary preferences into a strict JSON-schema prompt dispatched to Google Gemini API.
> 3. **Resilient Fallback Mechanism:** External cloud APIs are prone to rate limits, quota exhaustion, network partitions, or outages. If the external AI call fails or lacks an API key, my backend catches the exception, logs the event, and transparently switches to the local deterministic rule-based engine. This guarantees **100% application uptime** without crashing."

---

### Question 5: How did you implement user security and data isolation?
**Answer:**
> "I implemented multi-layered defense-in-depth:
> - **Authentication:** Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` with 12 computational rounds. On successful login, the server issues a cryptographically signed JSON Web Token (JWT) with a configured expiration time.
> - **Stateless Authorization:** Protected REST endpoints enforce token validation via FastAPI dependencies (`get_current_user`). The decoded token subject (`sub`) verifies identity on every request.
> - **Tenancy Isolation:** Every database query filtering diet plans, intake logs, or files enforces `WHERE user_id = current_user_id`. If User B attempts to access `/api/plans/{alice_plan_id}` or download Alice's stored image, the server returns an HTTP 404/403 status code. User A can never read or mutate User B's records.
> - **Input Validation & Sanitization:** Pydantic schemas enforce type bounds (e.g., age between 10 and 120, positive portion weights) to prevent SQL injection, path traversal, and buffer overflow attacks."

---

### Question 6: What role do REST APIs play in your system architecture?
**Answer:**
> "REST APIs decouple the user interface from backend business logic. By utilizing standard HTTP methods (`GET` for fetching plans, `POST` for generating and saving, `PUT` for biometrics updates, and `DELETE` for log removals) and JSON serialization, the backend remains completely stateless.
>
> This separation provides two major cloud benefits:
> 1. The React frontend can be served via a lightweight Content Delivery Network (CDN) or static hosting like Vercel/Firebase Hosting.
> 2. The Python FastAPI backend can run on autoscaling container instances (such as Google Cloud Run or AWS ECS) without sticky sessions."

---

### Question 7: How does the IoT Smart Scale module integrate with the cloud architecture?
**Answer:**
> "Digital health platforms increasingly rely on edge telemetry to reduce human logging error. I incorporated an IoT endpoint (`GET /api/intake/iot/ingest`) that simulates an ESP32 microcontroller interfaced with an HX711 24-bit Analog-to-Digital Converter and a load cell.
>
> When a user places food on the scale, the microcontroller reads the strain gauge resistance, converts it to grams using a calibrated scale factor, and issues an HTTP request over WiFi. The cloud backend receives the telemetry, matches the food catalog macronutrient density, computes exact calories and protein, and updates the user's daily cloud intake record in real time."

---

### Question 8: How would you scale this architecture to support 100,000 active users?
**Answer:**
> "Scaling from a prototype to a high-throughput enterprise workload requires decoupling each tier:
> 1. **Client Tier:** Distribute the React static build across a global CDN (such as Cloudflare or AWS CloudFront) to cache assets at edge locations with sub-50ms latency.
> 2. **Application Tier:** Deploy stateless FastAPI containers inside a managed Kubernetes cluster (EKS/GKE) or serverless container service (Cloud Run) managed by a Cloud Load Balancer with autoscaling triggered by CPU utilization and request concurrency.
> 3. **Database Tier:** Migrate from single-instance SQLite to a managed cloud database like Amazon Aurora PostgreSQL or Google Cloud Firestore with read replicas, connection pooling (PgBouncer), and multi-AZ failover.
> 4. **Caching Layer:** Place Redis (AWS ElastiCache) in front of the database to cache frequently accessed user profiles and food catalogs, drastically lowering database IOPS.
> 5. **Asynchronous Task Queue:** Offload heavy PDF report rendering or batch weekly caloric adjustments to background workers using Celery and message brokers like RabbitMQ or AWS SQS."

---

### Question 9: How did you test your application to prove correctness?
**Answer:**
> "I developed an automated test suite using `pytest` and FastAPI's `TestClient` covering critical operational paths:
> - User registration, duplicate email rejection, and bcrypt authentication.
> - Invalid credential rejection and expired token handling.
> - Mifflin-St Jeor biometric formula calculations and target adjustments.
> - Allergen exclusion (verifying lactose or gluten dishes are excluded for intolerant users).
> - AI fallback resilience (ensuring generation succeeds even when external API credentials are absent).
> - Strict user isolation (verifying User B cannot access User A's diet plan or cloud files).
> - Binary object storage upload, download stream integrity, and file deletion.
> - Simulated ESP32 IoT scale HTTP telemetry ingestion."

---

### Question 10: How can this project be evolved in the future?
**Answer:**
> "Several production-grade enhancements can be added:
> 1. **Infrastructure as Code (IaC):** Codifying cloud infrastructure provisioning using Terraform or AWS CDK.
> 2. **Computer Vision Meal Recognition:** Incorporating a Vision AI model to classify meal photos uploaded to Cloud Storage and estimate portion sizes automatically.
> 3. **CI/CD Automation:** Implementing GitHub Actions workflows to run unit tests, linting, Docker image building, and automated deployment to cloud registries on every `git push`.
> 4. **Push Notifications:** Integrating Firebase Cloud Messaging (FCM) or AWS SNS for automated hydration reminders and meal logging prompts.
> 5. **Regulatory Compliance:** Any future medical or therapeutic application would necessitate HIPAA/GDPR health data compliance and validation by certified clinical dietitians."
