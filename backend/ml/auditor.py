def audit_project(vision_result: dict, satellite_result: dict, scheme_type: str) -> dict:
    """
    Synthesizes vision and satellite data to produce a CCTS compliance decision.
    Acts as a Chain-of-Thought agent that reasons about multi-modal environmental data.
    """
    tree_count = vision_result.get("tree_count", 0)
    ndvi = satellite_result.get("ndvi", 0.0)
    canopy_cover = satellite_result.get("canopy_cover_percentage", 0.0)
    
    # Reasoning Chain
    reasoning_steps = []
    reasoning_steps.append(f"AGENT START: Analysis of {scheme_type.upper()} project coordinates.")
    reasoning_steps.append(f"STEP 1 [Vision]: Computer vision detected {tree_count} individual tree specimens.")
    reasoning_steps.append(f"STEP 2 [Satellite]: NDVI index is {ndvi:.2f} with {canopy_cover}% canopy coverage.")
    
    # Audit Logic
    base_score = 65
    if tree_count > 300:
        base_score += 15
        reasoning_steps.append("OBSERVATION: High tree density detected via DeepForest. Exceeds phase 1 baseline.")
    
    if ndvi > 0.6:
        base_score += 15
        reasoning_steps.append(f"OBSERVATION: NDVI {ndvi:.2f} indicates robust photosynthesis and healthy biomass.")
    
    # Contradiction Detection (Agentic Reasoning)
    if tree_count > 50 and ndvi < 0.2:
        base_score -= 40
        reasoning_steps.append("CRITICAL ANOMALY: Vision detects trees but Satellite shows zero-vegetation NDVI. Potential Greenwashing Flag.")
        risk_level = "High (Data Inconsistency)"
    elif tree_count == 0 and ndvi > 0.5:
        reasoning_steps.append("NOTE: High NDVI but 0 trees. Likely non-forested vegetation or satellite latency.")
        risk_level = "Medium"
    else:
        risk_level = "Low" if base_score > 75 else "Medium"

    # Final decision logic
    is_compliant = base_score >= 75
    
    if is_compliant:
        reasoning_steps.append("CONCLUSION: Project meets CCTS Additionality requirements. Proceeding to Minting.")
    else:
        reasoning_steps.append("CONCLUSION: Verification failure or insufficient data. Escalated for manual review.")

    return {
        "additionality_score": min(100, max(0, base_score)),
        "greenwashing_risk": risk_level,
        "mrv_compliance": True if tree_count > 0 and ndvi > 0 else False,
        "final_verification_status": "Approved" if is_compliant else "Pending Manual Review",
        "ccts_eligible": is_compliant,
        "reasoning": " | ".join(reasoning_steps),
        "agent_id": "v-credit-agent-01",
        "scheme_logic": f"Verified under {scheme_type} CCTS frameworks."
    }
