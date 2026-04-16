from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import verify, upload
import os
from dotenv import load_dotenv

# Load shared environment variables from the project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(
    title="VeriCredit AI Backend",
    description="FastAPI backend for ML Vision and Satellite analysis, complying with India CCTS 2026.",
    version="1.0.0"
)

# Allow Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify.router, prefix="/api/verify")
app.include_router(upload.router, prefix="/api/upload")

@app.get("/")
def read_root():
    return {"status": "VeriCredit AI Backend is running. CCTS Compliance Mode: Active."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
