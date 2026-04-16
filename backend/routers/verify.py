import os
import shutil
from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from typing import Dict, Any

from ml.deepforest_model import analyze_vision
from ml.gee_satellite import analyze_satellite

router = APIRouter()

class LLMVerifyRequest(BaseModel):
    project_id: str
    vision_results: Dict[str, Any]
    satellite_results: Dict[str, Any]
    project_data: Dict[str, Any]

@router.post("/vision")
async def verify_vision(file: UploadFile = File(...)):
    """
    Saves the uploaded image temporarily and processes it with DeepForest.
    Returns structurally real data.
    """
    temp_file_path = f"temp_{file.filename}"
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Pass the legitimate file path to our DeepForest wrapper
        result = analyze_vision(temp_file_path)
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return result

@router.post("/satellite")
async def verify_satellite(lat: float, lng: float):
    """
    Triggers Google Earth Engine proxy over given coordinates.
    """
    result = analyze_satellite(lat, lng)
    return result

@router.post("/llm")
async def verify_llm(payload: LLMVerifyRequest):
    """
    @@@ PLACEHOLDER FOR VERTEX GENERATIVE AI INTEGRATION @@@
    
    This endpoint is strictly positioned to be rewritten by the future Developer 
    to dispatch the `payload` to Vertex Generative AI APIs.
    
    Vertex prompt parameters must derive from:
    - payload.vision_results (tree_count, health_score, survival)
    - payload.satellite_results (ndvi, biomass, canopy cover)
    - payload.project_data (owner, region details, chosen CCTS Mode)
    
    The response below simulates the expected Vertex AI JSON output.
    """
    
    # Placeholder logic pending actual Vertex Generative AI integration:
    return {
        "additionality_score": 88, # 0-100 metric
        "greenwashing_risk": "Low", # Low/Medium/High
        "mrv_compliance": True,
        "final_verification_status": "Approved",
        "ccts_eligible": True,
        "message": "Vertex AI LLM Verification mapping completed (Placeholder mode active)."
    }
