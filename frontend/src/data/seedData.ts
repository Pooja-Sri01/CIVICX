import { Asset, DashboardSummary } from '../types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "civicx-ast-001",
    assetId: "RD-1042",
    name: "Gandhipuram Underpass Inbound Arterial",
    type: "Road",
    location: "Cross Cut Road - Dr. Nanjappa Rd Junction, Gandhipuram",
    ward: "Ward 24",
    zone: "Central Zone",
    latitude: 11.0168,
    longitude: 76.9673,
    conditionScore: 14,
    damageSeverity: 94,
    damageType: "Severe Pothole Cluster & Alligator Fatigue Cracking",
    riskScore: 93,
    riskLevel: "Critical",
    criticality: "Critical",
    criticalityScore: 96,
    usage: "Heavy Transit Corridor (48,500 PCU/day)",
    usageScore: 92,
    historicalTrend: "Accelerating Degradation (+28%/yr post-monsoon)",
    trendScore: 88,
    environmentalExposure: "Flash Flood Inundation Hotspot (Low Drainage Basin)",
    exposureScore: 85,
    estimatedRepairCost: 1850000, // ₹18.5 Lakhs
    priorityRank: 1,
    recommendedAction: "Full-Depth Milling & High-Modulus Bituminous Overlay",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Severe Pothole (D40)", confidence: 0.96, x: 22, y: 48, width: 34, height: 28 },
      { label: "Alligator Cracking (D20)", confidence: 0.91, x: 60, y: 38, width: 26, height: 35 }
    ],
    lastInspection: "2026-08-14",
    maintenanceHistory: [
      { date: "2025-06-10", action: "Cold Patch Pothole Filling", cost: 120000, vendor: "Coimbatore InfraWorks Ltd", conditionAfter: 52 },
      { date: "2024-04-18", action: "Surface Sealant", cost: 340000, vendor: "Kongu Highway Concessions", conditionAfter: 74 }
    ],
    explainability: {
      summary: "Immediate structural hazard on Coimbatore's primary commercial artery carrying 48k+ daily commuter units.",
      topFactors: [
        { factor: "Structural Condition Deficit", impact: "Critical", weight: 0.25, scoreContribution: 24.5, description: "Base course compromise detected with water ingress into subgrade." },
        { factor: "Corridor Criticality & Evacuation", impact: "Critical", weight: 0.20, scoreContribution: 19.2, description: "Primary emergency route connecting CMCH Hospital and Gandhipuram Central Bus Terminal." },
        { factor: "High Traffic Volume Exposure", impact: "High", weight: 0.15, scoreContribution: 13.8, description: "Heavy bus and multi-axle freight loading compounding surface shear stress." },
        { factor: "Monsoon Hydro-Dynamic Stress", impact: "High", weight: 0.10, scoreContribution: 8.5, description: "Standing water accumulation during monsoon cycles accelerating edge unraveling." }
      ],
      whyRank: "Ranked #1 because failure would trigger systemic gridlock across Central Coimbatore while intervention ROI is extremely high (₹1.85M prevents a ₹9.2M full reconstruction).",
      preventativeROI: "4.97x Cost Savings vs 12-Month Delayed Reconstruction"
    }
  },
  {
    id: "civicx-ast-002",
    assetId: "BR-2019",
    name: "Peelamedu Avinashi Road Rail Overbridge (ROB)",
    type: "Bridge",
    location: "Avinashi Road near PSG Tech, Peelamedu",
    ward: "Ward 38",
    zone: "East Zone",
    latitude: 11.0264,
    longitude: 77.0028,
    conditionScore: 22,
    damageSeverity: 89,
    damageType: "Expansion Joint Spalling & Rebar Exposure",
    riskScore: 91,
    riskLevel: "Critical",
    criticality: "Critical",
    criticalityScore: 98,
    usage: "Airport Trunk Route (62,000 PCU/day)",
    usageScore: 96,
    historicalTrend: "Steady Stress Fracture Widening (+22%/yr)",
    trendScore: 84,
    environmentalExposure: "High Thermal Expansion Gradient",
    exposureScore: 72,
    estimatedRepairCost: 4200000, // ₹42.0 Lakhs
    priorityRank: 2,
    recommendedAction: "Modular Expansion Joint Replacement & Elastomeric Bearing Rehabilitation",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Expansion Joint Fracture", confidence: 0.94, x: 15, y: 30, width: 68, height: 22 },
      { label: "Concrete Spalling (D50)", confidence: 0.88, x: 42, y: 55, width: 30, height: 25 }
    ],
    lastInspection: "2026-08-11",
    maintenanceHistory: [
      { date: "2024-11-20", action: "Joint Sealant Injection", cost: 450000, vendor: "L&T Infrastructure Services", conditionAfter: 68 }
    ],
    explainability: {
      summary: "Critical elevated corridor connecting Coimbatore International Airport and TIDEL Park IT hub.",
      topFactors: [
        { factor: "Strategic Transit Criticality", impact: "Critical", weight: 0.20, scoreContribution: 19.6, description: "Direct arterial connectivity to airport and medical colleges." },
        { factor: "Structural Joint Failure", impact: "Critical", weight: 0.25, scoreContribution: 22.8, description: "Concrete delamination around bearing pads threatening structural load distribution." },
        { factor: "Heavy Vehicle Dynamic Impact", impact: "High", weight: 0.15, scoreContribution: 14.4, description: "Continuous intercity bus and heavy freight vibrations." }
      ],
      whyRank: "Ranked #2 due to vital airport connectivity and imminent bearing damage risk if unaddressed before upcoming monsoon.",
      preventativeROI: "5.6x Preventative Ratio"
    }
  },
  {
    id: "civicx-ast-003",
    assetId: "DR-3051",
    name: "Ukkadam Big Bazaar Primary Stormwater Culvert",
    type: "Drainage",
    location: "Big Bazaar Street - Sungam Bypass, Ukkadam",
    ward: "Ward 61",
    zone: "South Zone",
    latitude: 10.9925,
    longitude: 76.9614,
    conditionScore: 18,
    damageSeverity: 91,
    damageType: "Major Siltation, Structural Wall Cracking & Collapse Hazard",
    riskScore: 88,
    riskLevel: "Critical",
    criticality: "High",
    criticalityScore: 88,
    usage: "7.8 sq km Urban Catchment Discharge",
    usageScore: 84,
    historicalTrend: "Critical Capacity Degradation (Flow reduced by 65%)",
    trendScore: 89,
    environmentalExposure: "Severe Silt Influx & Chemical Runoff",
    exposureScore: 90,
    estimatedRepairCost: 1250000, // ₹12.5 Lakhs
    priorityRank: 3,
    recommendedAction: "Reinforced Concrete Box Desilting, Jacketing & Precast Symmetrical Invert Liners",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Masonry Wall Shear Crack", confidence: 0.93, x: 30, y: 25, width: 45, height: 40 },
      { label: "Sediment Blockage (80%)", confidence: 0.97, x: 10, y: 62, width: 80, height: 30 }
    ],
    lastInspection: "2026-08-08",
    maintenanceHistory: [
      { date: "2025-05-15", action: "Mechanical Desilting", cost: 180000, vendor: "City EcoClean Infra", conditionAfter: 60 }
    ],
    explainability: {
      summary: "Blockage in primary culvert creates immediate 4-ward urban flash flood hazard affecting 35,000 residents.",
      topFactors: [
        { factor: "Flood Mitigation Criticality", impact: "Critical", weight: 0.20, scoreContribution: 17.6, description: "Direct conduit to Ukkadam Valankulam Lake; failure induces flood backups into residential zones." },
        { factor: "Structural Invert Degradation", impact: "High", weight: 0.25, scoreContribution: 20.5, description: "Bottom slab erosion undermining side wall stability." }
      ],
      whyRank: "Ranked #3 because ₹1.25M expenditure eliminates ₹14M in annual monsoon flood damages and commercial shutdown.",
      preventativeROI: "11.2x Community Damage Prevention ROI"
    }
  },
  {
    id: "civicx-ast-004",
    assetId: "FL-4008",
    name: "100 Feet Road Flyover Western Ramp",
    type: "Flyover",
    location: "100 Feet Road - Tatabad Cross, Gandhipuram",
    ward: "Ward 22",
    zone: "Central Zone",
    latitude: 11.0215,
    longitude: 76.9632,
    conditionScore: 28,
    damageSeverity: 82,
    damageType: "Approach Slab Settlement & Longitudinal Joint Separation",
    riskScore: 84,
    riskLevel: "Critical",
    criticality: "High",
    criticalityScore: 86,
    usage: "Commercial Freight Corridor (36,000 PCU/day)",
    usageScore: 80,
    historicalTrend: "Settlement rate doubled over last 6 months",
    trendScore: 82,
    environmentalExposure: "Heavy Dynamic Braking Stresses",
    exposureScore: 75,
    estimatedRepairCost: 2800000, // ₹28.0 Lakhs
    priorityRank: 4,
    recommendedAction: "Polyurethane Foam Stabilization & Sub-base Slab Jacking",
    image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Longitudinal Crack (D00)", confidence: 0.92, x: 20, y: 35, width: 55, height: 30 }
    ],
    lastInspection: "2026-08-02",
    maintenanceHistory: [
      { date: "2024-08-12", action: "Asphalt Leveling Course", cost: 380000, vendor: "Kongu Highway Concessions", conditionAfter: 70 }
    ],
    explainability: {
      summary: "Sudden 45mm vertical approach deflection causing vehicle suspension stress and speed drop.",
      topFactors: [
        { factor: "Subgrade Voids", impact: "High", weight: 0.25, scoreContribution: 18.0, description: "Soil washout beneath approach slab causing cantilevered bending stresses." },
        { factor: "Traffic Impact", impact: "High", weight: 0.15, scoreContribution: 12.0, description: "Heavy commercial trucks decelerating onto ramp." }
      ],
      whyRank: "Ranked #4 due to high risk of ramp closure during festive shopping season if joint shears further.",
      preventativeROI: "3.8x ROI"
    }
  },
  {
    id: "civicx-ast-005",
    assetId: "RD-1088",
    name: "RS Puram DB Road Commercial Boulevard",
    type: "Road",
    location: "Diwan Bahadur Road, RS Puram",
    ward: "Ward 53",
    zone: "West Zone",
    latitude: 11.0084,
    longitude: 76.9497,
    conditionScore: 34,
    damageSeverity: 76,
    damageType: "Edge Cracking, Utility Trench Depression & Ravelling",
    riskScore: 77,
    riskLevel: "Critical",
    criticality: "Medium",
    criticalityScore: 72,
    usage: "High Pedestrian & Shopper Traffic (28,000 PCU/day)",
    usageScore: 74,
    historicalTrend: "Accelerated wear along utility cuts",
    trendScore: 78,
    environmentalExposure: "Heavy Parking Friction & Drainage Overflow",
    exposureScore: 70,
    estimatedRepairCost: 1400000, // ₹14.0 Lakhs
    priorityRank: 5,
    recommendedAction: "Micro-surfacing & Utility Re-trench Stabilization",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Trench Depression (D44)", confidence: 0.89, x: 18, y: 42, width: 60, height: 24 }
    ],
    lastInspection: "2026-07-29",
    maintenanceHistory: [
      { date: "2025-02-14", action: "Patch Re-carpeting", cost: 150000, vendor: "West Zone Municipal Works", conditionAfter: 72 }
    ],
    explainability: {
      summary: "Utility reinstatements failing along prime commercial corridor creating two-wheeler skid hazards.",
      topFactors: [
        { factor: "Pavement Surface Irregularity", impact: "High", weight: 0.25, scoreContribution: 16.5, description: "Uneven settlement along fiber-optic trench lines." },
        { factor: "Pedestrian Safety Risk", impact: "Moderate", weight: 0.20, scoreContribution: 14.4, description: "High footfall street with kerb-side rutting." }
      ],
      whyRank: "Ranked #5 balancing high public visibility, accident rate reduction, and cost-effective preventative overlay.",
      preventativeROI: "3.4x ROI"
    }
  },
  {
    id: "civicx-ast-006",
    assetId: "RD-1120",
    name: "Singanallur Trichy Road High-Density Junction",
    type: "Road",
    location: "Trichy Road - Singanallur Bus Stand Circle",
    ward: "Ward 59",
    zone: "East Zone",
    latitude: 10.9992,
    longitude: 77.0185,
    conditionScore: 38,
    damageSeverity: 72,
    damageType: "Rutting Under Bus Wheelpaths & Surface Bleeding",
    riskScore: 74,
    riskLevel: "High",
    criticality: "High",
    criticalityScore: 88,
    usage: "National Highway Corridor (54,000 PCU/day)",
    usageScore: 94,
    historicalTrend: "Rut depth expanding by 4mm every quarter",
    trendScore: 76,
    environmentalExposure: "High Ambient Heat & Heavy Stopping Friction",
    exposureScore: 82,
    estimatedRepairCost: 2100000, // ₹21.0 Lakhs
    priorityRank: 6,
    recommendedAction: "Polymer Modified Bitumen (PMB-40) High-Shear Resurfacing",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Wheelpath Rutting (D43)", confidence: 0.94, x: 25, y: 40, width: 50, height: 35 }
    ],
    lastInspection: "2026-08-01",
    maintenanceHistory: [
      { date: "2024-09-05", action: "Milling & Overlay", cost: 950000, vendor: "State Highways Dept", conditionAfter: 82 }
    ],
    explainability: {
      summary: "Significant rutting from heavy city buses causing hydroplaning risks during sudden downpours.",
      topFactors: [
        { factor: "Heavy Bus Braking Stress", impact: "Critical", weight: 0.25, scoreContribution: 17.5, description: "Repeated shear forces at bus stop approach causing plastic deformation." },
        { factor: "High Traffic Density", impact: "High", weight: 0.15, scoreContribution: 14.1, description: "National highway junction carrying interstate cargo." }
      ],
      whyRank: "Ranked #6 due to high speed corridor risk; requires high-strength polymer mix.",
      preventativeROI: "4.2x ROI"
    }
  },
  {
    id: "civicx-ast-007",
    assetId: "BR-2035",
    name: "Sungam Lake Bypass Causeway Bridge",
    type: "Bridge",
    location: "Sungam Bypass Road, Ramanathapuram",
    ward: "Ward 63",
    zone: "South Zone",
    latitude: 10.9961,
    longitude: 76.9834,
    conditionScore: 42,
    damageSeverity: 68,
    damageType: "Pier Scour & Parapet Wall Structural Degradation",
    riskScore: 71,
    riskLevel: "High",
    criticality: "High",
    criticalityScore: 82,
    usage: "Arterial Bypass (38,000 PCU/day)",
    usageScore: 80,
    historicalTrend: "Scour depth increased 30cm following last heavy season",
    trendScore: 75,
    environmentalExposure: "Continuous Water Submergence & Wave Action",
    exposureScore: 86,
    estimatedRepairCost: 3100000, // ₹31.0 Lakhs
    priorityRank: 7,
    recommendedAction: "Riprap Scour Protection & Carbon-Fiber Pier Wrap Strengthening",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Pier Concrete Erosion", confidence: 0.89, x: 35, y: 50, width: 30, height: 30 }
    ],
    lastInspection: "2026-07-22",
    maintenanceHistory: [
      { date: "2023-12-10", action: "Parapet Painting & Concrete Patching", cost: 220000, vendor: "South Zone Infra", conditionAfter: 75 }
    ],
    explainability: {
      summary: "Underwater foundation scouring undermining Pier 3 stability during high lake discharge.",
      topFactors: [
        { factor: "Hydraulic Scour Action", impact: "High", weight: 0.25, scoreContribution: 16.8, description: "Lake discharge currents creating vortex erosion around pier base." },
        { factor: "Bypass Traffic Reliever", impact: "High", weight: 0.20, scoreContribution: 16.4, description: "Key relief route avoiding central city bottlenecks." }
      ],
      whyRank: "Ranked #7 to preempt costly emergency bridge closure.",
      preventativeROI: "6.1x ROI"
    }
  },
  {
    id: "civicx-ast-008",
    assetId: "RD-1155",
    name: "Saravanampatti IT Corridor Expressway Stretch",
    type: "Road",
    location: "Sathy Road near CHIL SEZ / KGISL, Saravanampatti",
    ward: "Ward 12",
    zone: "North Zone",
    latitude: 11.0805,
    longitude: 76.9967,
    conditionScore: 46,
    damageSeverity: 64,
    damageType: "Longitudinal Seam Separation & Minor Ravelling",
    riskScore: 68,
    riskLevel: "High",
    criticality: "Medium",
    criticalityScore: 75,
    usage: "Tech Hub Commuter Route (41,000 PCU/day)",
    usageScore: 82,
    historicalTrend: "Gradual lane joint widening",
    trendScore: 68,
    environmentalExposure: "High Speed Heavy Vehicle Braking Zone",
    exposureScore: 65,
    estimatedRepairCost: 1650000, // ₹16.5 Lakhs
    priorityRank: 8,
    recommendedAction: "Pavement Joint Crack Sealing & 40mm Dense Bituminous Macadam (DBM)",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Longitudinal Seam Crack", confidence: 0.91, x: 48, y: 20, width: 12, height: 65 }
    ],
    lastInspection: "2026-08-05",
    maintenanceHistory: [
      { date: "2024-05-18", action: "Crack Sealing", cost: 180000, vendor: "North Zone Works", conditionAfter: 78 }
    ],
    explainability: {
      summary: "Rapid traffic growth along Coimbatore's primary IT hub creating seam fractures.",
      topFactors: [
        { factor: "Corridor Growth Stress", impact: "High", weight: 0.20, scoreContribution: 15.0, description: "Rapid escalation in morning/evening employee cab and bus volumes." }
      ],
      whyRank: "Ranked #8 as high-impact preventative intervention before micro-cracks develop into structural potholes.",
      preventativeROI: "4.5x ROI"
    }
  },
  {
    id: "civicx-ast-009",
    assetId: "CU-5012",
    name: "Ganapathy Sathy Road Drainage Box Culvert",
    type: "Culvert",
    location: "Textool Junction, Athipalayam Road, Ganapathy",
    ward: "Ward 18",
    zone: "North Zone",
    latitude: 11.0392,
    longitude: 76.9782,
    conditionScore: 48,
    damageSeverity: 62,
    damageType: "Headwall Erosion & Invert Siltation",
    riskScore: 65,
    riskLevel: "High",
    criticality: "Medium",
    criticalityScore: 68,
    usage: "Stormwater Channel & Road Crossing",
    usageScore: 65,
    historicalTrend: "Moderate silt buildup",
    trendScore: 64,
    environmentalExposure: "Industrial Effluent Runoff",
    exposureScore: 72,
    estimatedRepairCost: 850000, // ₹8.5 Lakhs
    priorityRank: 9,
    recommendedAction: "Masonry Headwall Rebuilding & Concrete Invert Channeling",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Culvert Headwall Spalling", confidence: 0.87, x: 20, y: 30, width: 40, height: 45 }
    ],
    lastInspection: "2026-07-19",
    maintenanceHistory: [
      { date: "2024-03-22", action: "Channel Clearance", cost: 95000, vendor: "Ganapathy Civic Works", conditionAfter: 74 }
    ],
    explainability: {
      summary: "Culvert headwall crumbling under roadside soil weight, risking shoulder collapse.",
      topFactors: [
        { factor: "Headwall Shear", impact: "High", weight: 0.25, scoreContribution: 15.5, description: "Structural masonry detachment." }
      ],
      whyRank: "Ranked #9 providing high cost-to-risk reduction efficiency (₹8.5L).",
      preventativeROI: "5.2x ROI"
    }
  },
  {
    id: "civicx-ast-010",
    assetId: "RD-1204",
    name: "Saibaba Colony NSR Road Commercial Spine",
    type: "Road",
    location: "NSR Road - Mettupalayam Rd Junction, Saibaba Colony",
    ward: "Ward 28",
    zone: "West Zone",
    latitude: 11.0289,
    longitude: 76.9452,
    conditionScore: 52,
    damageSeverity: 58,
    damageType: "Minor Transverse Cracking & Manhole Collar Depressions",
    riskScore: 61,
    riskLevel: "High",
    criticality: "Medium",
    criticalityScore: 65,
    usage: "Mixed Residential/Commercial (22,000 PCU/day)",
    usageScore: 66,
    historicalTrend: "Localized subsidence around sewage access shafts",
    trendScore: 62,
    environmentalExposure: "Normal Urban Drainage",
    exposureScore: 55,
    estimatedRepairCost: 920000, // ₹9.2 Lakhs
    priorityRank: 10,
    recommendedAction: "Manhole Ring Raising, Bituminous Leveling & Skid-Resistant Seal",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Manhole Depression (D44)", confidence: 0.93, x: 40, y: 45, width: 25, height: 25 }
    ],
    lastInspection: "2026-07-28",
    maintenanceHistory: [
      { date: "2025-01-08", action: "Cold Patching", cost: 85000, vendor: "West Zone Maintenance", conditionAfter: 76 }
    ],
    explainability: {
      summary: "Sunken manhole frames creating hazardous bumps for two-wheelers on lively commercial high street.",
      topFactors: [
        { factor: "Two-Wheeler Safety", impact: "Moderate", weight: 0.20, scoreContribution: 13.0, description: "Frequent sudden swerving incidents reported." }
      ],
      whyRank: "Ranked #10 with affordable rapid municipal fix.",
      preventativeROI: "3.1x ROI"
    }
  },
  {
    id: "civicx-ast-011",
    assetId: "RD-1240",
    name: "Ramanathapuram Nanjundapuram Main Road",
    type: "Road",
    location: "Nanjundapuram Road - Podanur Link, Ramanathapuram",
    ward: "Ward 64",
    zone: "South Zone",
    latitude: 10.9842,
    longitude: 76.9945,
    conditionScore: 58,
    damageSeverity: 50,
    damageType: "Edge Ravelling & Shoulder Erosion",
    riskScore: 52,
    riskLevel: "High",
    criticality: "Medium",
    criticalityScore: 60,
    usage: "Suburban Feeder (19,000 PCU/day)",
    usageScore: 58,
    historicalTrend: "Progressive edge deterioration during rain",
    trendScore: 55,
    environmentalExposure: "Agricultural Runoff & Soft Shoulders",
    exposureScore: 62,
    estimatedRepairCost: 780000, // ₹7.8 Lakhs
    priorityRank: 11,
    recommendedAction: "Concrete Kerb Installation & Bituminous Edge Re-profiling",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Edge Ravelling", confidence: 0.86, x: 10, y: 55, width: 25, height: 30 }
    ],
    lastInspection: "2026-07-15",
    maintenanceHistory: [
      { date: "2024-07-20", action: "Shoulder Grading", cost: 110000, vendor: "Ramanathapuram Works", conditionAfter: 72 }
    ],
    explainability: {
      summary: "Shoulder drop-off endangering cyclists and school vans.",
      topFactors: [
        { factor: "Edge Support Loss", impact: "Moderate", weight: 0.25, scoreContribution: 13.0, description: "Loss of lateral pavement confinement." }
      ],
      whyRank: "Ranked #11.",
      preventativeROI: "2.8x ROI"
    }
  },
  {
    id: "civicx-ast-012",
    assetId: "TC-6001",
    name: "Avinashi Road Express Bus Corridor Junction",
    type: "Traffic Corridor",
    location: "Lakshmi Mills Junction, Avinashi Rd, Pappanaickenpalayam",
    ward: "Ward 32",
    zone: "Central Zone",
    latitude: 11.0142,
    longitude: 76.9856,
    conditionScore: 64,
    damageSeverity: 44,
    damageType: "Thermoplastic Lane Line Fade & Minor Friction Loss",
    riskScore: 46,
    riskLevel: "Medium",
    criticality: "High",
    criticalityScore: 80,
    usage: "Core Commuter Corridor (58,000 PCU/day)",
    usageScore: 88,
    historicalTrend: "Gradual optical degradation of markings",
    trendScore: 45,
    environmentalExposure: "High Solar UV Degradation",
    exposureScore: 50,
    estimatedRepairCost: 480000, // ₹4.8 Lakhs
    priorityRank: 12,
    recommendedAction: "High-Reflectivity Thermoplastic Re-striping & Tactile Warning Studs",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Faded Marking", confidence: 0.95, x: 30, y: 60, width: 40, height: 20 }
    ],
    lastInspection: "2026-08-10",
    maintenanceHistory: [
      { date: "2025-03-12", action: "Cold Paint Marking", cost: 140000, vendor: "Traffic Engineering Div", conditionAfter: 85 }
    ],
    explainability: {
      summary: "Heavy traffic node with night-time lane drift issues due to weathered markings.",
      topFactors: [
        { factor: "Corridor Throughput", impact: "High", weight: 0.20, scoreContribution: 16.0, description: "High vehicle velocity and multi-lane merges." }
      ],
      whyRank: "Ranked #12; low cost high impact visual safety improvement.",
      preventativeROI: "6.5x ROI"
    }
  },
  {
    id: "civicx-ast-013",
    assetId: "RD-1290",
    name: "Thudiyalur Mettupalayam Highway Feeder",
    type: "Road",
    location: "Mettupalayam Highway - Thudiyalur Junction",
    ward: "Ward 04",
    zone: "North Zone",
    latitude: 11.0772,
    longitude: 76.9421,
    conditionScore: 68,
    damageSeverity: 38,
    damageType: "Hairline Cracking & Minor Surface Bleeding",
    riskScore: 42,
    riskLevel: "Medium",
    criticality: "Medium",
    criticalityScore: 65,
    usage: "Interdistrict Passenger Route (32,000 PCU/day)",
    usageScore: 68,
    historicalTrend: "Stable pavement profile",
    trendScore: 38,
    environmentalExposure: "Open Highway Weathering",
    exposureScore: 48,
    estimatedRepairCost: 620000, // ₹6.2 Lakhs
    priorityRank: 13,
    recommendedAction: "Fog Seal Application & Preventative Rejuvenation",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Hairline Crack", confidence: 0.84, x: 35, y: 45, width: 30, height: 20 }
    ],
    lastInspection: "2026-07-12",
    maintenanceHistory: [
      { date: "2024-10-15", action: "Surface Seal", cost: 210000, vendor: "North Highways", conditionAfter: 82 }
    ],
    explainability: {
      summary: "Early-stage micro cracks suitable for ultra-low-cost preventative sealing.",
      topFactors: [
        { factor: "Preventative Window", impact: "Moderate", weight: 0.25, scoreContribution: 10.5, description: "Intervention now halts water intrusion before monsoon." }
      ],
      whyRank: "Ranked #13.",
      preventativeROI: "7.8x Preventative ROI"
    }
  },
  {
    id: "civicx-ast-014",
    assetId: "DR-3088",
    name: "Singanallur Boat House Lake Outfall Canal",
    type: "Drainage",
    location: "Singanallur Lake Bund Road, Singanallur",
    ward: "Ward 58",
    zone: "East Zone",
    latitude: 10.9884,
    longitude: 77.0245,
    conditionScore: 72,
    damageSeverity: 34,
    damageType: "Aquatic Weed Accumulation & Masonry Mortar Leaching",
    riskScore: 39,
    riskLevel: "Medium",
    criticality: "Medium",
    criticalityScore: 62,
    usage: "Lake Overflow Catchment (12 sq km)",
    usageScore: 55,
    historicalTrend: "Slow vegetation expansion",
    trendScore: 36,
    environmentalExposure: "Perennial Water Contact",
    exposureScore: 60,
    estimatedRepairCost: 390000, // ₹3.9 Lakhs
    priorityRank: 14,
    recommendedAction: "Hydro-Weed Clearance & Stone Masonry Pointing",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Weed Obstruction", confidence: 0.91, x: 20, y: 50, width: 50, height: 30 }
    ],
    lastInspection: "2026-07-05",
    maintenanceHistory: [
      { date: "2025-04-10", action: "Manual Desilting", cost: 80000, vendor: "EcoClean East", conditionAfter: 86 }
    ],
    explainability: {
      summary: "Minor channel resistance during peak thunderstorm discharge.",
      topFactors: [
        { factor: "Drainage Clearance", impact: "Moderate", weight: 0.20, scoreContribution: 11.0, description: "Weed growth slows water flow by 18%." }
      ],
      whyRank: "Ranked #14.",
      preventativeROI: "3.5x ROI"
    }
  },
  {
    id: "civicx-ast-015",
    assetId: "RD-1310",
    name: "Town Hall Oppanakkara Street Heritage Lane",
    type: "Road",
    location: "Oppanakkara St - Raja St Cross, Town Hall",
    ward: "Ward 70",
    zone: "Central Zone",
    latitude: 10.9981,
    longitude: 76.9602,
    conditionScore: 75,
    damageSeverity: 28,
    damageType: "Paver Block Dislodgement & Minor Settlement",
    riskScore: 34,
    riskLevel: "Medium",
    criticality: "Low",
    criticalityScore: 48,
    usage: "Pedestrianized Commercial Area (14,000 PCU/day)",
    usageScore: 45,
    historicalTrend: "Stable",
    trendScore: 25,
    environmentalExposure: "Dense Pedestrian Walking Zone",
    exposureScore: 35,
    estimatedRepairCost: 280000, // ₹2.8 Lakhs
    priorityRank: 15,
    recommendedAction: "Paver Interlock Re-bedding & Sand Joint Refilling",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [
      { label: "Dislodged Paver", confidence: 0.88, x: 45, y: 65, width: 20, height: 18 }
    ],
    lastInspection: "2026-06-25",
    maintenanceHistory: [
      { date: "2024-11-14", action: "Paver Realignment", cost: 45000, vendor: "Town Hall Works", conditionAfter: 88 }
    ],
    explainability: {
      summary: "Localized paver block loosening in heritage market district.",
      topFactors: [
        { factor: "Pedestrian Comfort", impact: "Low", weight: 0.15, scoreContribution: 6.5, description: "Trip hazard mitigation." }
      ],
      whyRank: "Ranked #15.",
      preventativeROI: "2.2x ROI"
    }
  },
  {
    id: "civicx-ast-016",
    assetId: "RD-1350",
    name: "Kuniyamuthur Palakkad Main Road Ring",
    type: "Road",
    location: "Palakkad Main Road, Kuniyamuthur",
    ward: "Ward 85",
    zone: "South Zone",
    latitude: 10.9654,
    longitude: 76.9532,
    conditionScore: 82,
    damageSeverity: 20,
    damageType: "Superficial Weathering & Minor Aggregate Polish",
    riskScore: 24,
    riskLevel: "Low",
    criticality: "Medium",
    criticalityScore: 55,
    usage: "Interstate Route (26,000 PCU/day)",
    usageScore: 60,
    historicalTrend: "Low deterioration index",
    trendScore: 18,
    environmentalExposure: "Well-drained Elevated Embankment",
    exposureScore: 30,
    estimatedRepairCost: 350000, // ₹3.5 Lakhs
    priorityRank: 16,
    recommendedAction: "Routine High-Pressure Cleaning & Skid Testing Inspection",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [],
    lastInspection: "2026-07-02",
    maintenanceHistory: [
      { date: "2025-01-20", action: "Full Recarpet", cost: 1400000, vendor: "South Highways Corp", conditionAfter: 94 }
    ],
    explainability: {
      summary: "Asset in good health; maintain routine monitoring cycles.",
      topFactors: [
        { factor: "Structural Integrity Intact", impact: "Low", weight: 0.25, scoreContribution: 4.5, description: "Pavement cross-section intact." }
      ],
      whyRank: "Ranked #16; low priority for capital intervention.",
      preventativeROI: "1.4x ROI"
    }
  },
  {
    id: "civicx-ast-017",
    assetId: "BR-2060",
    name: "Noyyal River New Concrete Girder Bridge",
    type: "Bridge",
    location: "Perur Main Road - Noyyal River Crossing, Perur",
    ward: "Ward 74",
    zone: "West Zone",
    latitude: 10.9815,
    longitude: 76.9248,
    conditionScore: 88,
    damageSeverity: 12,
    damageType: "Minor Drainage Spout Silt Accumulation",
    riskScore: 16,
    riskLevel: "Low",
    criticality: "Medium",
    criticalityScore: 58,
    usage: "Perur Temple Trunk Road (21,000 PCU/day)",
    usageScore: 52,
    historicalTrend: "Excellent load deflection response",
    trendScore: 12,
    environmentalExposure: "Clean Stream Runoff",
    exposureScore: 25,
    estimatedRepairCost: 120000, // ₹1.2 Lakhs
    priorityRank: 17,
    recommendedAction: "Drainage Scupper Cleanout & Routine Bearing Greasing",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [],
    lastInspection: "2026-06-18",
    maintenanceHistory: [
      { date: "2024-02-10", action: "Inaugural Commissioning Inspection", cost: 50000, vendor: "PWD Bridges Division", conditionAfter: 98 }
    ],
    explainability: {
      summary: "Modern bridge asset commissioned in 2024 operating well within design parameters.",
      topFactors: [
        { factor: "Healthy Asset", impact: "Low", weight: 0.25, scoreContribution: 3.0, description: "Minimal wear recorded." }
      ],
      whyRank: "Ranked #17; minimal maintenance required.",
      preventativeROI: "1.1x ROI"
    }
  },
  {
    id: "civicx-ast-018",
    assetId: "RD-1402",
    name: "Race Course Outer Jogging & Transit Loop",
    type: "Road",
    location: "Race Course Road Ring, Thomas Park",
    ward: "Ward 62",
    zone: "Central Zone",
    latitude: 11.0024,
    longitude: 76.9745,
    conditionScore: 92,
    damageSeverity: 8,
    damageType: "None / Nominal Surface Oxidation",
    riskScore: 11,
    riskLevel: "Low",
    criticality: "Low",
    criticalityScore: 40,
    usage: "Model Smart City Boulevard (16,000 PCU/day)",
    usageScore: 38,
    historicalTrend: "Negligible degradation",
    trendScore: 8,
    environmentalExposure: "Tree Canopy Protected Corridor",
    exposureScore: 20,
    estimatedRepairCost: 80000, // ₹0.8 Lakhs
    priorityRank: 18,
    recommendedAction: "Scheduled Annual Visual Audit",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
    detectedBBoxes: [],
    lastInspection: "2026-08-10",
    maintenanceHistory: [
      { date: "2025-05-02", action: "Smart City Landscaping & Seal", cost: 320000, vendor: "Coimbatore Smart City SPV", conditionAfter: 96 }
    ],
    explainability: {
      summary: "Pristine Smart City showpiece road; ideal baseline model for pavement longevity.",
      topFactors: [
        { factor: "Optimal Drainage & Base", impact: "Low", weight: 0.25, scoreContribution: 2.0, description: "Excellent construction quality." }
      ],
      whyRank: "Ranked #18; zero immediate intervention required.",
      preventativeROI: "1.0x ROI"
    }
  }
];

