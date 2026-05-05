from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os
import uuid
from typing import Any, Dict, List
import json
import hashlib

from ml.deepforest_model import analyze_vision_ensemble
from ml.gee_satellite import analyze_satellite
from ml.satellite_analysis import analyze_satellite_data
from ml.cross_validator import run_cross_validation
from ml.gemini_synthesizer import GeminiSynthesizer

router = APIRouter()
gemini = GeminiSynthesizer()


async def _summarize_documents(document_inputs: Dict[str, List[UploadFile]]) -> dict:
    category_weights = {
        "land_lease": 0.4,
        "planting_report": 0.3,
        "government_permit": 0.2,
        "supporting": 0.1,
    }
    categories: Dict[str, Any] = {}
    total_docs = 0
    completeness_score = 0.0

    for category, uploads in document_inputs.items():
        uploads = uploads or []
        documents = []
        total_size_mb = 0.0

        for upload in uploads:
            if not upload or not upload.filename:
                continue
            content = await upload.read()
            if not content:
                continue

            size_mb = round(len(content) / (1024 * 1024), 3)
            total_size_mb += size_mb
            digest = hashlib.sha256(content).hexdigest()[:16]
            ext = os.path.splitext(upload.filename)[1].lower()
            documents.append({
                "filename": upload.filename,
                "extension": ext if ext else "unknown",
                "size_mb": size_mb,
                "sha256_prefix": digest,
            })

        total_docs += len(documents)
        if len(documents) > 0:
            completeness_score += category_weights.get(category, 0.0)

        categories[category] = {
            "count": len(documents),
            "total_size_mb": round(total_size_mb, 3),
            "documents": documents,
        }

    status = "complete" if completeness_score >= 0.8 else "partial" if completeness_score >= 0.4 else "insufficient"
    return {
        "status": status,
        "total_document_count": total_docs,
        "completeness_score": round(completeness_score, 3),
        "categories": categories,
    }


def _build_score_reasoning(vision_data: dict, satellite_data: dict, cross_validation: dict, documents: dict) -> dict:
    positives: List[str] = []
    concerns: List[str] = []

    valid_photos = int(vision_data.get("valid_photo_count", 0))
    evidence_quality = float(vision_data.get("evidence_quality_score", vision_data.get("image_reliability_score", 0.0)))

    if valid_photos >= 2:
        positives.append(f"{valid_photos} valid ground photos passed scene-quality checks.")
    if evidence_quality >= 0.6:
        positives.append("Ground evidence quality is strong enough for confident analysis.")
    if satellite_data.get("is_live_observation"):
        positives.append("Satellite layer used live GEE observation.")
    if float(documents.get("completeness_score", 0.0)) >= 0.6:
        positives.append("Legal and supporting document packet is sufficiently complete.")

    for flag in cross_validation.get("flags", []):
        text = str(flag)
        if text.startswith("CRITICAL") or text.startswith("WARNING"):
            concerns.append(text)

    if not concerns:
        concerns.append("No major mismatches were flagged across vision, satellite, claims, and documents.")

    score = float(cross_validation.get("calculated_base_confidence", 0.0))
    if score >= 85:
        score_band = "Excellent"
    elif score >= 70:
        score_band = "Good"
    elif score >= 50:
        score_band = "Moderate"
    elif score >= 35:
        score_band = "Low"
    else:
        score_band = "Very Low"

    recommended_action = (
        "Manual admin review is required before minting."
        if cross_validation.get("verification_blocked")
        else "Eligible for admin review and credit decision."
    )

    return {
        "score_band": score_band,
        "score_value": round(score, 1),
        "positives": positives,
        "concerns": concerns,
        "recommended_action": recommended_action,
    }


