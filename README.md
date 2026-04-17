# VeriCredit AI — CCTS Compliant Carbon Credits

VeriCredit AI is a state-of-the-art web platform for carbon credit projects, built strictly for compliance with **India's Carbon Credit Trading Scheme (CCTS) 2026**. It merges machine learning (DeepForest + GEE) with blockchain tokenization (Polygon Amoy / Hardhat) to verify and issue high-integrity carbon offsets.

## Architecture

```
frontend/          → Next.js 15 + Tailwind + RainbowKit + Supabase Auth
backend/           → FastAPI + DeepForest ML + Google Earth Engine
contracts/         → Hardhat + Solidity ERC-1155 (VeriCredit.sol)
```

## Testing the New Admin Minting Flow & Verification System

1. Visit `/login` to access the portal (or bypass if using mocked protected routes).
2. Go to `/submit-project` and click **"Load Sample Data"**. This pre-fills authentic Western Ghats Coordinates and mock ground photos.
3. Click "Start AI Audit Pipeline". The FastAPI backend will analyze the photos (DeepForest), fetch Sentinel-2 data (Google Earth Engine), fetch climatology (NASA POWER), and topography (Open-Meteo) simultaneously. LLM verification is explicitly bypassed.
4. On the VeriCredit Report generation screen, review the fetched data from all sources.
5. Click **"Submit for Admin Review"**.
6. Access `/admin` dashboard.
7. Connect your Wallet (Polygon Amoy testnet) using the RainbowKit modal.
8. Locate your pending project in the CCTS Submission Ledger and click the green checkmark (Approve & Mint) to invoke the ERC-1155 Smart Contract.
9. Verify the Carbon Credit Token is generated in the **Portfolio**.

## Features

- **Supabase Auth** — Email/password signup, login, forgot password, admin role, subscription tiers (Free/Basic/Premium)
- **Demo Mode** — Full functionality without Supabase credentials for instant local testing
- **Protected Routes** — Role-based access control (user vs admin), subscription-tier gating
- **Wallet Integration** — RainbowKit/Wagmi for Polygon Amoy, real MATIC balance display
- **AI Verification Pipeline** — DeepForest vision analysis + GEE satellite data + LLM placeholder
- **Verification Report** — Beautiful detailed report page with PDF export (print-to-PDF)
- **Blockchain Minting** — ERC-1155 NFT minting with CCTS metadata on Polygon
- **Carbon Marketplace** — Browse, buy, and retire CCTS-compliant credits
- **Portfolio Management** — Owned tokens, retirement flow, downloadable compliance certificates
- **Admin Panel** — Admin-only dashboard showing all projects across all users
- **Sample Data** — One-click sample data loading for instant testing

## Local Testing Instructions

### Step 1: Environment Variables

Copy `.env.example` to `.env` (root) and `frontend/.env.local` (frontend):

```bash
cp .env.example .env
cp .env.example frontend/.env.local
```

Fill in your keys:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — From https://supabase.com (optional — demo mode works without these)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — From https://cloud.reown.com
- `PRIVATE_KEY` — Your crypto wallet private key for Polygon Amoy
- `NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS` — From Step 3 below

> **Note:** If you skip Supabase configuration, the app runs in **Demo Mode** with mock auth. All features are fully testable.

### Step 2: Boot the FastAPI Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Backend runs on: http://localhost:8000*

