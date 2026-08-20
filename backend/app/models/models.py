from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    asset_type = Column(String(50), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(String(255), nullable=False)
    ward = Column(String(50), nullable=True)
    zone = Column(String(50), nullable=True)
    
    # Condition & Severity (0-100)
    condition_score = Column(Integer, nullable=False, default=50)
    damage_severity = Column(Integer, nullable=False, default=50)
    damage_type = Column(String(255), nullable=True)
    
    # Risk Metrics
    risk_score = Column(Integer, index=True, nullable=False, default=50)
    risk_level = Column(String(20), index=True, nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    
    # Stress & Multipliers
    criticality = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    usage_score = Column(Integer, nullable=False, default=50)
    historical_deterioration = Column(Float, nullable=False, default=15.0) # rate %/yr
    environmental_exposure = Column(Float, nullable=False, default=50.0) # exposure index 0-100
    
    # Cost & Rank
    estimated_repair_cost = Column(Float, nullable=False, default=500000.0)
    priority_rank = Column(Integer, index=True, nullable=False, default=1)
    recommended_action = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)
    last_inspection_date = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset", cascade="all, delete-orphan")
    reports = relationship("InfrastructureReport", back_populates="asset", cascade="all, delete-orphan")
    simulations = relationship("SimulationScenario", back_populates="asset", cascade="all, delete-orphan")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    cost = Column(Float, nullable=False, default=0.0)
    date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="COMPLETED") # COMPLETED, IN_PROGRESS, SCHEDULED
    vendor = Column(String(150), nullable=True)
    condition_after = Column(Integer, nullable=True)

    asset = relationship("Asset", back_populates="maintenance_records")


class InfrastructureReport(Base):
    __tablename__ = "infrastructure_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    reported_date = Column(String(50), nullable=False)
    source = Column(String(50), nullable=False, default="Citizen") # Citizen, Inspector, Sensor, System
    status = Column(String(50), nullable=False, default="OPEN") # OPEN, INVESTIGATING, RESOLVED

    asset = relationship("Asset", back_populates="reports")


class BudgetScenario(Base):
    __tablename__ = "budget_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    available_budget = Column(Float, nullable=False)
    selected_assets = Column(Text, nullable=False) # JSON array of asset IDs
    total_cost = Column(Float, nullable=False)
    expected_risk_reduction = Column(Float, nullable=False)
    strategy = Column(String(50), nullable=False, default="civicx_value_max")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_type = Column(String(50), nullable=False) # REPAIR_NOW, DELAY, PARTIAL_REPAIR
    time_horizon_months = Column(Integer, nullable=False, default=6) # 3, 6, 12
    projected_risk = Column(Integer, nullable=False)
    projected_condition = Column(Integer, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    asset = relationship("Asset", back_populates="simulations")
