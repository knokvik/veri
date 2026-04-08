def run_cross_validation(vision_data: dict, satellite_data: dict, project_claims: dict, legal_documents: dict = None) -> dict:
    """
    Cross-validates vision evidence, satellite evidence, claim values, and legal docs.
    Includes hard blocks for invalid evidence and evidence-quality-aware confidence.
    """
    flags = []
    verification_blocked = False
    legal_documents = legal_documents or {}

    claimed_trees_raw = project_claims.get("tree_count") or project_claims.get("claimed_tree_count") or 0
    try:
        claimed_trees = float(claimed_trees_raw)
    except Exception:
        claimed_trees = 0.0

    vision_trees = int(vision_data.get("tree_count", 0))
    vision_status = str(vision_data.get("status", "unknown"))
    valid_photo_count = int(vision_data.get("valid_photo_count", 1 if vision_status.startswith("success") else 0))
    evidence_quality = float(
        vision_data.get("evidence_quality_score", vision_data.get("image_reliability_score", 0.0))
    )
    model_confidence = float(vision_data.get("confidence_score", 0.0)) / 100.0

    satellite_canopy = float(satellite_data.get("canopy_cover_percentage", 0.0))
    current_ndvi = float(satellite_data.get("current_ndvi", satellite_data.get("ndvi", 0.0)))
    change_from_baseline = float(satellite_data.get("change_from_baseline", 0.0))
    temporal = str(satellite_data.get("temporal_check", "UNKNOWN"))
    satellite_reliability = float(satellite_data.get("source_reliability", 0.5))
    satellite_live = bool(satellite_data.get("is_live_observation", False))

    doc_completeness = float(legal_documents.get("completeness_score", 0.0))
    doc_total = int(legal_documents.get("total_document_count", 0))

    if not vision_status.startswith("success") or valid_photo_count <= 0:
        flags.append("CRITICAL: No valid ecological ground photo evidence is available.")
        verification_blocked = True

    if evidence_quality < 0.45:
        flags.append("CRITICAL: Ground evidence quality is too low for automated verification.")
        verification_blocked = True
    elif evidence_quality < 0.60:
        flags.append("WARNING: Ground evidence quality is moderate; manual audit recommended.")

    if valid_photo_count < 2:
        flags.append("WARNING: Less than 2 valid photos. Multi-angle evidence is recommended.")

    if claimed_trees > 0:
        tree_claim_ratio = vision_trees / claimed_trees if claimed_trees else 0.0
        if tree_claim_ratio < 0.40:
            flags.append("CRITICAL: Detected trees are less than 40% of claimed amount.")
        elif tree_claim_ratio > 2.00:
            flags.append("WARNING: Detected trees exceed 200% of claimed amount. Check boundaries and duplicates.")
        claim_alignment = max(0.0, min(1.0, 1.0 - abs(tree_claim_ratio - 1.0) / 1.5))
    else:
        claim_alignment = 0.4
        flags.append("WARNING: Claimed tree count missing; claim alignment confidence reduced.")

    if vision_trees > 100 and satellite_canopy < 10.0:
        flags.append("CRITICAL: Ground photos imply dense trees while satellite indicates barren canopy.")
    if satellite_canopy > 60.0 and vision_trees < 10:
        flags.append("WARNING: Satellite canopy is high but ground photos show very few trees.")

    if temporal == "INVALID_FUTURE_DATE":
        flags.append("CRITICAL: Planting date is in the future.")
        verification_blocked = True
    elif temporal == "SUSPICIOUS_UNREALISTIC_GROWTH":
        flags.append("CRITICAL: Unrealistic growth curve indicates possible additionality failure.")

    if not satellite_live:
        flags.append("WARNING: Satellite result is simulated fallback, not live imagery.")
    if satellite_reliability < 0.45:
        flags.append("WARNING: Satellite evidence reliability is low.")

    # Legal document signal (not a hard reject by itself, but strongly impacts confidence)
    if doc_total == 0:
        flags.append("WARNING: No legal documents uploaded (lease/report/permit).")
    if doc_completeness < 0.4:
        flags.append("WARNING: Document packet is incomplete; admin should verify source records.")

    critical_count = sum(1 for f in flags if f.startswith("CRITICAL"))
    warning_count = sum(1 for f in flags if f.startswith("WARNING"))

    if verification_blocked or critical_count > 0:
        greenwashing_risk = "High"
    elif warning_count > 0:
        greenwashing_risk = "Medium"
    else:
        greenwashing_risk = "Low"

    confidence_raw = (
        (evidence_quality * 0.46)
        + (model_confidence * 0.22)
        + (satellite_reliability * 0.14)
        + (claim_alignment * 0.10)
        + (doc_completeness * 0.08)
    ) * 100.0

    confidence_penalty = (critical_count * 22.0) + (warning_count * 6.0)
    base_confidence = max(0.0, confidence_raw - confidence_penalty)
    if verification_blocked:
        base_confidence = min(base_confidence, 35.0)

    gross_carbon = float(satellite_data.get("estimated_biomass_tons", 0.0)) * 0.47
    net_issuable_carbon_tons = 0.0 if greenwashing_risk == "High" else gross_carbon * 0.8

    additionality_score = max(0.0, min(100.0, (current_ndvi * 65.0) + (change_from_baseline / 8.0)))
    if satellite_reliability < 0.5:
        additionality_score = min(additionality_score, 60.0)

    return {
        "mismatches_found": len(flags) > 0,
        "verification_blocked": verification_blocked,
        "flags": flags,
        "greenwashing_risk": greenwashing_risk,
        "calculated_base_confidence": round(base_confidence, 1),
        "additionality_proxy_score": round(additionality_score, 1),
        "raw_gross_carbon_tons": round(gross_carbon, 2),
        "net_issuable_carbon_tons": round(net_issuable_carbon_tons, 2),
        "confidence_breakdown": {
            "ground_evidence_quality": round(evidence_quality, 3),
            "vision_model_confidence": round(model_confidence, 3),
            "satellite_reliability": round(satellite_reliability, 3),
            "claim_alignment": round(claim_alignment, 3),
            "document_completeness": round(doc_completeness, 3),
            "critical_flags": critical_count,
            "warning_flags": warning_count,
        },
    }
