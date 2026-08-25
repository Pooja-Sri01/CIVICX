"""
Database Seed Runner for CIVICX Platform
Initializes tables and seeds 75+ demo infrastructure assets with relational records.
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.models import (
    Asset,
    MaintenanceRecord,
    InfrastructureReport,
    BudgetScenario,
    SimulationScenario,
    CitizenUser,
    CitizenReport,
    CitizenReward,
    CitizenReportEvent
)
from backend.seed.seed_data import generate_all_78_assets
import json

def seed_database():
    print("=" * 60)
    print("CIVICX Database Seeder Initializing...")
    print(f"Target Database Engine: {engine.url}")
    print("=" * 60)

    # Re-create all tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        raw_assets = generate_all_78_assets()
        print(f"Generated {len(raw_assets)} demo infrastructure assets for Coimbatore Corporation.")

        asset_objects = []
        for a_data in raw_assets:
            m_records = a_data.pop("maintenance_records", [])
            reports = a_data.pop("reports", [])
            _ = a_data.pop("priority_score", None)
            _ = a_data.pop("priority_reason", None)
            _ = a_data.pop("recommendedAction", None)

            asset = Asset(**a_data)
            db.add(asset)
            db.flush() # Populate asset.id

            # Add Maintenance Records
            for m in m_records:
                m_obj = MaintenanceRecord(asset_id=asset.id, **m)
                db.add(m_obj)

            # Add Infrastructure Reports
            for r in reports:
                r_obj = InfrastructureReport(asset_id=asset.id, **r)
                db.add(r_obj)

            asset_objects.append(asset)

        db.commit()
        print(f"Successfully seeded {len(asset_objects)} Assets into the database.")

        # Seed Citizen Users
        u1 = CitizenUser(name="Arun Kumar", email="arun.civic@gmail.com", phone="+91 98401 11223", ward="Ward 12 (RS Puram)", password_hash="citizen123", is_verified=1, points_balance=1250)
        u2 = CitizenUser(name="Priya Sundaram", email="priya.sundaram@gmail.com", phone="+91 98421 88402", ward="Ward 24 (Gandhipuram)", password_hash="citizen123", is_verified=1, points_balance=1250)
        u3 = CitizenUser(name="Karthik Raja", email="karthik.raja@outlook.com", phone="+91 98411 33445", ward="Ward 45 (Peelamedu)", password_hash="citizen123", is_verified=1, points_balance=2150)
        db.add_all([u1, u2, u3])
        db.flush()

        # Seed Realistic Citizen Reports
        cr1 = CitizenReport(
            report_id="CIV-2026-00001",
            user_id=u1.id,
            category="Pothole",
            description="Severe cluster of deep potholes near DB Road junction causing vehicular swerving and water stagnation.",
            photo_url="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80",
            latitude=11.0125,
            longitude=76.9510,
            location_name="DB Road, RS Puram, Coimbatore",
            zone="West Zone",
            severity="HIGH",
            validation_score=88,
            validation_status="LIKELY VALID",
            validation_factors=json.dumps([
                {"signal": "Location Verification", "passed": True, "score": 15, "detail": "Spatial coordinates verified within West Zone."},
                {"signal": "Description Quality", "passed": True, "score": 20, "detail": "Detailed pavement defect context provided."},
                {"signal": "Visual Inspection Photo", "passed": True, "score": 20, "detail": "Distress photo telemetry confirmed."},
                {"signal": "Standard Infrastructure Category", "passed": True, "score": 15, "detail": "Category 'Pothole' matched."},
                {"signal": "Duplicate Proximity Check", "passed": True, "score": 15, "detail": "Unique geographic report within 50m."},
                {"signal": "CIVICX Asset Correlation", "passed": True, "score": 10, "detail": "Linked to Monitored Asset RD-1042 (184m)."}
            ]),
            status="VALIDATED",
            priority="HIGH",
            nearest_asset_id="RD-1042",
            nearest_asset_distance_m=184.0
        )

        cr2 = CitizenReport(
            report_id="CIV-2026-00002",
            user_id=u2.id,
            category="Drainage / Flooding",
            description="Stormwater drain silted and blocked on Cross Cut Road causing knee-deep inundation during moderate rainfall.",
            photo_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
            latitude=11.0185,
            longitude=76.9680,
            location_name="Cross Cut Road, Gandhipuram, Coimbatore",
            zone="Central Zone",
            severity="CRITICAL",
            validation_score=92,
            validation_status="LIKELY VALID",
            validation_factors=json.dumps([
                {"signal": "Location Verification", "passed": True, "score": 15, "detail": "Spatial coordinates verified within Central Zone."},
                {"signal": "Description Quality", "passed": True, "score": 20, "detail": "Hydraulic inundation context provided."},
                {"signal": "Visual Inspection Photo", "passed": True, "score": 20, "detail": "Drainage blockage photo confirmed."},
                {"signal": "Standard Infrastructure Category", "passed": True, "score": 15, "detail": "Category 'Drainage / Flooding' matched."},
                {"signal": "Duplicate Proximity Check", "passed": True, "score": 15, "detail": "Unique observation."},
                {"signal": "CIVICX Asset Correlation", "passed": True, "score": 10, "detail": "Linked to Monitored Asset DR-3004 (120m)."}
            ]),
            status="IN_PROGRESS",
            priority="CRITICAL",
            nearest_asset_id="DR-3004",
            nearest_asset_distance_m=120.0,
            assigned_to="Central Zone Emergency Response Division",
            action_notes="Desilting crew dispatched with suction jetting vehicle."
        )

        cr3 = CitizenReport(
            report_id="CIV-2026-00003",
            user_id=u1.id,
            category="Road Damage",
            description="Bituminous base course fatigue and longitudinal cracking along airport feeder corridor.",
            photo_url="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
            latitude=11.0290,
            longitude=77.0020,
            location_name="Avinashi Road, Peelamedu, Coimbatore",
            zone="East Zone",
            severity="HIGH",
            validation_score=95,
            validation_status="LIKELY VALID",
            validation_factors=json.dumps([
                {"signal": "Location Verification", "passed": True, "score": 15, "detail": "Coordinates verified on Avinashi Corridor."},
                {"signal": "Description Quality", "passed": True, "score": 20, "detail": "Fatigue cracking distress description."},
                {"signal": "Visual Inspection Photo", "passed": True, "score": 20, "detail": "Visual evidence verified."},
                {"signal": "Standard Infrastructure Category", "passed": True, "score": 15, "detail": "Category 'Road Damage' matched."},
                {"signal": "Duplicate Proximity Check", "passed": True, "score": 15, "detail": "Unique observation."},
                {"signal": "CIVICX Asset Correlation", "passed": True, "score": 10, "detail": "Linked to Monitored Flyover Pier BR-0201 (95m)."}
            ]),
            status="RESOLVED",
            priority="HIGH",
            nearest_asset_id="BR-0201",
            nearest_asset_distance_m=95.0,
            assigned_to="East Zone Highways Maintenance Unit",
            action_notes="Resurfacing completed by Municipal Works contractor on 2026-08-20."
        )

        cr4 = CitizenReport(
            report_id="CIV-2026-00004",
            user_id=u3.id,
            category="Bridge / Flyover Damage",
            description="Expansion joint rubber degradation and surface spalling observed on Ukkadam Bypass Flyover ramp.",
            photo_url="https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80",
            latitude=10.9880,
            longitude=76.9620,
            location_name="Ukkadam Bypass, South Zone, Coimbatore",
            zone="South Zone",
            severity="HIGH",
            validation_score=86,
            validation_status="LIKELY VALID",
            status="PRIORITIZED",
            priority="HIGH",
            nearest_asset_id="BR-0204",
            nearest_asset_distance_m=140.0
        )

        cr5 = CitizenReport(
            report_id="CIV-2026-00005",
            user_id=u3.id,
            category="Street Infrastructure",
            description="Damaged pedestrian guardrail and fallen street lighting pole near VOC Park bus shelter.",
            photo_url="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
            latitude=11.0060,
            longitude=76.9710,
            location_name="Park Gate Road, Ward 31, Coimbatore",
            zone="Central Zone",
            severity="MEDIUM",
            validation_score=78,
            validation_status="LIKELY VALID",
            status="UNDER_REVIEW",
            priority="MEDIUM",
            nearest_asset_id="ST-5001",
            nearest_asset_distance_m=210.0
        )

        db.add_all([cr1, cr2, cr3, cr4, cr5])
        db.flush()

        # Seed Rewards
        rw1 = CitizenReward(user_id=u1.id, report_id=cr1.id, points=10, reason="Civic report CIV-2026-00001 submitted", status="CREDITED")
        rw2 = CitizenReward(user_id=u1.id, report_id=cr1.id, points=50, reason="Report CIV-2026-00001 validated by CIVICX screening", status="CREDITED")
        rw3 = CitizenReward(user_id=u2.id, report_id=cr2.id, points=100, reason="Field crew assigned to CIV-2026-00002", status="CREDITED")
        rw4 = CitizenReward(user_id=u1.id, report_id=cr3.id, points=250, reason="Infrastructure defect CIV-2026-00003 successfully resolved", status="CREDITED")
        db.add_all([rw1, rw2, rw3, rw4])

        # Seed Events for Audit Trail
        ev1 = CitizenReportEvent(report_id=cr1.id, event_type="SUBMITTED", old_status=None, new_status="SUBMITTED", actor_id="Arun Kumar", description="Citizen submitted report with photo telemetry.")
        ev2 = CitizenReportEvent(report_id=cr1.id, event_type="SCREENED", old_status="SUBMITTED", new_status="UNDER_REVIEW", actor_id="CIVICX Engine", description="7-signal deterministic validation completed (Score: 92/100). Correlated with asset RD-1042.")
        ev3 = CitizenReportEvent(report_id=cr1.id, event_type="VALIDATED", old_status="UNDER_REVIEW", new_status="VALIDATED", actor_id="Municipal Engineer", description="Municipal engineer confirmed validation.")

        ev4 = CitizenReportEvent(report_id=cr3.id, event_type="SUBMITTED", old_status=None, new_status="SUBMITTED", actor_id="Arun Kumar", description="Report submitted for Flyover Pier BR-0201.")
        ev5 = CitizenReportEvent(report_id=cr3.id, event_type="VALIDATED", old_status="SUBMITTED", new_status="VALIDATED", actor_id="Municipal Engineer", description="Screening validated.")
        ev6 = CitizenReportEvent(report_id=cr3.id, event_type="ASSIGNED", old_status="VALIDATED", new_status="ASSIGNED", actor_id="Municipal Engineer", description="Assigned to East Zone Highways Maintenance Unit.")
        ev7 = CitizenReportEvent(report_id=cr3.id, event_type="RESOLVED", old_status="IN_PROGRESS", new_status="RESOLVED", actor_id="Municipal Engineer", description="Resurfacing completed by Municipal Works contractor on 2026-08-20.")

        db.add_all([ev1, ev2, ev3, ev4, ev5, ev6, ev7])
        db.commit()

        # Verify counts
        asset_count = db.query(Asset).count()
        maintenance_count = db.query(MaintenanceRecord).count()
        report_count = db.query(InfrastructureReport).count()
        citizen_reports_count = db.query(CitizenReport).count()
        rewards_count = db.query(CitizenReward).count()
        
        print("-" * 60)
        print(f"Verification Summary:")
        print(f"  • Total Assets:           {asset_count}")
        print(f"  • Maintenance Records:    {maintenance_count}")
        print(f"  • Infrastructure Reports: {report_count}")
        print(f"  • Citizen Reports:        {citizen_reports_count}")
        print(f"  • Citizen Rewards:        {rewards_count}")
        print("-" * 60)
        print("Database Seed Completed Successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
