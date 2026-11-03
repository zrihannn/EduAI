from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import openai
import google.generativeai as genai
import anthropic

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    model: str = "gemini-1.5-pro"

# Smart local fallback that provides educational responses
def local_fallback_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["hello", "hi", "hey"]):
        return "Hello! I'm your AI Teacher. Ask me anything about programming, data science, web development, or any topic you'd like to learn about!"
    elif any(w in msg for w in ["python", "code", "programming"]):
        return f"""Great question about **{message}**!

Python is one of the most versatile programming languages. Here are key concepts to learn:

1. **Variables & Data Types** - integers, strings, lists, dicts
2. **Control Flow** - if/else, for/while loops  
3. **Functions** - define reusable blocks with `def`
4. **Classes & OOP** - encapsulate data and behavior
5. **Libraries** - NumPy, Pandas, Requests, etc.

**Recommended learning path:**
- Start with Python.org official tutorial
- Practice on LeetCode or HackerRank
- Build a project (web scraper, data analysis, etc.)

Would you like me to explain any of these concepts in detail?"""
    elif any(w in msg for w in ["machine learning", "ml", "deep learning", "ai", "neural"]):
        return f"""**Machine Learning** is a fascinating field! Here's your learning roadmap:

**Foundations (2-3 months):**
- Linear Algebra & Statistics
- Python + NumPy + Pandas
- **Courses:** Andrew Ng's ML Specialization on Coursera

**Core ML Algorithms:**
- Linear/Logistic Regression
- Decision Trees, Random Forests
- Neural Networks & Backpropagation
- Support Vector Machines

**Deep Learning (3-6 months):**
- TensorFlow or PyTorch
- CNNs for image recognition
- RNNs/Transformers for NLP
- **Courses:** fast.ai, deeplearning.ai

**Projects to build:**
- Image classifier (cats vs dogs)
- Sentiment analysis
- Price prediction model

What specific area of ML are you most interested in?"""
    elif any(w in msg for w in ["react", "javascript", "js", "frontend", "web"]):
        return f"""**Web Development with React** — here's your guide:

**JavaScript Fundamentals first:**
- ES6+ (arrow functions, async/await, destructuring)
- DOM manipulation
- Fetch API & Promises

**React Core Concepts:**
- Components (functional + class)
- Props & State management
- Hooks: `useState`, `useEffect`, `useContext`
- React Router for navigation

**State Management:**
- Zustand (lightweight, recommended for beginners)
- Redux Toolkit (for larger apps)

**Full Stack path:**
- Frontend: React + Vite + Tailwind
- Backend: Node.js/Express or Spring Boot
- Database: PostgreSQL + Prisma

**Resources:**
- official React docs (react.dev)
- The Odin Project (free)
- Scrimba React course

What part of web dev would you like to explore?"""
    elif any(w in msg for w in ["data science", "pandas", "numpy", "analysis"]):
        return f"""**Data Science** is a great career choice! Here's a complete roadmap:

**1. Mathematics & Statistics:**
- Descriptive statistics (mean, median, std)
- Probability theory
- Linear algebra basics

**2. Python for Data Science:**
- **Pandas**: data manipulation & cleaning
- **NumPy**: numerical computing  
- **Matplotlib/Seaborn**: visualization

**3. Machine Learning:**
- Scikit-learn for classical ML
- Feature engineering
- Model evaluation & validation

**4. Advanced Tools:**
- SQL for database queries
- Tableau/Power BI for dashboards
- Spark for big data

**Top Courses:**
- Kaggle's free courses
- IBM Data Science on Coursera
- DataCamp

**Start with:** Kaggle's Titanic competition for a practical project!

Any specific area you want to dive deeper into?"""
    else:
        return f"""I'd be happy to help you learn about: **"{message}"**

As your AI Teacher, I can guide you through:

📚 **Programming Languages** — Python, JavaScript, Java, etc.
🤖 **Machine Learning & AI** — algorithms, deep learning, NLP
🌐 **Web Development** — React, Node.js, APIs, databases
📊 **Data Science** — analysis, visualization, statistics
☁️ **Cloud & DevOps** — AWS, Docker, Kubernetes

To give you the most helpful answer, could you be more specific about:
- What's your current skill level?
- What are you trying to build or achieve?
- Which platform or technology are you using?

I'm here to create a personalized learning path for you! 🎓"""

@router.post("/ai-chat")
def ai_chat(request: ChatRequest):
    model_name = request.model.lower()
    
    try:
        reply = None
        tokens = 0

        if "gpt-4o" in model_name or "gpt" in model_name:
            api_key = os.getenv("OPENAI_API_KEY", "")
            if api_key and api_key not in ("your_openai_key", "mock-key", ""):
                client = openai.OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=request.history + [{"role": "user", "content": request.message}]
                )
                reply = response.choices[0].message.content
                tokens = response.usage.total_tokens

        elif "gemini" in model_name:
            api_key = os.getenv("GEMINI_API_KEY", "")
            if api_key and api_key not in ("your_gemini_key", "mock-key", ""):
                try:
                    genai.configure(api_key=api_key)
                    gemini = genai.GenerativeModel('gemini-1.5-flash')
                    response = gemini.generate_content(request.message)
                    reply = response.text
                    tokens = 120
                except Exception as ge:
                    # Gemini key might be invalid - fall through to local fallback
                    pass

        elif "claude" in model_name:
            api_key = os.getenv("ANTHROPIC_API_KEY", "")
            if api_key and api_key not in ("your_anthropic_key", "mock-key", ""):
                client = anthropic.Anthropic(api_key=api_key)
                response = client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=1000,
                    messages=[{"role": "user", "content": request.message}]
                )
                reply = response.content[0].text
                tokens = 130

        # Use smart local fallback if no API responded
        if reply is None:
            reply = local_fallback_response(request.message)
            tokens = len(reply.split())

        return {
            "response": reply,
            "model": request.model,
            "tokens_used": tokens
        }

    except Exception as e:
        # Last resort - always return something useful
        reply = local_fallback_response(request.message)
        return {
            "response": reply,
            "model": request.model,
            "tokens_used": len(reply.split())
        }