@router.post("/")
async def validate_carbon_project(
    claims: str = Form(...),  # JSON string
    location: str = Form(...),  # JSON string
    planting_date: str = Form(...),
    ground_photos: List[UploadFile] = File(...),
    land_lease_docs: List[UploadFile] = File(default=[]),
    planting_report_docs: List[UploadFile] = File(default=[]),
    government_permit_docs: List[UploadFile] = File(default=[]),
    supporting_docs: List[UploadFile] = File(default=[]),
):
    """
    Complete CCTS Verification Pipeline.
    Runs Vision, Satellite, Cross-Validation, and synthesizes via Gemini.
    """

    # 1. Parse Inputs
    try:
        user_claims = json.loads(claims)
        geo_location = json.loads(location)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload in claims/location: {str(exc)}")

    try:
        latitude = float(geo_location.get('lat'))
        longitude = float(geo_location.get('lng'))
    except Exception:
        raise HTTPException(status_code=400, detail="Location must include numeric lat and lng.")

    try:
        land_area_hectares = float(user_claims.get("land_area_hectares", 1.0))
    except Exception:
        raise HTTPException(status_code=400, detail="land_area_hectares must be a number.")

    if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
        raise HTTPException(status_code=400, detail="Invalid coordinates. Latitude must be [-90,90], longitude [-180,180].")
    if land_area_hectares <= 0:
        raise HTTPException(status_code=400, detail="land_area_hectares must be greater than 0.")
    if not ground_photos:
        raise HTTPException(status_code=400, detail="At least one ground photo is required.")

    # =============== PART 1: VISION ANALYZER ===============
    temp_files: List[str] = []
    try:
        for photo in ground_photos:
            if not photo or not photo.filename:
                continue
            content = await photo.read()
            if not content or len(content) < 1024:
                continue
            _, ext = os.path.splitext(photo.filename)
            suffix = ext if ext else ".jpg"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                temp_files.append(tmp.name)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to read uploaded photos: {str(exc)}")

    if not temp_files:
        raise HTTPException(status_code=400, detail="No valid photo bytes detected. Upload clear field photographs.")

    try:
        document_summary = await _summarize_documents({
            "land_lease": land_lease_docs,
            "planting_report": planting_report_docs,
            "government_permit": government_permit_docs,
            "supporting": supporting_docs,
        })

        vision_results = analyze_vision_ensemble(temp_files)

        # =============== PART 2: SATELLITE ANALYZER ===============
        satellite_live = analyze_satellite(latitude, longitude)
        live_status = str(satellite_live.get("status", "")).lower()
        if live_status == "success":
            satellite_results = satellite_live
        else:
            satellite_results = analyze_satellite_data(
                lat=latitude,
                lng=longitude,
                planting_date_str=planting_date,
                land_area_hectares=land_area_hectares
            )
            satellite_results["fallback_reason"] = satellite_live.get("error", satellite_live.get("status", "Unknown GEE issue"))

        # =============== PART 3: CROSS-VALIDATOR ===============
        cross_validation = run_cross_validation(
            vision_data=vision_results,
            satellite_data=satellite_results,
            project_claims=user_claims,
            legal_documents=document_summary,
        )

        # =============== PART 4: GEMINI SYNTHESIS ===============
        gemini_synthesis = gemini.synthesize(
            vision_data=vision_results,
            satellite_data=satellite_results,
            cross_validation=cross_validation
        )

        # Deterministic safety rails: LLM cannot override hard verification blocks.
        blocked = bool(cross_validation.get("verification_blocked", False))
        if blocked:
            gemini_synthesis["mrv_compliance"] = "FAIL"
            gemini_synthesis["final_verification_status"] = "Pending Manual Review"
            gemini_synthesis["overall_confidence"] = min(
                int(gemini_synthesis.get("overall_confidence", 35)),
                int(cross_validation.get("calculated_base_confidence", 35)),
                35
            )

        gemini_synthesis["score_reasoning"] = _build_score_reasoning(
            vision_data=vision_results,
            satellite_data=satellite_results,
            cross_validation=cross_validation,
            documents=document_summary,
        )

        final_mrv = str(gemini_synthesis.get("mrv_compliance", "FAIL")).upper()

        response_payload = {
            "submission_id": str(uuid.uuid4()),
            "status": "APPROVED" if final_mrv == "PASS" else "REVIEW_REQUIRED",
            "ingestion": {
                "total_uploaded_photos": len(ground_photos),
                "processed_photo_count": len(temp_files),
            },
            "document_packet": document_summary,
            "layer_1_vision": vision_results,
            "layer_2_satellite": satellite_results,
            "layer_3_cross_validation": cross_validation,
            "layer_4_llm_placeholder": gemini_synthesis
        }
        return JSONResponse(content=response_payload)
    finally:
        for path in temp_files:
            try:
                os.unlink(path)
            except Exception:
                pass
