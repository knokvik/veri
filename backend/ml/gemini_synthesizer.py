import os
import json
import google.generativeai as genai

from ml.vericredit_master_prompt import VERICREDIT_ENSEMBLE_SYSTEM_PROMPT

class GeminiSynthesizer:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def synthesize(self, vision_data: dict, satellite_data: dict, cross_validation: dict) -> dict:
        """
        Sends the verified MRV data to Gemini for compliance synthesis and risk assessment.
        """
        if not self.model:
            print("⚠️ WARNING: Gemini API Key not found. Falling back to rule-based placeholder.")
            return self._fallback_response(cross_validation)

        prompt = f"""
        {VERICREDIT_ENSEMBLE_SYSTEM_PROMPT}

        TELEMETRY INPUTS:
        VISION DATA:
        {json.dumps(vision_data, indent=2)}

        SATELLITE DATA:
        {json.dumps(satellite_data, indent=2)}

        RULE-BASED CROSS VALIDATION:
        {json.dumps(cross_validation, indent=2)}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                )
            )
            
            raw_text = response.text.strip()
            
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:-3].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:-3].strip()

            result = json.loads(raw_text)
            return self._normalize_output(result, cross_validation)

        except Exception as e:
            print(f"❌ Gemini Generation Error: {str(e)}")
            return self._fallback_response(cross_validation)

    def _fallback_response(self, cross_validation: dict) -> dict:
        """Standard fallback if the API fails or is not configured."""
        blocked = bool(cross_validation.get("verification_blocked", False))
        risk = cross_validation.get("greenwashing_risk", "High" if blocked else "Medium")
        mrv = "FAIL" if blocked or risk == "High" else "PASS"
        status = "Approved" if mrv == "PASS" else "Pending Manual Review"
        confidence = int(cross_validation.get("calculated_base_confidence", 40 if blocked else 75))
        if blocked:
            confidence = min(confidence, 35)

        return self._normalize_output({
            "overall_confidence": confidence,
            "additionality_score": cross_validation.get("additionality_proxy_score", 50),
            "greenwashing_risk": risk,
            "net_issuable_carbon_tons": cross_validation.get("net_issuable_carbon_tons", 0.0),
            "mrv_compliance": mrv,
            "final_verification_status": status,
            "human_readable_summary": "Gemini API unavailable. Decision was generated from deterministic cross-validation evidence.",
        }, cross_validation)

    def _normalize_output(self, output: dict, cross_validation: dict) -> dict:
        blocked = bool(cross_validation.get("verification_blocked", False))
        risk = str(output.get("greenwashing_risk", cross_validation.get("greenwashing_risk", "Medium"))).title()
        if risk not in {"Low", "Medium", "High"}:
            risk = "High" if blocked else "Medium"

        confidence = int(float(output.get("overall_confidence", cross_validation.get("calculated_base_confidence", 0))))
        additionality = int(float(output.get("additionality_score", cross_validation.get("additionality_proxy_score", 0))))
        net_issuable = float(output.get("net_issuable_carbon_tons", cross_validation.get("net_issuable_carbon_tons", 0.0)))
        mrv = str(output.get("mrv_compliance", "FAIL")).upper()

        # Hard policy override
        if blocked or any(str(f).startswith("CRITICAL") for f in cross_validation.get("flags", [])):
            mrv = "FAIL"
            risk = "High"
            confidence = min(confidence, int(cross_validation.get("calculated_base_confidence", 35)), 35)
            net_issuable = 0.0
        elif mrv not in {"PASS", "FAIL"}:
            mrv = "PASS" if risk == "Low" else "FAIL"

        confidence = max(0, min(100, confidence))
        additionality = max(0, min(100, additionality))
        final_status = "Approved" if mrv == "PASS" else "Pending Manual Review"

        return {
            "overall_confidence": confidence,
            "additionality_score": additionality,
            "greenwashing_risk": risk,
            "net_issuable_carbon_tons": round(net_issuable, 2),
            "mrv_compliance": mrv,
            "final_verification_status": final_status,
            "human_readable_summary": output.get(
                "human_readable_summary",
                "Verification completed using weighted evidence from vision, satellite, and cross-validation layers."
            ),
            "flags": cross_validation.get("flags", [])
        }
