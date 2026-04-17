import cv2
import numpy as np
from typing import Any, Dict, List

_DEEPFOREST_MODEL = None
_DEEPFOREST_LOAD_ERROR = None


def analyze_vision(image_path: str) -> dict:
    """
    Analyze a single ground photo.
    Rejects low-integrity or non-natural scenes before counting trees.
    """
    img = cv2.imread(image_path)
    if img is None:
        return _failed_result("failed_invalid_image", "Unable to decode image bytes.")

    quality = _assess_image_reliability(img)
    if not quality["passes_scene_gate"]:
        return {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": 0.0,
            "image_reliability_score": quality["image_reliability_score"],
            "model_used": "scene-gate-reject",
            "status": "rejected_invalid_scene",
            "flags": quality["flags"],
        }

    model = _get_deepforest_model()
    if model is not None:
        try:
            predictions = model.predict_image(path=image_path)
            return _format_deepforest_result(predictions, img, quality)
        except Exception as exc:
            heuristic = _analyze_green_heuristic(img, quality)
            heuristic["status"] = f"success_fallback_after_model_error: {str(exc)}"
            return heuristic

    return _analyze_green_heuristic(img, quality)


def analyze_vision_ensemble(image_paths: List[str]) -> dict:
    """
    Runs analysis across all uploaded photos and returns a robust aggregate.
    """
    if not image_paths:
        return {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": 0.0,
            "evidence_quality_score": 0.0,
            "model_used": "ensemble",
            "status": "failed_no_photos",
            "total_photo_count": 0,
            "valid_photo_count": 0,
            "rejected_photo_count": 0,
            "flags": ["CRITICAL: No ground photos were uploaded."],
            "photo_results": [],
        }

    photo_results = [analyze_vision(path) for path in image_paths]
    valid = [r for r in photo_results if r.get("status", "").startswith("success")]
    rejected = [r for r in photo_results if r.get("status", "").startswith("rejected")]
    failed = [r for r in photo_results if r.get("status", "").startswith("failed")]

    if not valid:
        collected_flags: List[str] = []
        for item in rejected + failed:
            for flag in item.get("flags", []):
                if flag not in collected_flags:
                    collected_flags.append(flag)
        if not collected_flags:
            collected_flags.append("CRITICAL: No valid ecological evidence was detected in uploaded photos.")

        return {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": 0.0,
            "evidence_quality_score": 0.0,
            "model_used": "ensemble",
            "status": "failed_no_valid_evidence",
            "total_photo_count": len(photo_results),
            "valid_photo_count": 0,
            "rejected_photo_count": len(rejected),
            "failed_photo_count": len(failed),
            "flags": collected_flags,
            "photo_results": photo_results,
        }

    tree_counts = [int(v.get("tree_count", 0)) for v in valid]
    avg_health = float(np.mean([float(v.get("average_health_score", 0.0)) for v in valid]))
    avg_survival = float(np.mean([float(v.get("survival_rate", 0.0)) for v in valid]))
    avg_confidence = float(np.mean([float(v.get("confidence_score", 0.0)) for v in valid]))
    evidence_quality = float(np.mean([float(v.get("image_reliability_score", 0.0)) for v in valid]))
    median_tree_count = int(np.median(tree_counts)) if tree_counts else 0

    model_labels = sorted({str(v.get("model_used", "unknown")) for v in valid})
    combined_flags: List[str] = []
    for item in rejected + failed:
        for flag in item.get("flags", []):
            if flag not in combined_flags:
                combined_flags.append(flag)

    return {
        "tree_count": median_tree_count,
        "average_health_score": round(avg_health, 1),
        "survival_rate": round(avg_survival, 1),
        "confidence_score": round(avg_confidence, 1),
        "evidence_quality_score": round(evidence_quality, 3),
        "model_used": "ensemble(" + ",".join(model_labels) + ")",
        "status": "success" if avg_confidence >= 40 else "success_low_confidence",
        "total_photo_count": len(photo_results),
        "valid_photo_count": len(valid),
        "rejected_photo_count": len(rejected),
        "failed_photo_count": len(failed),
        "flags": combined_flags,
        "photo_results": photo_results,
    }


def _failed_result(status: str, reason: str) -> Dict[str, Any]:
    return {
        "tree_count": 0,
        "average_health_score": 0.0,
        "survival_rate": 0.0,
        "confidence_score": 0.0,
        "image_reliability_score": 0.0,
        "model_used": "error",
        "status": status,
        "flags": [reason],
    }


def _get_deepforest_model():
    global _DEEPFOREST_MODEL, _DEEPFOREST_LOAD_ERROR
    if _DEEPFOREST_MODEL is not None:
        return _DEEPFOREST_MODEL
    if _DEEPFOREST_LOAD_ERROR is not None:
        return None

    try:
        from deepforest import main

        model = main.deepforest()
        model.use_release()
        _DEEPFOREST_MODEL = model
        return _DEEPFOREST_MODEL
    except Exception as exc:
        _DEEPFOREST_LOAD_ERROR = str(exc)
        return None


