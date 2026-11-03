import os
import requests
import urllib.parse
from docx import Document
from pptx import Presentation
import fitz  # PyMuPDF
from keybert import KeyBERT

kw_model = KeyBERT()

def download_from_s3(s3_url: str, local_path: str):
    response = requests.get(s3_url, stream=True)
    response.raise_for_status()
    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def extract_text_pdf(file_path: str) -> str:
    text = ""
    doc = fitz.open(file_path)
    for page in doc:
        text += page.get_text()
    return text

def extract_text_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_pptx(file_path: str) -> str:
    text = ""
    prs = Presentation(file_path)
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text + "\n"
    return text
    
def extract_text_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def get_topics(text: str):
    # Extracts top 5 keywords/topics using KeyBERT
    keywords = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=5)
    topics = [kw[0] for kw in keywords]
    return topics
