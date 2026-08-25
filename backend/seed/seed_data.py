"""
CIVICX Realistic Coimbatore Demo Dataset (75+ Infrastructure Assets)
Annotated with geo-coordinates, damage telemetry, maintenance logs, and infrastructure reports.
"""

from typing import List, Dict, Any

CORE_COIMBATORE_ASSETS: List[Dict[str, Any]] = [
    {
        "asset_id": "RD-1042",
        "asset_type": "Road",
        "name": "Gandhipuram Underpass Inbound Arterial",
        "latitude": 11.0168,
        "longitude": 76.9673,
        "location": "Cross Cut Road - Dr. Nanjappa Rd Junction, Gandhipuram",
        "ward": "Ward 24",
        "zone": "Central Zone",
        "condition_score": 14,
        "damage_severity": 94,
        "damage_type": "Severe Pothole Cluster & Alligator Fatigue Cracking",
        "risk_score": 93,
        "risk_level": "CRITICAL",
        "criticality": "CRITICAL",
        "usage_score": 92,
        "historical_deterioration": 28.0,
        "environmental_exposure": 85.0,
        "estimated_repair_cost": 1850000.0,
        "priority_rank": 1,
        "recommended_action": "Full-Depth Milling & High-Modulus Bituminous Overlay",
        "image_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-08-14",
        "maintenance_records": [
            {"maintenance_type": "Emergency Cold Patch", "description": "Temporary cold mix infill for central lane potholes.", "cost": 120000.0, "date": "2025-06-10", "status": "COMPLETED", "vendor": "Coimbatore InfraWorks Ltd", "condition_after": 52},
            {"maintenance_type": "Surface Sealant", "description": "Emulsion seal coat applied over longitudinal joints.", "cost": 340000.0, "date": "2024-04-18", "status": "COMPLETED", "vendor": "Kongu Highway Concessions", "condition_after": 74}
        ],
        "reports": [
            {"report_type": "Structural Hazard Alert", "description": "Deep pothole causing two-wheeler skidding near bus exit.", "severity": "CRITICAL", "reported_date": "2026-08-12", "source": "Inspector", "status": "OPEN"},
            {"report_type": "Pothole Complaint", "description": "Repeated vehicle rim damage reported during peak hours.", "severity": "HIGH", "reported_date": "2026-08-09", "source": "Citizen", "status": "INVESTIGATING"}
        ]
    },
    {
        "asset_id": "BR-2019",
        "asset_type": "Bridge",
        "name": "Peelamedu Avinashi Road Rail Overbridge (ROB)",
        "latitude": 11.0264,
        "longitude": 77.0028,
        "location": "Avinashi Road near PSG Tech, Peelamedu",
        "ward": "Ward 38",
        "zone": "East Zone",
        "condition_score": 22,
        "damage_severity": 89,
        "damage_type": "Expansion Joint Spalling & Rebar Exposure",
        "risk_score": 91,
        "risk_level": "CRITICAL",
        "criticality": "CRITICAL",
        "usage_score": 96,
        "historical_deterioration": 22.0,
        "environmental_exposure": 72.0,
        "estimated_repair_cost": 4200000.0,
        "priority_rank": 2,
        "recommended_action": "Modular Expansion Joint Replacement & Elastomeric Bearing Rehabilitation",
        "image_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-08-11",
        "maintenance_records": [
            {"maintenance_type": "Joint Sealant Injection", "description": "Elastomeric sealant injected into leaking joint gap.", "cost": 450000.0, "date": "2024-11-20", "status": "COMPLETED", "vendor": "L&T Infrastructure Services", "condition_after": 68}
        ],
        "reports": [
            {"report_type": "Expansion Joint Thump", "description": "Significant metallic impact noise when heavy buses cross span 3.", "severity": "CRITICAL", "reported_date": "2026-08-10", "source": "Sensor", "status": "OPEN"}
        ]
    },
    {
        "asset_id": "DR-3051",
        "asset_type": "Drainage",
        "name": "Ukkadam Big Bazaar Primary Stormwater Culvert",
        "latitude": 10.9925,
        "longitude": 76.9614,
        "location": "Big Bazaar Street - Sungam Bypass, Ukkadam",
        "ward": "Ward 61",
        "zone": "South Zone",
        "condition_score": 18,
        "damage_severity": 91,
        "damage_type": "Major Siltation, Structural Wall Cracking & Inundation Risk",
        "risk_score": 88,
        "risk_level": "CRITICAL",
        "criticality": "HIGH",
        "usage_score": 84,
        "historical_deterioration": 30.0,
        "environmental_exposure": 90.0,
        "estimated_repair_cost": 1250000.0,
        "priority_rank": 3,
        "recommended_action": "Reinforced Concrete Box Desilting & Precast Symmetrical Invert Liners",
        "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-08-08",
        "maintenance_records": [
            {"maintenance_type": "Mechanical Desilting", "description": "Excavator desilting of downstream lake outfall.", "cost": 180000.0, "date": "2025-05-15", "status": "COMPLETED", "vendor": "City EcoClean Infra", "condition_after": 60}
        ],
        "reports": [
            {"report_type": "Flash Flood Inundation", "description": "Water backing up onto street during 30-min rainfall.", "severity": "CRITICAL", "reported_date": "2026-08-05", "source": "Citizen", "status": "OPEN"}
        ]
    },
    {
        "asset_id": "FL-4008",
        "asset_type": "Flyover",
        "name": "100 Feet Road Flyover Western Ramp",
        "latitude": 11.0215,
        "longitude": 76.9632,
        "location": "100 Feet Road - Tatabad Cross, Gandhipuram",
        "ward": "Ward 22",
        "zone": "Central Zone",
        "condition_score": 28,
        "damage_severity": 82,
        "damage_type": "Approach Slab Settlement & Longitudinal Joint Separation",
        "risk_score": 84,
        "risk_level": "CRITICAL",
        "criticality": "HIGH",
        "usage_score": 80,
        "historical_deterioration": 24.0,
        "environmental_exposure": 75.0,
        "estimated_repair_cost": 2800000.0,
        "priority_rank": 4,
        "recommended_action": "Polyurethane Foam Stabilization & Sub-base Slab Jacking",
        "image_url": "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-08-02",
        "maintenance_records": [
            {"maintenance_type": "Asphalt Leveling", "description": "Milling and leveling course over settling ramp.", "cost": 380000.0, "date": "2024-08-12", "status": "COMPLETED", "vendor": "Kongu Highway Concessions", "condition_after": 70}
        ],
        "reports": [
            {"report_type": "Bump on Ramp Approach", "description": "45mm step created at ramp interface.", "severity": "HIGH", "reported_date": "2026-07-28", "source": "Inspector", "status": "INVESTIGATING"}
        ]
    },
    {
        "asset_id": "PF-5001",
        "asset_type": "Public Facility",
        "name": "Gandhipuram Central Bus Terminal Concourse",
        "latitude": 11.0182,
        "longitude": 76.9654,
        "location": "Setc Bus Terminal, Gandhipuram",
        "ward": "Ward 23",
        "zone": "Central Zone",
        "condition_score": 32,
        "damage_severity": 78,
        "damage_type": "Heavy Apron Concrete Spalling & Oil Degradation",
        "risk_score": 79,
        "risk_level": "CRITICAL",
        "criticality": "CRITICAL",
        "usage_score": 98,
        "historical_deterioration": 20.0,
        "environmental_exposure": 80.0,
        "estimated_repair_cost": 2200000.0,
        "priority_rank": 5,
        "recommendedAction": "High-Early-Strength Concrete Bay Reconstruction",
        "recommended_action": "High-Early-Strength Concrete Bay Reconstruction",
        "image_url": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-08-07",
        "maintenance_records": [],
        "reports": [
            {"report_type": "Pavement Gouging", "description": "Bus wheels rutting through deteriorated concrete apron.", "severity": "HIGH", "reported_date": "2026-08-01", "source": "System", "status": "OPEN"}
        ]
    },
    {
        "asset_id": "SI-6002",
        "asset_type": "Street Infrastructure",
        "name": "RS Puram DB Road Pedestrian High Street Corridor",
        "latitude": 11.0084,
        "longitude": 76.9497,
        "location": "Diwan Bahadur Road, RS Puram",
        "ward": "Ward 53",
        "zone": "West Zone",
        "condition_score": 35,
        "damage_severity": 75,
        "damage_type": "Utility Trench Settlement & Paver Displacement",
        "risk_score": 76,
        "risk_level": "CRITICAL",
        "criticality": "MEDIUM",
        "usage_score": 78,
        "historical_deterioration": 18.0,
        "environmental_exposure": 68.0,
        "estimated_repair_cost": 1400000.0,
        "priority_rank": 6,
        "recommended_action": "Micro-surfacing & Utility Re-trench Stabilization",
        "image_url": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80",
        "last_inspection_date": "2026-07-29",
        "maintenance_records": [
            {"maintenance_type": "Patch Re-carpeting", "description": "Trench resurfacing after gas pipeline installation.", "cost": 150000.0, "date": "2025-02-14", "status": "COMPLETED", "vendor": "West Zone Works", "condition_after": 72}
        ],
        "reports": [
            {"report_type": "Uneven Footpath & Road Joint", "description": "Significant trip hazard for shoppers along boutique stretch.", "severity": "MEDIUM", "reported_date": "2026-07-20", "source": "Citizen", "status": "OPEN"}
        ]
    }
]