def _format_deepforest_result(predictions, img: np.ndarray, quality: Dict[str, Any]) -> Dict[str, Any]:
    if predictions is None or predictions.empty:
        return {
            "tree_count": 0,
            "average_health_score": 0.0,
            "survival_rate": 0.0,
            "confidence_score": round(quality["image_reliability_score"] * 100, 1),
            "image_reliability_score": quality["image_reliability_score"],
            "model_used": "deepforest",
            "status": "success_no_trees",
            "flags": quality["flags"],
        }

    img_area = float(max(1, img.shape[0] * img.shape[1]))
    pred = predictions.copy()
    pred["bbox_area_ratio"] = ((pred["xmax"] - pred["xmin"]) * (pred["ymax"] - pred["ymin"])) / img_area

    valid = pred[
        (pred["score"] >= 0.45)
        & (pred["bbox_area_ratio"] >= 0.00002)
        & (pred["bbox_area_ratio"] <= 0.15)
    ]

    tree_count = int(len(valid))
    mean_model_conf = float(valid["score"].mean()) if tree_count > 0 else 0.0
    average_health_score = max(0.0, min(100.0, mean_model_conf * 100.0))
    survival_rate = max(0.0, min(100.0, average_health_score * 1.03))
    confidence_score = max(0.0, min(100.0, ((mean_model_conf * 0.7) + (quality["image_reliability_score"] * 0.3)) * 100.0))

    status = "success" if tree_count > 0 else "success_no_trees"
    return {
        "tree_count": tree_count,
        "average_health_score": round(average_health_score, 1),
        "survival_rate": round(survival_rate, 1),
        "confidence_score": round(confidence_score, 1),
        "image_reliability_score": quality["image_reliability_score"],
        "model_used": "deepforest",
        "status": status,
        "flags": quality["flags"],
    }


def _analyze_green_heuristic(img: np.ndarray, quality: Dict[str, Any]) -> dict:
    """
    Conservative fallback when DeepForest is unavailable.
    Uses connected vegetation blobs, not raw pixel ratio scaling.
    """
    try:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower_green = np.array([30, 30, 25])
        upper_green = np.array([95, 255, 255])

        mask = cv2.inRange(hsv, lower_green, upper_green)
        kernel = np.ones((3, 3), np.uint8)
        cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=1)

        total_pixels = float(max(1, img.shape[0] * img.shape[1]))
        green_pixels = float(cv2.countNonZero(cleaned))
        green_ratio = green_pixels / total_pixels

        _, _, stats, _ = cv2.connectedComponentsWithStats(cleaned, connectivity=8)
        min_blob_area = total_pixels * 0.00004
        max_blob_area = total_pixels * 0.08
        blob_count = 0
        for i in range(1, len(stats)):
            area = float(stats[i, cv2.CC_STAT_AREA])
            if min_blob_area <= area <= max_blob_area:
                blob_count += 1

        estimated_tree_count = int(min(4000, (blob_count * 1.5) + (green_ratio * 120)))
        base_health = max(0.0, min(100.0, green_ratio * 120))
        confidence_score = max(0.0, min(100.0, quality["image_reliability_score"] * 72))

        return {
            "tree_count": estimated_tree_count,
            "average_health_score": round(base_health, 1),
            "survival_rate": round(min(100.0, base_health * 0.95), 1),
            "confidence_score": round(confidence_score, 1),
            "image_reliability_score": quality["image_reliability_score"],
            "model_used": "heuristic-vegetation-blobs",
            "status": "success_fallback",
            "flags": quality["flags"] + ["WARNING: DeepForest unavailable; fallback heuristic used."],
        }
    except Exception as exc:
        return _failed_result("failed_heuristic_exception", f"Heuristic analysis failed: {str(exc)}")


def _assess_image_reliability(img: np.ndarray) -> Dict[str, Any]:
    h, w = img.shape[:2]
    total_pixels = float(max(1, h * w))
    flags: List[str] = []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    edges = cv2.Canny(gray, 80, 160)
    edge_density = float(cv2.countNonZero(edges)) / total_pixels

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sat_mean = float(np.mean(hsv[:, :, 1]))
    val_mean = float(np.mean(hsv[:, :, 2]))
    green_mask = cv2.inRange(hsv, np.array([30, 30, 20]), np.array([95, 255, 255]))
    green_ratio = float(cv2.countNonZero(green_mask)) / total_pixels

    if min(h, w) < 224:
        flags.append("WARNING: Image resolution is low; evidence quality reduced.")
    if blur_variance < 30:
        flags.append("WARNING: Image appears low-detail or heavily blurred.")
    if edge_density < 0.01:
        flags.append("WARNING: Image has very low texture complexity.")
    if green_ratio < 0.02:
        flags.append("CRITICAL: Very low vegetation presence in uploaded image.")

    cartoon_like = sat_mean > 145 and edge_density < 0.02 and blur_variance < 65
    if cartoon_like:
        flags.append("CRITICAL: Image appears synthetic/illustrative instead of a natural field photo.")

    score = 0.0
    score += 0.28 if blur_variance >= 40 else 0.12 if blur_variance >= 20 else 0.0
    score += 0.24 if edge_density >= 0.03 else 0.1 if edge_density >= 0.015 else 0.0
    score += 0.28 if 0.06 <= green_ratio <= 0.95 else 0.1 if green_ratio >= 0.02 else 0.0
    score += 0.1 if 20 <= sat_mean <= 190 else 0.0
    score += 0.1 if 20 <= val_mean <= 240 else 0.0
    image_reliability = float(max(0.0, min(1.0, score)))

    passes_scene_gate = image_reliability >= 0.45 and not cartoon_like
    return {
        "image_reliability_score": round(image_reliability, 3),
        "passes_scene_gate": passes_scene_gate,
        "flags": flags,
    }
