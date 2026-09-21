# 🐳 Docker Setup for Blog Backend

Quick guide to run the blog backend with Docker.

## 🚀 Quick Start

```bash
# Start containers
./docker-scripts.sh up

# View logs
./docker-scripts.sh logs

# Stop containers
./docker-scripts.sh down
```

## 🏗️ Architecture

- **API Server** - Node.js Express (Port 5500)
- **PostgreSQL** - Database (Port 5433)
- **Redis** - Message queue (Port 6379)

## 🔧 Available Commands

```bash
./docker-scripts.sh up      # Start containers
./docker-scripts.sh down    # Stop containers
./docker-scripts.sh logs    # View logs
./docker-scripts.sh shell   # Access container
./docker-scripts.sh build   # Build images
./docker-scripts.sh clean   # Clean up everything
```

## 🌐 Access Points

- **API**: http://localhost:5500
- **API Docs**: http://localhost:5500/api-docs
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6379

## 🗄️ Database Setup

```bash
# Run migrations
./docker-scripts.sh migrate

# Seed database (optional)
./docker-scripts.sh seed
```

## 🐛 Troubleshooting

**Port conflicts:**

```bash
lsof -i :5500  # Check what's using port
./docker-scripts.sh clean  # Clean slate
```

**Container issues:**

```bash
docker-compose ps  # Check status
docker-compose logs api  # View logs
```

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