# Systematic generation of 72 additional realistic assets across Coimbatore to reach 78+ total
RAW_ASSET_TEMPLATES = [
    # (name, type, zone, ward, base_lat, base_lng, cond, severity, crit, usage, cost)
    ("Singanallur Trichy Road High-Density Junction", "Road", "East Zone", "Ward 59", 10.9992, 77.0185, 38, 72, "HIGH", 94, 2100000.0),
    ("Sungam Lake Bypass Causeway Bridge", "Bridge", "South Zone", "Ward 63", 10.9961, 76.9834, 42, 68, "HIGH", 80, 3100000.0),
    ("Saravanampatti IT Corridor Expressway Stretch", "Road", "North Zone", "Ward 12", 11.0805, 76.9967, 46, 64, "MEDIUM", 82, 1650000.0),
    ("Ganapathy Sathy Road Drainage Box Culvert", "Culvert", "North Zone", "Ward 18", 11.0392, 76.9782, 48, 62, "MEDIUM", 65, 850000.0),
    ("Saibaba Colony NSR Road Commercial Spine", "Road", "West Zone", "Ward 28", 11.0289, 76.9452, 52, 58, "MEDIUM", 66, 920000.0),
    ("Ramanathapuram Nanjundapuram Main Road", "Road", "South Zone", "Ward 64", 10.9842, 76.9945, 58, 50, "MEDIUM", 58, 780000.0),
    ("Avinashi Road Express Bus Corridor Junction", "Traffic Corridor", "Central Zone", "Ward 32", 11.0142, 76.9856, 64, 44, "HIGH", 88, 480000.0),
    ("Thudiyalur Mettupalayam Highway Feeder", "Road", "North Zone", "Ward 04", 11.0772, 76.9421, 68, 38, "MEDIUM", 68, 620000.0),
    ("Singanallur Boat House Lake Outfall Canal", "Drainage", "East Zone", "Ward 58", 10.9884, 77.0245, 72, 34, "MEDIUM", 55, 390000.0),
    ("Town Hall Oppanakkara Street Heritage Lane", "Street Infrastructure", "Central Zone", "Ward 70", 10.9981, 76.9602, 75, 28, "LOW", 45, 280000.0),
    ("Kuniyamuthur Palakkad Main Road Ring", "Road", "South Zone", "Ward 85", 10.9654, 76.9532, 82, 20, "MEDIUM", 60, 350000.0),
    ("Noyyal River New Concrete Girder Bridge", "Bridge", "West Zone", "Ward 74", 10.9815, 76.9248, 88, 12, "MEDIUM", 52, 120000.0),
    ("Race Course Outer Jogging & Transit Loop", "Public Facility", "Central Zone", "Ward 62", 11.0024, 76.9745, 92, 8, "LOW", 38, 80000.0),
    ("Vadavalli Thondamuthur Link Road", "Road", "West Zone", "Ward 15", 11.0082, 76.9124, 44, 66, "MEDIUM", 62, 950000.0),
    ("Singanallur - Vellalore Bypass Culvert", "Culvert", "South Zone", "Ward 80", 10.9652, 77.0125, 39, 74, "HIGH", 72, 1150000.0),
    ("Kavundampalayam MTP Flyover Pier", "Flyover", "North Zone", "Ward 10", 11.0453, 76.9481, 31, 80, "HIGH", 85, 2900000.0),
    ("Sivananda Colony Railway Feeder Road", "Road", "Central Zone", "Ward 20", 11.0284, 76.9582, 54, 52, "MEDIUM", 64, 820000.0),
    ("Ganapathy Maniyakarampalayam Road", "Road", "North Zone", "Ward 16", 11.0482, 76.9851, 60, 48, "LOW", 54, 640000.0),
    ("Sowripalayam Meena Estate Cross Link", "Road", "East Zone", "Ward 45", 11.0051, 77.0014, 62, 45, "LOW", 48, 520000.0),
    ("Ramanathapuram 80 Feet Road Culvert", "Culvert", "South Zone", "Ward 65", 10.9824, 76.9882, 49, 60, "MEDIUM", 56, 750000.0),
    ("Ondipudur Flyover Trichy Road Entry", "Flyover", "East Zone", "Ward 55", 10.9953, 77.0421, 29, 84, "HIGH", 88, 3100000.0),
    ("Vilankurichi Tech Park Transit Corridor", "Street Infrastructure", "East Zone", "Ward 35", 11.0521, 77.0182, 55, 54, "HIGH", 82, 880000.0),
    ("Sundarapuram Madukkarai Link Road", "Road", "South Zone", "Ward 92", 10.9421, 76.9682, 41, 71, "MEDIUM", 68, 1100000.0),
    ("Perur Pateeswarar Temple North Arch Road", "Public Facility", "West Zone", "Ward 73", 10.9852, 76.9204, 70, 35, "LOW", 42, 380000.0),
    ("Avarampalayam Railway Level Cross Road", "Road", "Central Zone", "Ward 26", 11.0291, 76.9802, 36, 76, "HIGH", 76, 1450000.0),
    ("Sulur Airforce Station Access Road", "Road", "East Zone", "Ward 50", 11.0184, 77.0851, 48, 60, "HIGH", 74, 1280000.0),
    ("Cheran Ma Nagar Drainage Interceptor", "Drainage", "East Zone", "Ward 37", 11.0452, 77.0124, 33, 79, "HIGH", 70, 1350000.0),
    ("Kovaipudur Valley Arterial Road", "Road", "South Zone", "Ward 88", 10.9381, 76.9352, 65, 42, "LOW", 50, 480000.0),
    ("Pappanaickenpalayam Mani High School Rd", "Road", "Central Zone", "Ward 30", 11.0182, 76.9781, 56, 51, "MEDIUM", 62, 720000.0),
    ("Hope College Underpass Arterial", "Road", "East Zone", "Ward 40", 11.0282, 77.0142, 27, 86, "CRITICAL", 95, 2400000.0),
    ("Gopalapuram Club Road Corridor", "Street Infrastructure", "Central Zone", "Ward 27", 11.0091, 76.9712, 74, 30, "LOW", 46, 320000.0),
    ("Kuniyamuthur Kovaipudur Link Culvert", "Culvert", "South Zone", "Ward 86", 10.9521, 76.9451, 51, 58, "MEDIUM", 58, 690000.0),
    ("Chinnavedampatti Lake Canal", "Drainage", "North Zone", "Ward 08", 11.0652, 76.9881, 45, 65, "MEDIUM", 52, 840000.0),
    ("Ukkadam Fish Market Access Way", "Public Facility", "South Zone", "Ward 60", 10.9912, 76.9582, 25, 88, "HIGH", 86, 1750000.0),
    ("Neelambur Bypass Junction Approach", "Road", "East Zone", "Ward 48", 11.0482, 77.0821, 40, 72, "HIGH", 84, 1950000.0),
    ("Periyanaickenpalayam Bridge Span 2", "Bridge", "North Zone", "Ward 02", 11.1214, 76.9382, 34, 78, "HIGH", 76, 2600000.0),
    ("Pollachi Road Eachanari Flyover Entry", "Flyover", "South Zone", "Ward 94", 10.9251, 76.9821, 42, 69, "HIGH", 82, 2750000.0),
    ("Tatabad 3rd Street Residential Spine", "Road", "Central Zone", "Ward 21", 11.0232, 76.9612, 66, 40, "LOW", 44, 420000.0),
    ("Kallimadai Trichy Road Feeder Culvert", "Culvert", "East Zone", "Ward 57", 10.9982, 77.0084, 53, 55, "MEDIUM", 60, 680000.0),
    ("Thadagam Road Forest College Stretch", "Road", "West Zone", "Ward 17", 11.0342, 76.9281, 47, 63, "MEDIUM", 64, 1150000.0),
    ("Telungupalayam Pudur Link Canal", "Drainage", "West Zone", "Ward 72", 10.9951, 76.9312, 38, 74, "MEDIUM", 58, 920000.0),
    ("Chitra Airport Cargo Access Road", "Road", "East Zone", "Ward 42", 11.0342, 77.0381, 35, 77, "HIGH", 88, 1850000.0),
    ("Podanur Junction Railway Station Approach", "Public Facility", "South Zone", "Ward 78", 10.9621, 76.9852, 43, 69, "HIGH", 80, 1400000.0),
    ("Rathinam TechZone Transit Link", "Street Infrastructure", "South Zone", "Ward 90", 10.9321, 76.9552, 60, 46, "LOW", 65, 580000.0),
    ("Vellakinar Housing Unit Main Road", "Road", "North Zone", "Ward 06", 11.0821, 76.9582, 63, 44, "LOW", 48, 490000.0),
    ("Selvapuram High School Road", "Road", "West Zone", "Ward 76", 10.9882, 76.9421, 49, 61, "MEDIUM", 60, 780000.0),
    ("Ganapathy Texvalley Link Culvert", "Culvert", "North Zone", "Ward 14", 11.0512, 76.9721, 57, 51, "MEDIUM", 52, 590000.0),
    ("Singanallur Lake Bund Walking Track & Wall", "Public Facility", "East Zone", "Ward 56", 10.9851, 77.0212, 78, 26, "LOW", 35, 240000.0),
    ("Ondipudur Bus Depot Service Apron", "Public Facility", "East Zone", "Ward 54", 10.9921, 77.0451, 28, 85, "HIGH", 90, 2100000.0),
    ("Kovaipudur Golf Club Access Road", "Road", "South Zone", "Ward 87", 10.9421, 76.9281, 80, 22, "LOW", 32, 290000.0),
    ("Ukkadam Valankulam Lake Promenade Wall", "Public Facility", "Central Zone", "Ward 66", 10.9982, 76.9692, 85, 18, "LOW", 40, 180000.0),
    ("Saravanampatti KGISL Campus Bridge", "Bridge", "North Zone", "Ward 11", 11.0851, 77.0012, 58, 50, "MEDIUM", 72, 1450000.0),
    ("Peelamedu Fun Republic Mall Junction", "Street Infrastructure", "East Zone", "Ward 39", 11.0252, 77.0091, 37, 75, "HIGH", 92, 1600000.0),
    ("Cross Cut Road Shopping Spine South", "Street Infrastructure", "Central Zone", "Ward 25", 11.0142, 76.9642, 33, 79, "HIGH", 88, 1550000.0),
    ("Vadavalli Marudhamalai Hill Base Road", "Road", "West Zone", "Ward 13", 11.0382, 76.8951, 62, 45, "MEDIUM", 60, 720000.0),
    ("Kurichi Lake Inlet Channel Culvert", "Culvert", "South Zone", "Ward 84", 10.9582, 76.9691, 46, 64, "MEDIUM", 55, 780000.0),
    ("Sundarapuram LIC Colony Road", "Road", "South Zone", "Ward 91", 10.9482, 76.9621, 71, 36, "LOW", 42, 390000.0),
    ("Ganapathy Police Station Junction", "Street Infrastructure", "North Zone", "Ward 19", 11.0352, 76.9821, 50, 58, "MEDIUM", 70, 820000.0),
    ("Peelamedu CODISSIA Trade Fair Link", "Road", "East Zone", "Ward 36", 11.0421, 77.0282, 54, 52, "MEDIUM", 78, 980000.0),
    ("Mettupalayam Highway Sanganoor Canal", "Drainage", "Central Zone", "Ward 29", 11.0242, 76.9491, 26, 88, "CRITICAL", 85, 1950000.0),
    ("Ramanathapuram Trinity Church Link", "Road", "South Zone", "Ward 68", 10.9881, 76.9812, 67, 39, "LOW", 50, 460000.0),
    ("Thudiyalur Weekly Market Street", "Public Facility", "North Zone", "Ward 05", 11.0742, 76.9451, 39, 73, "MEDIUM", 75, 960000.0),
    ("Saibaba Colony Alagesan Road", "Road", "West Zone", "Ward 31", 11.0251, 76.9412, 59, 49, "LOW", 54, 610000.0),
    ("Singanallur Irugur Railway Link", "Road", "East Zone", "Ward 52", 11.0082, 77.0512, 45, 65, "MEDIUM", 68, 1180000.0),
    ("Perur Vedapatti Causeway", "Bridge", "West Zone", "Ward 75", 10.9921, 76.9152, 36, 76, "HIGH", 64, 2150000.0),
    ("Kovaipudur Ashram Road Culvert", "Culvert", "South Zone", "Ward 89", 10.9351, 76.9412, 64, 43, "LOW", 40, 420000.0),
    ("Saravanampatti Sankara College Rd", "Road", "North Zone", "Ward 09", 11.0782, 77.0082, 52, 57, "MEDIUM", 66, 850000.0),
    ("Town Hall Big Mosque Lane", "Street Infrastructure", "Central Zone", "Ward 69", 10.9952, 76.9621, 48, 62, "MEDIUM", 68, 740000.0),
    ("Peelamedu Medical College Access Way", "Road", "East Zone", "Ward 41", 11.0312, 77.0212, 30, 83, "CRITICAL", 94, 2250000.0),
    ("Ganapathy Sathy Highway Flyover Loop", "Flyover", "North Zone", "Ward 17", 11.0421, 76.9792, 44, 67, "HIGH", 86, 2800000.0),
    ("Ukkadam Sungam Express Bypass", "Road", "South Zone", "Ward 67", 10.9912, 76.9782, 41, 71, "HIGH", 90, 2100000.0),
    ("Vadavalli PN Pudur Main Feeder", "Road", "West Zone", "Ward 14", 11.0152, 76.9242, 61, 47, "LOW", 58, 590000.0),
]

