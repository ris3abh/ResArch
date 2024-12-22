import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings  # Use Pydantic settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

def upload_file_to_cloudinary(local_filepath: str, public_id: str = None, resource_type="auto"):
    """
    Uploads a file to Cloudinary.
    - local_filepath: The local file path to upload.
    - public_id: The ID to use for the uploaded file.
    - resource_type: The Cloudinary resource type (image, raw, etc.)
    """
    response = cloudinary.uploader.upload(
        local_filepath, 
        public_id=public_id, 
        resource_type=resource_type
    )
    return response.get("secure_url")

def delete_file_from_cloudinary(public_id: str, resource_type="auto"):
    """
    Deletes a file from Cloudinary.
    - public_id: The public ID of the file to delete (e.g., 1_template_1_pdf).
    - resource_type: The Cloudinary resource type (raw, image, video).
    """
    try:
        response = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        if response.get("result") == "ok":
            return True
        else:
            return False
    except Exception as e:
        raise Exception(f"Failed to delete file from Cloudinary: {str(e)}")
    
def delete_resource_from_cloudinary(resource_url: str):
    # Extract the public_id from the URL
    public_id = resource_url.split("/")[-1].split(".")[0]  # Extracts '1_template_1_pdf' from the URL
    cloudinary.api.delete_resources([public_id])