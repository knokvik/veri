import os
from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END

# Import existing ML models
from .deepforest_model import analyze_vision
from .gee_satellite import analyze_satellite

# LangChain community integration for Ollama
from langchain_community.llms import Ollama

class AgenticState(TypedDict):
    project_id: str
    lat: float
    lng: float
    image_path: str
    project_claims: str  # E.g. "We planted 5000 trees here"
    
    # Internal state passed between nodes
    vision_results: dict
    satellite_results: dict
    semantic_results: dict
    final_decision: dict

# ------------------------------------------------------------------
# 1. Vision Agent Node
# ------------------------------------------------------------------
def node_vision_agent(state: AgenticState):
    """Runs DeepForest analysis on the provided image."""
    image_path = state.get("image_path")
    if image_path and os.path.exists(image_path):
        results = analyze_vision(image_path)
    else:
        results = {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": 0.0,
            "status": "No image provided or path invalid"
        }
    return {"vision_results": results}

# ------------------------------------------------------------------
# 2. Satellite Agent Node
# ------------------------------------------------------------------
def node_satellite_agent(state: AgenticState):
    """Runs Google Earth Engine Sentinel-2 analysis."""
    lat = state.get("lat", 0.0)
    lng = state.get("lng", 0.0)
    results = analyze_satellite(lat, lng)
    return {"satellite_results": results}

# ------------------------------------------------------------------
# 3. Semantic Interpreter & Risk Detector Node
# ------------------------------------------------------------------
def node_semantic_agent(state: AgenticState):
    """Uses LLM (Ollama - Gemma 4/Gemma) to analyze context, claims and potential greenwashing."""
    vision = state.get("vision_results", {})
    sat = state.get("satellite_results", {})
    claims = state.get("project_claims", "No specific claims provided.")
    
    # Using local Ollama. User mentioned gemma4 e4b. Usually tagged as "gemma" or "gemma2" locally. 
    # Let's use generic "gemma" which will pull default.
    try:
        llm = Ollama(model="qwen2.5:7b")
        
        prompt = f"""
        You are a carbon credit verification Semantic Agent evaluating a project.
        
        Project Claims: "{claims}"
        
        Ground Truth Vision (DeepForest AI):
        - Found Trees: {vision.get('tree_count', 0)}
        - Health Score: {vision.get('average_health_score', 0)} / 100
        - Status: {vision.get('status', 'Unknown')}
        
        Satellite Truth (Google Earth Engine):
        - NDVI (Health): {sat.get('ndvi', 0.0)}
        - Canopy Cover Est: {sat.get('canopy_cover_percentage', 0)}%
        - Status: {sat.get('status', 'Unknown')}
        
        Your task: Evaluate the consistency between the claims, the ground vision, and satellite data.
        Return output STRICTLY in the following format (no extra text):
        Score: [0-100]
        Risk Level: [Low/Medium/High]
        Explanation: [1-2 sentences explaining why]
        """
        
        response = llm.invoke(prompt)
        
        # Simple parser
        lines = response.strip().split('\n')
        score = None
        risk = "Medium"
        explanation = "Analysis completed."
        
        for line in lines:
            line_low = line.lower()
            if "score:" in line_low:
                try:
                    score = int(''.join(filter(str.isdigit, line)))
                except:
                    pass
            elif "risk level:" in line_low:
                if "low" in line_low: risk = "Low"
                elif "high" in line_low: risk = "High"
            elif "explanation:" in line_low:
                try:
                    explanation = line.split(":", 1)[1].strip()
                except:
                    pass

        if score is None:
            if risk == "Low":
                score = 85
            elif risk == "High":
                score = 40
            else:
                score = 60

        results = {
            "semantic_score": score,
            "greenwashing_risk": risk,
            "explanation": explanation
        }
    except Exception as e:
        # Strict Fail if Ollama is not running
        results = {
            "semantic_score": 0,
            "greenwashing_risk": "Critical",
            "explanation": f"VERIFICATION ERROR: Local AI Agent (Ollama) is offline or unavailable. Ensure Ollama is running and the model is installed.",
            "error": True
        }
        
    return {"semantic_results": results}

# ------------------------------------------------------------------
# 4. Consensus Engine Node
# ------------------------------------------------------------------
def node_consensus(state: AgenticState):
    """Calculates final CCTS verification score based on weighted agents."""
    v_res = state.get("vision_results", {})
    s_res = state.get("satellite_results", {})
    sem_res = state.get("semantic_results", {})
    
    # 1. Vision Score
    v_score = v_res.get("average_health_score", 0.0)
    # Give penalty if no trees found but expected
    if v_res.get("tree_count", 0) == 0:
        v_score = 0.0
        
    # 2. Satellite Score (Normalize NDVI to 100 max)
    # Catch GEE failure
    if s_res.get("status") == "Failed" or "Error" in str(s_res.get("error", "")):
        s_score = 0.0
    else:
        ndvi = float(s_res.get("ndvi", 0.0))
        s_score = min(max(ndvi * 100, 0), 100)
    
    # 3. Semantic Score
    sem_score = sem_res.get("semantic_score", 0.0)
    
    # 4. Risk Penalty
    risk = sem_res.get("greenwashing_risk", "Medium")
    risk_penalty = 50 if risk == "Critical" else (20 if risk == "High" else (5 if risk == "Medium" else 0))
    
    # Formula: (Vision * 0.3) + (Sat * 0.4) + (Sem * 0.3) - (Risk Penalty)
    confidence = (v_score * 0.3) + (s_score * 0.4) + (sem_score * 0.3) - risk_penalty

    
    # Cap confidence
    confidence = max(0.0, min(100.0, confidence))
    
    status = "REJECTED"
    if confidence >= 80:
        status = "APPROVED"
    elif confidence >= 50:
        status = "REVIEW"
        
    final_decision = {
        "confidence_score": round(confidence, 1),
        "status": status,
        "vision_contribution": round(v_score * 0.3, 1),
        "satellite_contribution": round(s_score * 0.4, 1),
        "llm_contribution": round(sem_score * 0.3, 1),
        "risk_penalty": risk_penalty,
        "explanation": sem_res.get("explanation", "")
    }
    
    return {"final_decision": final_decision}

# ------------------------------------------------------------------
# Graph Construction
# ------------------------------------------------------------------
workflow = StateGraph(AgenticState)

# Add nodes
workflow.add_node("vision_agent", node_vision_agent)
workflow.add_node("satellite_agent", node_satellite_agent)
workflow.add_node("semantic_agent", node_semantic_agent)
workflow.add_node("consensus_engine", node_consensus)

# We can run Vision and Satellite in parallel, then Semantic, then Consensus.
# However, LangGraph standard routing allows sequential easily.
# Flow: Start -> Vision -> Satellite -> Semantic -> Consensus -> End
workflow.set_entry_point("vision_agent")

workflow.add_edge("vision_agent", "satellite_agent")
workflow.add_edge("satellite_agent", "semantic_agent")
workflow.add_edge("semantic_agent", "consensus_engine")
workflow.add_edge("consensus_engine", END)

# Compile graph
agentic_app = workflow.compile()