def generate_all_78_assets() -> List[Dict[str, Any]]:
    from backend.app.algorithms.risk_engine import RiskEngine
    from backend.app.algorithms.priority_engine import PriorityEngine

    assets = list(CORE_COIMBATORE_ASSETS)
    
    prefix_map = {
        "Road": "RD",
        "Bridge": "BR",
        "Drainage": "DR",
        "Culvert": "CU",
        "Flyover": "FL",
        "Public Facility": "PF",
        "Street Infrastructure": "SI",
        "Traffic Corridor": "TC"
    }

    start_num = 1050
    for idx, (name, atype, zone, ward, lat, lng, cond, severity, crit, usage, cost) in enumerate(RAW_ASSET_TEMPLATES, 7):
        prefix = prefix_map.get(atype, "RD")
        asset_id_str = f"{prefix}-{start_num + idx * 13}"
        
        # Calculate risk score deterministically
        h_rate = round(12.0 + (100 - cond) * 0.22, 1)
        env_exp = round(40.0 + (usage * 0.3) + (severity * 0.2), 1)
        
        risk_res = RiskEngine.calculate_risk(
            condition_score=cond,
            damage_severity=severity,
            usage_score=usage,
            criticality=crit,
            historical_deterioration=h_rate,
            environmental_exposure=env_exp
        )
        
        # Damage type classification and authentic infrastructure photos
        if atype == "Road":
            dtype = "Pavement Fatigue Cracking & Localized Raveling" if risk_res["risk_score"] < 70 else "Severe Potholes & Edge Subsidence"
            action = "Preventative Resurfacing & Base Stabilization" if risk_res["risk_score"] < 70 else "Full-Depth Milling & Overlay"
            img = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80" if risk_res["risk_score"] >= 70 else "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=1000&q=80"
        elif atype == "Bridge":
            dtype = "Elastomeric Bearing Wear & Parapet Cracking"
            action = "Bearing Jacking & Parapet Concrete Patching"
            img = "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80" if idx % 2 == 0 else "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80"
        elif atype == "Drainage" or atype == "Culvert":
            dtype = "Invert Silt Accumulation & Headwall Scour"
            action = "Mechanical Desilting & Precast Concrete Lining"
            img = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80"
        elif atype == "Flyover":
            dtype = "Expansion Joint Delamination & Pier Spalling"
            action = "Expansion Joint Reconstruction & Carbon Wrap"
            img = "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1000&q=80"
        elif atype == "Public Facility":
            dtype = "Heavy Apron Concrete Spalling & Surface Wear"
            action = "Apron Bay Reconstruction & High-Strength Infill"
            img = "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80" if idx % 2 == 0 else "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80"
        elif atype == "Traffic Corridor":
            dtype = "Junction Asphalt Raveling & Signal Corridor Wear"
            action = "High-Traffic Overlay & Micro-Surfacing"
            img = "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1000&q=80"
        else: # Street Infrastructure
            dtype = "Surface Paver Loosening & Trench Subsidence"
            action = "Paver Re-bedding & Bituminous Resealing"
            img = "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80"

        # Maintenance records and reports
        m_records = [
            {
                "maintenance_type": "Routine Surface Maintenance",
                "description": f"Annual patch inspection and maintenance for {name}.",
                "cost": round(cost * 0.14, 2),
                "date": "2024-09-15",
                "status": "COMPLETED",
                "vendor": "Coimbatore Municipal Works",
                "condition_after": min(95, cond + 30)
            }
        ]
        
        reports_list = []
        if risk_res["risk_score"] >= 70:
            reports_list.append({
                "report_type": "Surface Defect Alert",
                "description": f"Significant deterioration reported on {name}.",
                "severity": "HIGH",
                "reported_date": "2026-08-03",
                "source": "Citizen",
                "status": "OPEN"
            })

        asset_obj = {
            "asset_id": asset_id_str,
            "asset_type": atype,
            "name": name,
            "latitude": round(lat, 4),
            "longitude": round(lng, 4),
            "location": f"{name}, {zone}",
            "ward": ward,
            "zone": zone,
            "condition_score": cond,
            "damage_severity": severity,
            "damage_type": dtype,
            "risk_score": risk_res["risk_score"],
            "risk_level": risk_res["risk_level"],
            "criticality": crit,
            "usage_score": usage,
            "historical_deterioration": h_rate,
            "environmental_exposure": env_exp,
            "estimated_repair_cost": cost,
            "priority_rank": idx,
            "recommended_action": action,
            "image_url": img,
            "last_inspection_date": "2026-07-28",
            "maintenance_records": m_records,
            "reports": reports_list
        }
        assets.append(asset_obj)

    # Rank all 78 assets dynamically using PriorityEngine
    ranked_assets = PriorityEngine.rank_assets(assets)
    return ranked_assets
