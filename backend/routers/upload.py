import os
import requests
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter()

class UploadResponse(BaseModel):
    ipfs_hash: str
    filename: str
    message: str

@router.post("/", response_model=UploadResponse)
async def upload_file_to_ipfs(file: UploadFile = File(...)):
    """
    Uploads file to IPFS exclusively via nft.storage.
    """
    nft_storage_key = os.getenv("NFT_STORAGE_API_KEY")

    if not nft_storage_key:
        # Graceful fallback for local testing without an explicit API key
        return UploadResponse(
            ipfs_hash=f"QmSimulatedHashFor{file.filename.replace(' ', '')}",
            filename=file.filename,
            message="No NFT.Storage keys found; simulated IPFS upload."
        )

    # Standard nft.storage endpoint
    url = "https://api.nft.storage/upload"
    
    headers = {
        "Authorization": f"Bearer {nft_storage_key}",
    }
    
    try:
        contents = await file.read()
        
        # nft.storage accepts raw binary data or multipart
        # Here we post the binary payload directly for a single file component
        response = requests.post(url, data=contents, headers=headers)
        
        if response.status_code == 200:
            json_response = response.json()
            if json_response.get("ok"):
                ipfs_hash = json_response["value"]["cid"]
                return UploadResponse(
                    ipfs_hash=ipfs_hash,
                    filename=file.filename,
                    message="Stored on IPFS successfully via nft.storage."
                )
            else:
                raise HTTPException(status_code=500, detail="NFT.Storage returned not ok.")
        else:
            raise HTTPException(status_code=response.status_code, detail=f"NFT.Storage IPFS Error: {response.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
