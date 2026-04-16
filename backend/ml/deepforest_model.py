import os
import cv2
import numpy as np

def analyze_vision(image_path: str) -> dict:
    """
    Analyzes an uploaded image using an OpenCV-based Machine Vision algorithm.
    This acts as a fast and reliable alternative to DeepForest for Hackathon purposes,
    capable of identifying vegetation blobs (trees) in both standard and aerial photos.
    """
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Empty or unreadable image file.")

        # Convert to HSV color space for better color filtering
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define range for green color (vegetation/trees)
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([90, 255, 255])
        
        # Threshold the HSV image to get only green colors
        mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Morphological operations to clean up small noise (leaves/grass)
        kernel = np.ones((5, 5), np.uint8)
        mask_cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask_cleaned = cv2.morphologyEx(mask_cleaned, cv2.MORPH_CLOSE, kernel)
        
        # Find contours (distinct blobs of green)
        contours, _ = cv2.findContours(mask_cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by size to count distinct "tree" or "shrub" objects
        valid_trees = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Adjust minimum area based on typical image sizes to prune noise
            if area > 100:  
                valid_trees.append(cnt)

        tree_count = len(valid_trees)
        
        # Calculate health score based on the saturation/value of the green areas
        health_score = 0.0
        survival_rate = 0.0
        confidence = 0.0
        
        if tree_count > 0:
            # Extract only the green regions
            green_regions = cv2.bitwise_and(hsv, hsv, mask=mask_cleaned)
            # Mean of Saturation (health proxy) and Value (brightness/vitality)
            # Saturation is channel 1, Value is channel 2
            mean_s = np.mean(green_regions[:, :, 1][mask_cleaned > 0])
            mean_v = np.mean(green_regions[:, :, 2][mask_cleaned > 0])
            
            # Normalize to 0-100 scale (healthy vibrant green has high S and V)
            raw_health = ((mean_s / 255.0) * 0.6 + (mean_v / 255.0) * 0.4) * 100
            
            # Limit between 0 and 100, give it a baseline boost since real trees range widely
            health_score = min(100.0, max(20.0, raw_health + 15.0))
            
            survival_rate = round(health_score / 100.0, 2)
            confidence = 0.85 + (len(valid_trees) / 1000.0) # High confidence if many distinct blobs
            confidence = min(0.98, confidence)
        
        status = "Vision Analysis Successful"
        if tree_count == 0:
            status = "Vision Analysis Successful - No trees found (Zero Greenery)"

        return {
            "tree_count": int(tree_count),
            "average_health_score": round(float(health_score), 1),
            "survival_rate": float(survival_rate),
            "confidence_score": round(float(confidence), 2),
            "status": status
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": 0.0,
            "status": "Vision Analysis Failed"
        }
