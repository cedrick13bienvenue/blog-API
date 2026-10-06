#!/bin/bash

# Docker Scripts for Blog Backend
# Usage: ./docker-scripts.sh [command]

case "$1" in
  "build")
    echo "🏗️ Building Docker images..."
    docker-compose build
    ;;
    
  "up")
    echo "🚀 Starting containers..."
    docker-compose up -d
    ;;
    
  "down")
    echo "🛑 Stopping all containers..."
    docker-compose down
    ;;
    
  "logs")
    echo "📋 Showing container logs..."
    docker-compose logs -f
    ;;
    
  "clean")
    echo "🧹 Cleaning up containers and volumes..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    ;;
    
  "migrate")
    echo "🗄️ Running database migrations..."
    docker-compose exec api npm run migration
    ;;
    
  "seed")
    echo "🌱 Seeding database..."
    docker-compose exec api npm run seed
    ;;
    
  "test")
    echo "🧪 Running tests in container..."
    docker-compose exec api npm test
    ;;
    
  "shell")
    echo "🐚 Opening shell in API container..."
    docker-compose exec api sh
    ;;
    
  *)
    echo "📋 Available commands:"
    echo "  build      - Build Docker images"
    echo "  up         - Start containers"
    echo "  down       - Stop containers"
    echo "  logs       - Show container logs"
    echo "  clean      - Clean up containers and volumes"
    echo "  migrate    - Run database migrations"
    echo "  seed       - Seed database"
    echo "  test       - Run tests"
    echo "  shell      - Open shell in container"
    ;;
esac 