from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import uuid
from services.nlp_service import download_from_s3, extract_text_pdf, extract_text_docx, extract_text_pptx, extract_text_txt, get_topics

router = APIRouter()

class ExtractRequest(BaseModel):
    file_url: str
    file_type: str

@router.post("/extract-topics")
def extract_topics(request: ExtractRequest):
    local_filename = f"/tmp/{uuid.uuid4()}.{request.file_type}"
    try:
        download_from_s3(request.file_url, local_filename)
        
        text = ""
        ftype = request.file_type.lower()
        if ftype == "pdf":
            text = extract_text_pdf(local_filename)
        elif ftype == "docx":
            text = extract_text_docx(local_filename)
        elif ftype == "pptx":
            text = extract_text_pptx(local_filename)
        elif ftype == "txt":
            text = extract_text_txt(local_filename)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        if not text.strip():
            return {"topics": [], "keywords": [], "summary": "No text could be extracted."}

        topics = get_topics(text)
        summary = text[:500] + "..." if len(text) > 500 else text # Basic summary stub

        return {
            "topics": topics,
            "keywords": topics, 
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(local_filename):
            os.remove(local_filename)
