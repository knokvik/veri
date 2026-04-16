import os
try:
    from deepforest import main
    DEEPFOREST_AVAILABLE = True
except ImportError:
    DEEPFOREST_AVAILABLE = False
import cv2

def analyze_vision(image_path: str) -> dict:
    """
    Analyzes an uploaded image using DeepForest.
    Extracts true tree count and health score based on box confidences.
    """
    if not DEEPFOREST_AVAILABLE:
        return {
            "error": "DeepForest library not installed. pip install deepforest",
            "tree_count": 0,
            "average_health_score": 0,
            "survival_rate": 0,
            "status": "Failed"
        }

    try:
        model = main.deepforest()
        model.use_release()
        
        # predict_image returns a pandas dataframe
        predictions = model.predict_image(path=image_path)
        
        if predictions is None or predictions.empty:
            return {
                "tree_count": 0,
                "average_health_score": 0.0,
                "survival_rate": 0.0,
                "confidence_score": 0.0,
                "status": "Vision Analysis Successful - No trees found"
            }

        tree_count = len(predictions)
        
        # Calculate a pseudo health score using the average confidence of the bounding boxes
        mean_confidence = predictions["score"].mean() if "score" in predictions else 0.85
        
        # E.g., if mean confidence is 0.80, health could be mapped to an 80/100 scale.
        health_score = round(mean_confidence * 100, 2)
        
        # Assumption for survival rate based on context of afforestation analysis
        # Highly confident boxes usually imply well-formed canopies
        survival_rate = round(mean_confidence, 2)
        
        return {
            "tree_count": int(tree_count),
            "average_health_score": float(health_score),
            "survival_rate": float(survival_rate),
            "confidence_score": float(mean_confidence),
            "status": "Vision Analysis Successful"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "Vision Analysis Failed"
        }
