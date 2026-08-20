# CIVICX — AI-Powered Infrastructure Risk & Decision Intelligence Platform

> **“Predict the Risk. Prioritize the Fix. Simulate the Future.”**

CIVICX transforms fragmented municipal infrastructure telemetry into explainable, predictive, and budget-optimized capital maintenance decisions for city authorities.

---

## 🏛️ Executive Overview

| Dimension | Details |
|---|---|
| **Problem** | Cities react after catastrophic failures occur (e.g. monsoon inundations, pothole clusters, bridge joint fatigue). Maintenance decisions are fragmented across silos, reactive (FIFO), and lack predictive lifecycle trade-off simulation. |
| **Solution** | An end-to-end municipal decision intelligence pipeline that ingests inspection data, applies deterministic multi-criteria risk scoring, ranks interventions by lifecycle ROI, optimizes capital allocation under fiscal caps via knapsack algorithms, and simulates future deterioration decay curves. |
| **Demo City** | Coimbatore City Corporation, Tamil Nadu, India (78 Geocoded Infrastructure Assets across 5 Zones). |

---

## 🧠 Decision Intelligence Architecture

```
DATA INGESTION → VISION DETECT → RISK PREDICT → PRIORITIZE → EXPLAIN → OPTIMIZE → SIMULATE → ACT
  (IoT/Citizen)     (RDD2022)      (6-Factor MCDA)  (Urgency/Cost)  (Why Rank) (Knapsack)  (Time Machine) (Exec Brief)
```

1. **AI Inspection & Localization**: Drop-in interface structured for models trained on the RDD2022 dataset, detecting pavement distress, spalling, and joint failures with confidence ratings.
2. **Deterministic Risk Engine (`risk_engine.py`)**: Computes normalized multi-factor risk index ($0–100$) combining Condition Deficit ($0.25$), Damage Severity ($0.25$), Network Criticality ($0.20$), Usage Loading ($0.15$), Historical Trend ($0.10$), and Environmental Stress ($0.05$).
3. **Explainable Priority Engine (`priority_engine.py`)**: Ranks assets using urgency-to-cost scaling and generates human-understandable natural language justifications.
4. **Knapsack Budget Optimizer (`budget_optimizer.py`)**: Solves greedy ROI-per-rupee portfolio optimization ($\Delta R / \text{Cost}$) under strict municipal capital constraints.
5. **City Time Machine (`simulation_engine.py`)**: Projects 3, 6, and 12-month decay curves and quantifies financial delay penalties (+52% at 6 months, +145% at 12 months) vs immediate preventative intervention.

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (CivicX Editorial Design Tokens: Canvas `#EDEEF5`, Dark `#1A1A1A`, Accent `#9FFF00`)
- **Typography**: Inter (Body/Data) + Outfit (Headings/Display)
- **Mapping**: Leaflet + OpenStreetMap / Carto Voyager
- **Charts & Visuals**: Recharts
- **Animations**: `motion/react`

### Backend & Database
- **Framework**: Python 3.10+ + FastAPI
- **ORM & Database**: SQLAlchemy + PostgreSQL (with automatic zero-config SQLite local fallback)
- **Validation**: Pydantic v2
- **Data Analytics**: NumPy, Pandas, Scikit-learn (MCDA algorithms)

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Setup & Database Seeding

```bash
# From workspace root
# Install dependencies
pip install -r backend/requirements.txt

# Initialize database schema & seed 78 Coimbatore assets
python seed.py

# Start FastAPI server on port 8000
uvicorn backend.app.main:app --reload --port 8000
```
*API interactive documentation available at `http://localhost:8000/docs`.*

### 2. Frontend Setup & Execution

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
*Application live at `http://localhost:5173`.*

---

## 📡 REST API Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and sandbox environment verification |
| `GET` | `/api/dashboard/summary` | Real-time dynamic municipal dashboard KPIs |
| `GET` | `/api/assets/risk-distribution` | Citywide risk tier breakdown (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `GET` | `/api/priorities` | Value-ranked priority queue with explainable justifications |
| `GET` | `/api/assets` | Query assets with filters (`asset_type`, `risk_level`, `zone`, `search`) |
| `GET` | `/api/assets/{id}` | Single asset telemetry, condition score, and coordinates |
| `GET` | `/api/assets/{id}/maintenance` | Historical municipal maintenance and vendor logs |
| `GET` | `/api/assets/{id}/reports` | Citizen, inspector, and IoT sensor hazard reports |
| `POST` | `/api/risk/calculate` | Deterministic multi-factor risk index calculation |
| `POST` | `/api/budget/optimize` | Knapsack portfolio optimizer maximizing risk reduction under budget |
| `POST` | `/api/simulation/run` | City Time Machine 3, 6, 12-month decay forecasting |
| `POST` | `/api/inspection/analyze` | AI vision damage inference interface (RDD2022 format) |

---

## 🎯 3-Minute Hackathon Demo Workflow

```
1. COMMAND CENTER (/dashboard)
   Observe executive KPIs (Total Assets, High-Risk, Critical, Available Budget) and top priority queue.

2. PRIORITY QUEUE (/priorities)
   Filter by Criticality and inspect ranking reasons: "Why is RD-1042 #1?".

3. RISK MAP (/map)
   Explore GIS color-coded markers over Coimbatore. Click RD-1042 popup → "View Asset Intelligence".

4. ASSET INTELLIGENCE (/assets/:id)
   Inspect AI computer vision damage localization, 6-stress vector breakdown, and verified maintenance logs.

5. BUDGET OPTIMIZER (/budget)
   Adjust capital slider from ₹5M to ₹15M → Run Optimization → Observe knapsack portfolio and risk reduction.

6. CITY TIME MACHINE (/simulation)
   Simulate RD-1042 across 3, 6, 12 months. Compare "Repair Now" vs "Delay 6 Months" (+52% cost escalation).

7. EXECUTIVE DECISION BRIEF (/reports)
   Export printable municipal executive brief with algorithmic verdict.
```

---

## ⚖️ Demonstration Transparency & Attribution

- **Demo Data**: All infrastructure records, coordinates, and maintenance logs represent synthetic telemetry for Coimbatore City Corporation for demonstration and evaluation purposes.
- **Simulation Projections**: Deterioration trajectories generated by the City Time Machine are algorithmic lifecycle models designed to demonstrate decision trade-offs.
- **Computer Vision**: The inspection engine provides the standard interface structured for drop-in connectivity to models trained on the RDD2022 (Road Damage Dataset 2022).
