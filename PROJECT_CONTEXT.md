# VeriCredit AI - Full Project Context (Read This First Every Time)

## Project Overview
VeriCredit AI is a complete web-based platform for carbon credit projects, with a strong focus on afforestation and tree planting. It combines user-submitted data, ML vision, satellite analysis, and blockchain to create transparent, verifiable, and CCTS-compliant carbon credits.

The platform enables:
- Project developers to submit tree planting projects
- Automated verification using ML + satellite data
- Minting of credits as NFTs on Polygon testnet
- Trading in a marketplace
- Retirement of credits with full compliance proof

## Government & CCTS Integration (Mandatory)
- Support two modes: **CCTS Compliance** and **CCTS Offset**
- Smart contracts must include CCTS metadata fields:
  - `scheme_type` ("compliance" or "offset")
  - `additionality_placeholder`
  - `bee_export_flag`
- Marketplace must display prominent **"CCTS Compliant"** badges
- Retirement flow must generate a downloadable PDF/JSON certificate ready for upload to **Bureau of Energy Efficiency (BEE)** / Indian Carbon Market Portal

## Detailed System Components & Responsibilities

### 1. Web Frontend (Next.js 15 + Tailwind)
Pages and their functions:
- **Home/Dashboard**: Overview stats, quick actions (Submit Project, Browse Marketplace)
- **Submit Project**: Upload multiple tree photos, GPS coordinates, project details, CCTS mode selector
- **Verification Result**: Show ML vision results + satellite data + placeholders for LLM verification score
- **Marketplace**: Credit listings with filters (price, CCTS badge, verification score, location), grid view, detail modal
- **My Projects**: List of user-submitted projects and their status
- **My Portfolio**: Owned credits and retirement history
- **Wallet Connection**: Support Polygon testnet via RainbowKit / Wagmi

### 2. Backend (FastAPI)
- Handle file uploads and IPFS storage
- Call ML Vision Analyzer
- Call Satellite Data Analyzer
- Provide placeholder endpoint `/api/verify` for future LLM integration
- Serve data to frontend

### 3. ML Vision Analyzer (DeepForest)
- Analyze user-uploaded tree photos
- Return: tree_count, average_health_score (0-100), survival_rate, basic segmentation summary
- Target accuracy: >85% on typical planted tree images

### 4. Satellite Data Analyzer (Google Earth Engine + Sentinel-2)
- Accept GPS coordinates
- Fetch latest available Sentinel-2 imagery (5–10 day revisit)
- Compute and return: NDVI value, canopy_cover_percentage, biomass_estimate, before/after change indicators

### 5. Blockchain Layer (Hardhat + Solidity on Polygon testnet)
- ERC-1155 smart contracts for carbon credits
- Functions: mint, transfer, retire (burn)
- Store CCTS metadata on-chain
- Generate immutable audit trail

### 6. Storage
- Photos and reports stored on IPFS (Pinata or nft.storage)
- Only hash stored on blockchain

## Full Expected Workflow
1. User registers/connects wallet and submits project (photos + GPS + details + CCTS mode)
2. Backend stores photos on IPFS
3. System runs ML Vision Analyzer on photos
4. System runs Satellite Analyzer using GPS
5. Results page shows vision + satellite data + "AI Verification Score (LLM pending)" placeholder
6. User clicks "Mint Credit" → smart contract mints NFT with CCTS metadata
7. Credit appears in Marketplace with full audit trail
8. Buyer can purchase credit using wallet
9. Buyer can retire credit → token is burned + compliance certificate is generated

## Technical Constraints (Strict)
- Build ONLY non-LLM parts right now.
- Do NOT add any LangGraph, Gemini, Vertex AI agents, or multi-agent code.
- Use clear placeholders (with comments) for the LLM part.
- The LLM (Vertex Generative AI) will later handle: additionality scoring, greenwashing detection, full MRV compliance, and final verification decision.

## Tone & Style
- Professional, modern climate-tech aesthetic
- Primary colors: Green and teal
- Emphasize trust, transparency, and immutability (blockchain + verification)
- Clean, intuitive, mobile-friendly interface

## Future LLM Integration (Vertex Generative AI)
When connecting later from friend's laptop:
- Create `/api/verify` endpoint that receives: vision results + satellite results + project data
- LLM (Vertex Generative AI) should return:
  - additionality_score (0-100)
  - greenwashing_risk (Low/Medium/High)
  - mrv_compliance (boolean + explanation)
  - final_verification_status
- Integration must be simple — one function call in the backend.

## Instructions for Every Build
- Always read this PROJECT_CONTEXT.md file first before generating any code.
- Extract the best parts from the listed GitHub repos and adapt them to perfectly match this context.
- Make all changes necessary for CCTS compliance and the defined workflow.
- At the very end of every response, add a section titled:
  **WHAT HAS BEEN BUILT IN THIS RESPONSE**
  and list every component completed in clear bullet points.

Now read this file carefully and build the project accordingly.