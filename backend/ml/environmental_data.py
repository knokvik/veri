import requests
import logging

logger = logging.getLogger(__name__)

def get_environmental_data(lat: float, lng: float) -> dict:
    """
    Fetches environmental data from multiple free sources using coordinates.
    Includes NASA POWER for climatology and Open-Meteo for topography.
    """
    data = {
        "nasa_power_weather": None,
        "open_meteo_topography": None,
        "soil_placeholder": "Loamy/Clay expected based on regional default"
    }

    # 1. Fetch Elevation from Open-Meteo
    try:
        url_elevation = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lng}"
        resp_ele = requests.get(url_elevation, timeout=10)
        if resp_ele.status_code == 200:
            elev_data = resp_ele.json()
            elevation = elev_data.get("elevation", [0])[0]
            data["open_meteo_topography"] = {
                "elevation_meters": elevation,
                "slope_estimate": "Relatively Flat" if elevation < 500 else "Hilly/Steep",
                "source": "Open-Meteo Elevation API"
            }
        else:
            logger.warning(f"Failed to fetch elevation: {resp_ele.status_code}")
            data["open_meteo_topography"] = {"elevation_meters": 0, "slope_estimate": "Unknown", "source": "Fallback"}
    except Exception as e:
        logger.error(f"Elevation API error: {e}")
        data["open_meteo_topography"] = {"elevation_meters": 0, "slope_estimate": "Unknown", "source": "Fallback Error"}

    # 2. Fetch Weather Climatology from NASA POWER
    try:
        # T2M = Temperature at 2 Meters, PRECTOTCORR = Precipitation Total Corrected
        url_nasa = f"https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR&community=AG&longitude={lng}&latitude={lat}&format=JSON"
        resp_nasa = requests.get(url_nasa, timeout=10)
        if resp_nasa.status_code == 200:
            nasa_json = resp_nasa.json()
            params = nasa_json.get("properties", {}).get("parameter", {})
            
            # Extract Annual averages
            ann_temp = params.get("T2M", {}).get("ANN", 0.0)
            ann_precip = params.get("PRECTOTCORR", {}).get("ANN", 0.0)
            
            data["nasa_power_weather"] = {
                "annual_average_temperature_c": ann_temp,
                "annual_average_precipitation_mm_day": ann_precip,
                "estimated_annual_rainfall_mm": round(ann_precip * 365, 2),
                "source": "NASA POWER Project"
            }
        else:
            logger.warning(f"Failed to fetch NASA power: {resp_nasa.status_code}")
            data["nasa_power_weather"] = {"error": "Could not fetch climatology data."}
    except Exception as e:
        logger.error(f"NASA POWER API error: {e}")
        data["nasa_power_weather"] = {"error": str(e)}

    return data
