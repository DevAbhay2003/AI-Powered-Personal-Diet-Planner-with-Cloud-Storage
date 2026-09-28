"""
Cloud Object Storage Management Routes
Handles file uploads, bucket listing, file downloads, and deletions.
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Response
from typing import List
from backend.utils.security import get_current_user
from cloud.storage_service import CloudObjectStorageService

router = APIRouter(prefix="/files", tags=["Cloud Object Storage"])

@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_file_to_cloud(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads a file (meal photo, receipt, diet document) into Cloud Object Storage.
    Validates file extension and size, records metadata in Cloud Database.
    """
    try:
        content = await file.read()
        record = CloudObjectStorageService.save_object(
            user_id=current_user["user_id"],
            filename=file.filename or "uploaded_file",
            file_bytes=content,
            content_type=file.content_type or "application/octet-stream"
        )
        return {
            "message": "File successfully uploaded and stored in Cloud Object Storage.",
            "file": record
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process cloud file upload: {str(e)}"
        )

@router.get("", response_model=List[dict])
def list_cloud_files(current_user: dict = Depends(get_current_user)):
    """
    Lists all files currently stored in Cloud Object Storage for the authenticated user.
    """
    return CloudObjectStorageService.list_objects(current_user["user_id"])

@router.get("/{file_id}/download")
def download_cloud_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Downloads or streams an object from Cloud Storage.
    Enforces user isolation: User A cannot download User B's file.
    """
    res = CloudObjectStorageService.get_object(current_user["user_id"], file_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found in Cloud Storage or unauthorized access."
        )

    file_bytes, filename, content_type = res
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return Response(content=file_bytes, media_type=content_type, headers=headers)

@router.delete("/{file_id}", response_model=dict)
def delete_cloud_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes an object from Cloud Storage and cleans up its database metadata.
    """
    success = CloudObjectStorageService.delete_object(current_user["user_id"], file_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or unauthorized to delete."
        )
    return {"message": "Object successfully deleted from Cloud Storage."}
