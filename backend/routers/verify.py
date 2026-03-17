import os
import shutil
from fastapi import APIRouter, File, UploadFile, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional

from ml.deepforest_model import analyze_vision
from ml.gee_satellite import analyze_satellite
from ml.auditor import audit_project

router = APIRouter()

# In-memory store for session results (mimicking a database for demo context)
GLOBAL_RESULTS: Dict[str, Dict[str, Any]] = {}

class VisionRequest(BaseModel):
    project_id: str
    lat: float
    lng: float

class SatelliteRequest(BaseModel):
    project_id: str
    lat: float
    lng: float

class LLMVerifyRequest(BaseModel):
    project_id: str
    lat: Optional[float] = 0
    lng: Optional[float] = 0
    scheme_type: Optional[str] = "compliance"

# Separate endpoint for actual file uploads to avoid 422 errors
@router.post("/vision-upload")
async def verify_vision_upload(project_id: str = Body(...), file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = analyze_vision(temp_file_path)
        if project_id not in GLOBAL_RESULTS:
            GLOBAL_RESULTS[project_id] = {}
        GLOBAL_RESULTS[project_id]["vision"] = result
        return {"vision_results": result}
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/vision")
async def verify_vision_json(payload: VisionRequest):
    """
    Handles JSON requests from the frontend for testing/coordinate mode.
    """
    result = {
        "tree_count": 342,
        "average_health_score": 88.5,
        "survival_rate": 0.92,
        "message": "Vision processed via coordinate mode"
    }
    if payload.project_id not in GLOBAL_RESULTS:
        GLOBAL_RESULTS[payload.project_id] = {}
    GLOBAL_RESULTS[payload.project_id]["vision"] = result
    return {"vision_results": result}

@router.post("/satellite")
async def verify_satellite(payload: SatelliteRequest):
    result = analyze_satellite(payload.lat, payload.lng)
    if payload.project_id not in GLOBAL_RESULTS:
        GLOBAL_RESULTS[payload.project_id] = {}
    GLOBAL_RESULTS[payload.project_id]["satellite"] = result
    return {"satellite_results": result}

@router.post("/llm")
async def verify_llm(payload: LLMVerifyRequest):
    # Retrieve context from previous steps
    context = GLOBAL_RESULTS.get(payload.project_id, {})
    vision = context.get("vision", {})
    satellite = context.get("satellite", {})
    
    # Run the rule-based synthesis auditor
    audit_results = audit_project(vision, satellite, payload.scheme_type)
    
    return {
        "llm_results": audit_results
    }
