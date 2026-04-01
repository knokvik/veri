import os
from datetime import datetime, timedelta

def analyze_satellite_data(lat: float, lng: float, planting_date_str: str, land_area_hectares: float) -> dict:
    """
    Simulates Google Earth Engine Sentinel-2 Data Analysis.
    Returns NDVI, canopy cover, biomass estimate, and change from baseline.
    """
    try:
        planting_date = datetime.strptime(planting_date_str, "%Y-%m-%d")
    except ValueError:
        planting_date = datetime.now() - timedelta(days=90)
    
    current_date = datetime.now()
    days_since_planting = (current_date - planting_date).days
    
    # 1. Simulate fetching historical baseline (Pre-Planting)
    # Typically bare soil or degraded land has NDVI ~ 0.15
    baseline_ndvi = 0.15
    
    # 2. Simulate current NDVI based on growth time
    if days_since_planting < 30:
        current_ndvi = baseline_ndvi + 0.05 # Barely visible
    elif days_since_planting < 180:
        current_ndvi = 0.45 # Moderate growth
    else:
        current_ndvi = 0.78 # Dense, healthy foliage
    
    # 3. Calculate metrics
    ndvi_delta = current_ndvi - baseline_ndvi
    change_from_baseline_percent = (ndvi_delta / baseline_ndvi * 100) if baseline_ndvi > 0 else 0
    
    canopy_cover_percentage = min(100.0, current_ndvi * 105)
    
    # Biomass Estimate (Tons) - Simple allometric approximation
    biomass_estimate = 12.47 * (2.71828 ** (2.85 * current_ndvi)) * land_area_hectares
    
    # Temporal Check
    temporal_check = "VALID" if days_since_planting > 0 else "INVALID_FUTURE_DATE"
    if days_since_planting > 0 and days_since_planting < 30 and current_ndvi > 0.6:
        temporal_check = "SUSPICIOUS_UNREALISTIC_GROWTH"

    maps_key = os.getenv("GOOGLE_MAPS_STATIC_API_KEY")
    satellite_preview_url = None
    if maps_key:
        satellite_preview_url = (
            "https://maps.googleapis.com/maps/api/staticmap"
            f"?center={lat},{lng}&zoom=17&size=800x500&maptype=satellite&key={maps_key}"
        )

    return {
        "status": "success",
        "platform": "Google Earth Engine (Simulated)",
        "sensor": "Sentinel-2",
        "is_live_observation": False,
        "source_reliability": 0.35,
        "coordinates": {"lat": lat, "lng": lng},
        "days_since_planting": days_since_planting,
        "temporal_check": temporal_check,
        
        "baseline_ndvi": round(baseline_ndvi, 3),
        "current_ndvi": round(current_ndvi, 3),
        "change_from_baseline": round(change_from_baseline_percent, 1),
        
        "canopy_cover_percentage": round(canopy_cover_percentage, 1),
        "estimated_biomass_tons": round(biomass_estimate, 2),
        "satellite_preview_url": satellite_preview_url,
        "notes": [
            "Fallback mode: using synthetic growth estimates because live GEE retrieval failed or was unavailable."
        ],
    }