export const DEMO_SUMMARY: DashboardSummary = {
  city: "Coimbatore",
  region: "Tamil Nadu, India",
  totalAssets: 1248,
  highRiskAssets: 86,
  criticalAssets: 19,
  mediumRiskAssets: 412,
  lowRiskAssets: 731,
  activeRepairPlanCost: 18400000, // ₹18.4M
  availableBudget: 25000000, // ₹25.0M
  riskDistribution: {
    critical: 19,
    high: 86,
    medium: 412,
    low: 731
  },
  categoryRisk: [
    { category: 'Road', total: 684, avgRisk: 52, criticalCount: 11, totalEstCost: 28400000 },
    { category: 'Bridge', total: 46, avgRisk: 48, criticalCount: 3, totalEstCost: 16500000 },
    { category: 'Drainage', total: 290, avgRisk: 58, criticalCount: 3, totalEstCost: 12200000 },
    { category: 'Culvert', total: 118, avgRisk: 44, criticalCount: 1, totalEstCost: 5800000 },
    { category: 'Flyover', total: 14, avgRisk: 61, criticalCount: 1, totalEstCost: 8900000 },
    { category: 'Traffic Corridor', total: 96, avgRisk: 39, criticalCount: 0, totalEstCost: 4100000 }
  ],
  recentAlerts: [
    { id: 'alt-1', assetId: 'RD-1042', name: 'Gandhipuram Underpass Inbound Arterial', risk: 93, riskLevel: 'Critical', timestamp: '14 mins ago', action: 'Structural Milling' },
    { id: 'alt-2', assetId: 'BR-2019', name: 'Peelamedu Avinashi Road Rail Overbridge', risk: 91, riskLevel: 'Critical', timestamp: '1 hour ago', action: 'Joint Replacement' },
    { id: 'alt-3', assetId: 'DR-3051', name: 'Ukkadam Big Bazaar Primary Culvert', risk: 88, riskLevel: 'Critical', timestamp: '3 hours ago', action: 'RC Jacketing' },
    { id: 'alt-4', assetId: 'FL-4008', name: '100 Feet Road Flyover Western Ramp', risk: 84, riskLevel: 'Critical', timestamp: '5 hours ago', action: 'Slab Jacking' }
  ]
};
