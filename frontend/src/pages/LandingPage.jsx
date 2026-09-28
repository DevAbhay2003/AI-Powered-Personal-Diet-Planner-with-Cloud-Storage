import React from "react";
import { Cloud, Cpu, Database, HardDrive, ShieldCheck, ArrowRight, Zap, CheckCircle2, PlayCircle, BarChart3, Wifi } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function LandingPage({ onGetStarted, onDemoLogin, onOpenCloudModal }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Cloud size={16} className="text-primary" />
          <span>Cloud Computing Course Project • Production-Grade Architecture</span>
        </div>
        <h1 className="hero-title">
          AI-Powered Personal Diet Planner <br />
          <span className="gradient-text">with Centralized Cloud Storage</span>
        </h1>
        <p className="hero-description">
          An enterprise-style cloud web application demonstrating SaaS, PaaS, Cloud Databases, Object Storage, and AI-driven personalization with resilient offline fallback.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
            Launch Cloud App <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onDemoLogin}>
            <PlayCircle size={18} /> Instant 1-Click Demo
          </button>
          <button className="btn btn-outline btn-lg" onClick={onOpenCloudModal}>
            <Cloud size={18} /> Inspect Architecture
          </button>
        </div>

        <div className="hero-disclaimer-wrapper">
          <DisclaimerBanner compact={true} />
        </div>
      </section>

      {/* Cloud Computing Concepts Grid */}
      <section className="concepts-section">
        <div className="section-header">
          <span className="section-tag">Core Syllabus Demonstration</span>
          <h2>Cloud Computing Concepts in Action</h2>
          <p>Every layer of this application aligns directly with cloud computing industry paradigms.</p>
        </div>

        <div className="concepts-grid">
          <div className="concept-card">
            <div className="concept-icon-box bg-blue">
              <Cloud size={24} />
            </div>
            <h3>SaaS & PaaS Delivery</h3>
            <p>
              Provides a Software as a Service (SaaS) web portal backed by a Platform as a Service (PaaS) Python FastAPI backend deployed on cloud container infrastructure.
            </p>
            <span className="concept-label">Multi-Device Access</span>
          </div>

          <div className="concept-card">
            <div className="concept-icon-box bg-purple">
              <Database size={24} />
            </div>
            <h3>Centralized Cloud Database</h3>
            <p>
              Stores structured user profiles, biometrics, diet plans, and daily intake logs with relational schemas and strict per-user tenancy isolation.
            </p>
            <span className="concept-label">Relational & Indexed DB</span>
          </div>

          <div className="concept-card">
            <div className="concept-icon-box bg-orange">
              <HardDrive size={24} />
            </div>
            <h3>Cloud Object Storage</h3>
            <p>
              Demonstrates unstructured binary storage (S3/Blob bucket) for user meal photos, health documents, and exported JSON/TXT diet plans.
            </p>
            <span className="concept-label">S3 / Bucket Architecture</span>
          </div>

          <div className="concept-card">
            <div className="concept-icon-box bg-green">
              <Cpu size={24} />
            </div>
            <h3>AI Engine & Resilient Fallback</h3>
            <p>
              Integrates Cloud LLMs (Gemini) with automatic fallback to a Mifflin-St Jeor knapsack rule engine if API quotas or network disruptions occur.
            </p>
            <span className="concept-label">Fault Tolerant AI</span>
          </div>

          <div className="concept-card">
            <div className="concept-icon-box bg-red">
              <ShieldCheck size={24} />
            </div>
            <h3>Cloud Security & Auth</h3>
            <p>
              Secured with JWT (JSON Web Tokens), Bcrypt password hashing, stateless authorization headers, CORS controls, and parameter sanitization.
            </p>
            <span className="concept-label">Zero-Trust Isolation</span>
          </div>

          <div className="concept-card">
            <div className="concept-icon-box bg-cyan">
              <Wifi size={24} />
            </div>
            <h3>IoT Edge Telemetry</h3>
            <p>
              Simulates ESP32 microcontrollers with HX711 load cell smart scales sending REST telemetry to automatically log weighed food portions.
            </p>
            <span className="concept-label">Edge & Cloud Integration</span>
          </div>
        </div>
      </section>

      {/* Cloud Architecture Flow */}
      <section className="architecture-flow-section">
        <div className="section-header">
          <span className="section-tag">System Data Flow</span>
          <h2>End-to-End Cloud Flow</h2>
        </div>

        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-num">1</div>
            <h4>User Browser (SaaS)</h4>
            <p>React SPA frontend authenticates and submits user biometrics.</p>
          </div>
          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">2</div>
            <h4>API Gateway / Backend (PaaS)</h4>
            <p>FastAPI validates JWT, sanitizes input, and routes requests.</p>
          </div>
          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">3</div>
            <h4>AI & Fallback Engine</h4>
            <p>Calculates Mifflin-St Jeor targets and synthesizes meal plans.</p>
          </div>
          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">4</div>
            <h4>Cloud DB & Object Store</h4>
            <p>Stores structured metrics in DB and exports plans to S3 bucket.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
