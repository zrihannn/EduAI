from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extractor, recommender, ai_teacher

app = FastAPI(title="EduAI Python AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extractor.router, tags=["Extractor"])
app.include_router(recommender.router, tags=["Recommender"])
app.include_router(ai_teacher.router, tags=["AI Teacher"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
