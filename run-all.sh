#!/bin/bash
echo "Starting EduAI Recommender..."
docker-compose up --build -d
echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8080/swagger-ui.html"
echo "Python AI Service: http://localhost:8001/docs"
