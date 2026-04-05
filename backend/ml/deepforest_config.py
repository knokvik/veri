
DEEPFOREST_PROMPT = {
    "model": "weecology/deepforest",
    "task": "tree_crown_detection",
    
    "input_specification": {
        "image_format": "JPEG/PNG",
        "min_resolution": "1024x768",
        "required_perspectives": ["north", "south", "east", "west"],
        "geotag_required": True,
        "timestamp_required": True
    },
    
    "detection_parameters": {
        "confidence_threshold": 0.4,
        "nms_threshold": 0.3,
        "patch_size": 512,
        "patch_overlap": 0.2
    },
    
    "output_schema": {
        "tree_count": "integer",
        "individual_trees": [
            {
                "tree_id": "uuid",
                "bbox": ["x_min", "y_min", "x_max", "y_max"],
                "confidence_score": "float (0-1)",
                "estimated_dbh_cm": "float (derived from bbox)",
                "health_indicator": "green/yellow/brown"
            }
        ],
        "canopy_cover_percent": "float",
        "processing_metadata": {
            "image_dimensions": ["width", "height"],
            "processing_time_ms": "integer",
            "model_version": "string"
        }
    },
    
    "validation_rules": [
        "Reject if confidence < 0.4 for >20% of detections",
        "Flag if tree density >1000/hectare (likely false positive)",
        "Flag if tree density <50/hectare (sparse planting)"
    ]
}
