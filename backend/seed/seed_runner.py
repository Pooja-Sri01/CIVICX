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
    SimulationScenario
)
from backend.seed.seed_data import generate_all_78_assets

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
        
        # Verify counts
        asset_count = db.query(Asset).count()
        maintenance_count = db.query(MaintenanceRecord).count()
        report_count = db.query(InfrastructureReport).count()
        
        print("-" * 60)
        print(f"Verification Summary:")
        print(f"  • Total Assets:         {asset_count}")
        print(f"  • Maintenance Records:  {maintenance_count}")
        print(f"  • Infrastructure Reports: {report_count}")
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
