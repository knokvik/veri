# VeriCredit AI - CCTS Compliant Carbon Credits

VeriCredit AI is a state-of-the-art web platform for carbon credit projects, built strictly for compliance with **India’s Carbon Credit Trading Scheme (CCTS) 2026**. It merges machine learning (DeepForest + GEE) with blockchain tokenization (Polygon Amoy / Hardhat) to verify and issue high-integrity carbon offsets.

## Local Testing Instructions

Follow these numbered steps to run the full workflow locally.

### Step 1: Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
1. `PINATA_API_KEY` (or nft.storage equivalent keys).
2. `GEE_PRIVATE_KEY_JSON_PATH` pointing to your local Google service account file.
3. Your crypto wallet `PRIVATE_KEY` for Polygon Amoy gas fees.
```bash
cp .env.example .env
```

### Step 2: Boot the FastAPI Backend
Launch the ML processing nodes and IPFS pinnings.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Backend runs on: http://localhost:8000*

### Step 3: Deploy Smart Contracts
Deploy the unified ERC-1155 smart contract to Polygon Amoy. Note the generated contract address.
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon_amoy
```

### Step 4: Run Next.js Frontend
*Important: Set the VERICREDIT_CONTRACT_ADDRESS in the `app/dashboard/page.tsx` and `app/marketplace/page.tsx` React component files using the address from Step 3.*
```bash
cd frontend
npm install --save wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
npm run dev
```

### Step 5: Test the Application Flow End-to-End
1. **Connect Wallet:** Visit `http://localhost:3000` and use the RainbowKit button to connect to Polygon Amoy.
2. **Dashboard Testing:** Click **"Test with Sample Data"** on the Dashboard. This pre-fills coordinates and project fields to simulate your physical tree planting sites.
3. **Approval Flow:** Click "Submit to verification pipeline". Watch the execution logs pinging IPFS for hashing, DeepForest for vision bounding boxes, GEE for NDVI indices, and the Vertex AI placeholder for additionality mapping.
4. **Mint the Credit:** Click "Mint Credit on Polygon Amoy" to cast the verified JSON payload onto the blockchain (`mintCredit` function).
5. **Retire Flow:** Navigate to the **Marketplace** page, locate your credit (or the samples), and click "Buy & Retire" to execute the `retireCredit` burn path, simulating the BEE certificate download.
