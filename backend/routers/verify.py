import os
import shutil
from fastapi import APIRouter, File, UploadFile, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional

from ml.deepforest_model import analyze_vision
from ml.gee_satellite import analyze_satellite

router = APIRouter()

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

# Separate endpoint for actual file uploads to avoid 422 errors
@router.post("/vision-upload")
async def verify_vision_upload(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = analyze_vision(temp_file_path)
        return {"vision_results": result}
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/vision")
async def verify_vision_json(payload: VisionRequest):
    """
    Handles JSON requests from the frontend for testing/coordinate mode.
    """
    # Simply return structured data that the frontend expects
    return {
        "vision_results": {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "message": "Vision processed via coordinate mode (Mock Removed)"
        }
    }

@router.post("/satellite")
async def verify_satellite(payload: SatelliteRequest):
    result = analyze_satellite(payload.lat, payload.lng)
    return {"satellite_results": result}

from ml.agentic_workflow import agentic_app
from fastapi import Form

@router.post("/llm")
async def verify_llm(payload: LLMVerifyRequest):
    return {
        "llm_results": {
            "additionality_score": 0,
            "greenwashing_risk": "High",
            "mrv_compliance": False,
            "final_verification_status": "Rejected",
            "ccts_eligible": False
        }
    }

@router.post("/agentic-pipeline")
async def run_agentic_pipeline(
    project_id: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    project_claims: str = Form(""),
    file: Optional[UploadFile] = File(None)
):
    """
    Runs the full LangGraph Agentic Pipeline.
    Uploads the image temporarily, runs Vision, Satellite, and LLM nodes, outputs Consensus.
    """
    image_path = None
    if file:
        image_path = f"temp_agentic_{file.filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
    initial_state = {
        "project_id": project_id,
        "lat": lat,
        "lng": lng,
        "project_claims": project_claims,
        "image_path": image_path
    }
    
    try:
        final_state = agentic_app.invoke(initial_state)
    finally:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
            
    return {
        "decision": final_state.get("final_decision", {}),
        "vision": final_state.get("vision_results", {}),
        "satellite": final_state.get("satellite_results", {}),
        "semantic": final_state.get("semantic_results", {})
    }
