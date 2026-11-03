from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import httpx
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os

router = APIRouter()
model = SentenceTransformer('all-MiniLM-L6-v2')

class RecommendRequest(BaseModel):
    query: str
    topics: Optional[List[str]] = []
    type: Optional[str] = "ALL"
    platform: Optional[str] = None

# Stub models for mock API results
class CourseResult(BaseModel):
    title: str
    description: str
    url: str
    thumbnail_url: str
    platform: str
    course_type: str
    instructor: str
    duration: str
    relevance_score: float

@router.post("/recommend")
def recommend_courses(request: RecommendRequest):
    # Mocking integrations (YouTube, Coursera) due to missing actual API keys in the prompt
    mock_results = [
        CourseResult(
            title=f"Learn {request.query} Tutorial For Beginners",
            description="Complete crash course.",
            url="https://youtube.com/watch?v=mock_id",
            thumbnail_url="https://img.youtube.com/vi/mock_id/0.jpg",
            platform="YOUTUBE",
            course_type="FREE",
            instructor="YouTube Creator",
            duration="2 Hours",
            relevance_score=0.9
        ),
        CourseResult(
            title=f"{request.query} Specialization",
            description="Master the concepts of " + request.query,
            url="https://coursera.org/learn/mock-course",
            thumbnail_url="https://coursera.org/mock-thumb.jpg",
            platform="COURSERA",
            course_type="FREE",
            instructor="University Prof",
            duration="4 Weeks",
            relevance_score=0.85
        )
    ]
    
    # 1) Generate embeddings for query
    query_emb = model.encode([request.query])
    
    # 2) Generate embeddings for course titles specifically
    titles = [c.title for c in mock_results]
    title_embs = model.encode(titles)
    
    # 3) Calculate Cosine Similarity
    similarities = cosine_similarity(query_emb, title_embs)[0]
    
    # 4) Update relevance scores and sort
    for idx, c in enumerate(mock_results):
        c.relevance_score = float(np.round(similarities[idx], 4))
        
    sorted_results = sorted(mock_results, key=lambda x: x.relevance_score, reverse=True)
    
    # Ensure they match the platform/type filter
    filtered = []
    for r in sorted_results:
        if request.type != "ALL" and r.course_type != request.type:
            continue
        if request.platform and request.platform != r.platform:
            continue
        filtered.append(r)

    # In a real app we'd map this exact JSON structure back into Spring Boot
    # Note: Returning list of dicts for FastAPI automatic serialization
    return [r.dict() for r in filtered]
