# 🏙️ CIVICX — AI-Powered Infrastructure Risk & Municipal Decision Intelligence Platform

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](SECURITY.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)

**“Predict the Risk. Prioritize the Fix. Simulate the Future.”**

*Transforming fragmented municipal infrastructure telemetry into explainable, predictive, and budget-optimized capital maintenance decisions.*

[🌐 Live Deployment](#-live-deployment--demo-links) • [📖 Documentation](#-system-architecture) • [🚀 Quickstart](#-quickstart--local-setup) • [📡 REST API](#-rest-api-catalog) • [🛡️ Security](SECURITY.md) • [📜 License](LICENSE)

</div>

---

## 🌐 Live Deployment & Demo Links

| Service | Target URL | Status | Description |
|---|---|---|---|
| **Web Application** | `https://civicx.vercel.app` *(or configured Vercel deployment)* | 🟢 Production | Full interactive React + Leaflet GIS frontend |
| **Backend REST API** | `https://civicx-backend.onrender.com` | 🟢 Active | FastAPI microservice engine with Swagger Docs |
| **API Documentation** | `https://civicx-backend.onrender.com/docs` | 🟢 Interactive | OpenAPI 3.0 interactive Swagger UI |
| **GitHub Repository** | `https://github.com/Pooja-Sri01/CIVICX` | 🟢 Main | Source code, test suites & CI configs |

> **Note for GitHub Repository Setup**: You can add your live deployment URL directly in the **"About"** section of this GitHub repository by clicking the ⚙️ (gear icon) next to "About" on the repository homepage and pasting the link in the **Website** field.

---

## 🏛️ Executive Overview

| Dimension | Details |
|---|---|
| **Problem** | Municipalities traditionally react only after catastrophic failures occur (e.g. monsoon inundations, pothole clusters, bridge joint fatigue). Maintenance decisions are fragmented across silos, reactive (FIFO), and lack predictive lifecycle trade-off simulation. |
| **Solution** | An end-to-end municipal decision intelligence pipeline that ingests inspection data, applies deterministic multi-criteria risk scoring, ranks interventions by lifecycle ROI, optimizes capital allocation under fiscal caps via knapsack algorithms, and simulates future deterioration decay curves. |
| **Pilot Zone** | Coimbatore City Municipal Corporation, Tamil Nadu, India (78 Geocoded Infrastructure Assets across 5 Zones: North, South, East, West, Central). |

---

## 🧠 System Architecture

```
                                  CIVICX ARCHITECTURE PIPELINE
                                  
  [ CITIZEN & SENSOR INGESTION ]         [ AI COMPUTER VISION LAYER ]          [ MUNICIPAL INTELLIGENCE ]
  +----------------------------+         +--------------------------+         +--------------------------+
  | - Citizen Defect Upload    |         | - RDD2022 Defect Models  |         | - 6-Factor MCDA Engine   |
  | - Geolocation & Exif Fix   |  ====>  | - Pavement Distress Loc  |  ====>  | - Urgency/Cost Ranking   |
  | - IoT Telemetry & Logs     |         | - Structural Degradation |         | - Knapsack Optimizer     |
  +----------------------------+         +--------------------------+         +--------------------------+
                                                                                            |
                                                                                            v
  [ EXECUTIVE DECISION OUTPUT ]          [ 5-YEAR TIME MACHINE ]               [ AUDIT & CITIZEN LOOP ]
  +----------------------------+         +--------------------------+         +--------------------------+
  | - Automated Decision Brief |  <====  | - Non-Linear Decay Sim   |  <====  | - Immutable Audit Log    |
  | - GIS Risk Heatmap         |         | - Delay Cost Escalation  |         | - Citizen Reward Points  |
  | - One-Click Work Orders    |         | - Preventative Savings   |         | - Transparent Validation |
  +----------------------------+         +--------------------------+         +--------------------------+
```

### Core Decision Engines

1. **Deterministic Risk Engine (`risk_engine.py`)**: Computes a normalized multi-factor risk index ($0–100$) combining:
   - Condition Deficit ($25\%$)
   - Damage Severity ($25\%$)
   - Network Criticality ($20\%$)
   - Usage Loading ($15\%$)
   - Historical Deterioration Trend ($10\%$)
   - Environmental Stress ($5\%$)
2. **Explainable Priority Engine (`priority_engine.py`)**: Value-ranks interventions using urgency-to-cost scaling with human-readable natural language justifications ("Why is Asset RD-1042 Rank #1?").
3. **Knapsack Budget Optimizer (`budget_optimizer.py`)**: Solves greedy ROI-per-rupee portfolio optimization ($\Delta R / \text{Cost}$) under user-adjusted municipal capital caps.
4. **City Time Machine (`simulation_engine.py`)**: Projects 3, 6, and 12-month decay trajectories and quantifies delay penalties (+52% at 6 months, +145% at 12 months).
5. **Citizen Civic Intelligence Layer (`audit_service.py` & `citizen_service.py`)**: Gamified civic engagement with automated point incentives, status timelines, and audit trails.

---

## 👥 Dual Persona Workflows

### 1. Municipal Authority / City Engineer
- **Command Center (`/dashboard`)**: Macro KPI metrics, high-risk asset alerts, and dynamic priority queues.
- **GIS Risk Map (`/map`)**: Interactive spatial map with color-coded risk markers and asset drilldowns.
- **Asset Intelligence (`/assets/:id`)**: Comprehensive breakdown of structural stress vectors, AI vision inference, and maintenance history.
- **Budget Optimizer (`/budget`)**: Interactive fiscal slider simulating maximum risk mitigation per rupee spent.
- **Time Machine (`/simulation`)**: Multi-year decay simulations comparing immediate repair vs delayed action.
- **Civic Intake (`/civic-reports`)**: Validation, work-order assignment, and resolution workflow for citizen defect reports.

### 2. Citizen Civic Intelligence
- **Citizen Portal (`/citizen`)**: Personal civic impact dashboard, verified reports, and civic points balance.
- **Report Defect (`/citizen/report`)**: Photo upload, defect classification, geolocation picker, and automated reward credits.
- **My Complaints (`/citizen/my-reports`)**: Real-time lifecycle tracking (Submitted → Under Review → Validated → In Progress → Resolved).
- **Rewards & Wallet (`/citizen/rewards`)**: Civic points redemption for non-financial incentives (e.g. municipal certificates, public transit perks).
- **Civic Champions (`/citizen/leaderboard`)**: Gamified community recognition with pseudonymized privacy protection.
- **Impact (`/citizen/impact`)**: Quantified civic contributions and repairs completed in Ward 24 (Gandhipuram) and Coimbatore.

---

## 💻 Technology Stack

```
Frontend:   React 18 • TypeScript • Vite • Tailwind CSS • Lucide Icons • Leaflet • Recharts • Motion
Backend:    Python 3.10+ • FastAPI • SQLAlchemy • Pydantic v2 • NumPy • Pandas • Scikit-learn
Database:   SQLite (zero-config local) / PostgreSQL (production) with automatic schema migration
Deployment: Vercel (Frontend Static) • Render (FastAPI Web Service)
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### 1. Backend Setup
```bash
# From repository root
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed database with 78 Coimbatore infrastructure assets
cd ..
python seed.py

# Start FastAPI server (runs on port 8000)
python -m uvicorn backend.app.main:app --reload --port 8000
```
*Backend API available at: `http://localhost:8000`*  
*Swagger Documentation available at: `http://localhost:8000/docs`*

### 2. Frontend Setup
```bash
# In a new terminal, from repository root
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend Application available at: `http://localhost:5173`*

### 3. Automated Regression & Quality Assurance Tests
```bash
# Run backend test suite (24 end-to-end tests)
cd backend
python test_complete_regression.py

# Run frontend production build & typecheck
cd ../frontend
npm run build
```

---

## 📡 REST API Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database connectivity |
| `GET` | `/api/dashboard/summary` | Real-time municipal dashboard KPIs |
| `GET` | `/api/assets` | Query 78 geocoded assets with multi-parameter filtering |
| `GET` | `/api/assets/{id}` | Single asset telemetry, condition score, and coordinates |
| `GET` | `/api/priorities` | Value-ranked priority queue with explainable justifications |
| `POST` | `/api/budget/optimize` | Knapsack portfolio optimizer maximizing risk reduction under budget |
| `POST` | `/api/simulation/run` | 3, 6, 12-month decay forecasting and delay cost calculation |
| `GET` | `/api/citizen/reports` | Public civic defect reports feed |
| `POST` | `/api/citizen/reports` | Submit new citizen observation with image and location |
| `POST` | `/api/civic-reports/{id}/validate` | Municipal engineer validation (+50 citizen pts) |
| `POST` | `/api/civic-reports/{id}/resolve` | Mark repair as resolved (+250 citizen pts) |
| `GET` | `/api/citizen/rewards/wallet` | Query citizen reward point balance and transaction history |
| `POST` | `/api/copilot/chat` | AI Copilot natural language municipal querying |

---

## 🛡️ Security & Privacy

- **Security Policy**: See [SECURITY.md](SECURITY.md) for vulnerability disclosure and reporting guidelines.
- **Privacy Protection**: Citizen emails, phone numbers, and exact home coordinates are pseudonymized by default on community leaderboards.
- **Audit Trails**: All status transitions, point awards, and redemptions generate immutable audit log entries.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Developed for Coimbatore City Municipal Corporation • Built with ❤️ by Pooja-Sri01 & the CIVICX Team</sub>
</div>