### Step 3: Deploy Smart Contracts (Optional)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon_amoy
```
Copy the deployed address to `NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS` in your `.env.local`.

### Step 4: Run Next.js Frontend

```bash
cd frontend
npm install
npm install @supabase/supabase-js
npm run dev
```
*Frontend runs on: http://localhost:3000*

## Testing the Full Workflow

### Quick Test (Demo Mode — No Supabase Required)

1. **Visit** http://localhost:3000
2. **Login** — Click "Get Started", enter any email/password → auto-logged in (Demo Mode)
3. **Dashboard** — Click **"🧪 Load Sample Data"** to populate test projects & tokens instantly
4. **Submit Project** — Go to "Submit Data", click **"Test with Sample Data"**, then **"Submit to verification pipeline"**
5. **View Report** — After verification completes, scroll to see the full Verification Report with Vision + Satellite + AI scores
6. **Download PDF** — Click **"📄 Download Report as PDF"** to print/save the report
7. **Mint Credit** — Click **"⛏ Mint Credit on Polygon Amoy"** (requires wallet connection)
8. **Marketplace** — Navigate to Marketplace, see your minted credit, click **"Buy & Retire"**
9. **Download Certificate** — After retirement, click **"Download Cert"** for the CCTS compliance certificate
10. **Portfolio** — View your owned tokens and retired credits, download certificates

### Admin Login

1. On the login page, check **"Admin Login"** checkbox
2. Enter any email/password (Demo Mode)
3. You'll be redirected to the **/admin** panel
4. View all submitted projects across all users in a table view

### With Supabase (Optional)

1. Create a project at https://supabase.com
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `frontend/.env.local`
3. Sign up with a real email — you'll get a confirmation email
4. Login after confirming — full session management with Supabase

### Wallet Connection

1. Click the wallet button in the navbar (RainbowKit)
2. Connect with MetaMask or any WalletConnect-compatible wallet
3. Switch to **Polygon Amoy Testnet**
4. Your MATIC balance will display in the navbar and dashboard

## Subscription Tiers

| Tier | Access |
|------|--------|
| **Free** | View-only (dashboard, marketplace browsing) |
| **Basic** | Submit projects + verification |
| **Premium** | Full marketplace + retirement + portfolio |

## Project Structure

```
frontend/
├── app/
│   ├── admin/page.tsx          # Admin-only dashboard
│   ├── dashboard/page.tsx      # Main dashboard with stats
│   ├── forgot-password/page.tsx # Password reset flow
│   ├── login/page.tsx          # Login + Signup + Admin toggle
│   ├── marketplace/page.tsx    # Carbon credit marketplace
│   ├── my-projects/page.tsx    # User's project list
│   ├── portfolio/page.tsx      # Owned tokens + retirement
│   ├── submit-project/page.tsx # Submit + verify + mint flow
│   ├── verification-report/page.tsx # Detailed report viewer
│   ├── globals.css             # Tailwind + animations + print CSS
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Public landing page
│   └── providers.tsx           # Wagmi + RainbowKit + Auth + Store
├── components/
│   ├── CCTSBadge.tsx           # CCTS compliance badge
│   ├── Navbar.tsx              # Responsive nav with avatar/badges
│   ├── VerificationReport.tsx  # Full verification report component
│   └── WalletCard.tsx          # Wallet balance + token summary
├── contexts/
│   └── AuthContext.tsx         # Supabase auth with demo fallback
├── hooks/
│   ├── useProtectedRoute.ts    # Role + tier access control
│   ├── useTokenBalance.ts      # ERC-1155 balance reader
│   └── useWalletInfo.ts        # MATIC balance hook
├── lib/
│   ├── projectStore.tsx        # Client-side project data store
│   └── supabase.ts             # Supabase client init
└── utils/
    └── abis.ts                 # VeriCredit contract ABI
```

## Tech Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS, TypeScript
- **Auth:** Supabase (with demo mode fallback)
- **Blockchain:** Wagmi v2, RainbowKit v2, Viem, Polygon Amoy Testnet
- **Smart Contract:** Solidity 0.8.20, ERC-1155, Hardhat
- **Backend:** FastAPI, DeepForest, Google Earth Engine API
- **Storage:** IPFS (nft.storage / Pinata)

## Future LLM Integration (Vertex Generative AI)

The LLM verification section is clearly marked as a placeholder throughout the codebase. When integrating from your friend's laptop:
1. Open `backend/routers/validate.py`
2. Locate the `# TODO: Call Vertex Generative AI from friend's laptop here` comment.
3. Pass `vision_results`, `satellite_results`, and `cross_validation` explicitly into your Vertex prompt.
4. Replace the static `llm_placeholder` dictionary with the live JSON output from Vertex.
