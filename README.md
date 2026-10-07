# Blog Backend API

A comprehensive RESTful API built with Node.js, Express, TypeScript, and PostgreSQL for managing a blog platform with authentication, comments, likes, and newsletter subscriptions.

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Email System](#email-system)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (JWT and Google OAuth2)
- Role-based access control (Admin/User)
- Blog CRUD operations
- Comment system
- Like/Unlike functionality
- Newsletter subscription management
- Email notification queue system with Redis
- File upload to Cloudinary
- Comprehensive logging with Winston
- API documentation with Swagger
- Docker support
- Extensive test coverage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Cache/Queue**: Redis (IORedis)
- **Authentication**: JWT, Passport.js (Google OAuth2)
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer with EJS templates
- **Testing**: Jest, Supertest
- **Documentation**: Swagger
- **Logging**: Winston
- **Containerization**: Docker

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Redis (v7 or higher)
- Docker and Docker Compose (optional)
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

## Installation

### Local Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd back-end/blog-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (see Configuration section)

4. Set up the database:

```bash
npm run migration
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5500
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogdb
DB_USER=postgres
DB_PASSWORD=your_password

# Test Database Configuration
TEST_HOST=localhost
TEST_PORT=5432
TEST_DATABASE=blogAPI-Test
TEST_USERNAME=postgres
TEST_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Session Configuration
SESSION_SECRET=your_session_secret

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5500/auth/google/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Support Email
SUPPORT_EMAIL=support@blogapi.com
```

## Database Setup

### Using Sequelize CLI

1. Create the database:

```bash
createdb blogdb
createdb blogAPI-Test
```

2. Run migrations:

```bash
npm run migration
```

3. Seed the database (optional):

```bash
npm run seed
```

4. Undo migrations (if needed):

```bash
npm run undo-migration
```

### Manual Database Setup

You can also set up the database manually using the migration files in `src/migrations/`.

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Email Worker (Background Process)

```bash
npm run worker:email
```

## Docker Deployment

### Quick Start

1. Start all services:

```bash
./docker-scripts.sh up
```

2. View logs:

```bash
./docker-scripts.sh logs
```

3. Stop services:

```bash
./docker-scripts.sh down
```

### Available Docker Commands

```bash
./docker-scripts.sh build      # Build Docker images
./docker-scripts.sh up         # Start containers
./docker-scripts.sh down       # Stop containers
./docker-scripts.sh logs       # Show container logs
./docker-scripts.sh shell      # Open shell in API container
./docker-scripts.sh migrate    # Run database migrations
./docker-scripts.sh seed       # Seed database
./docker-scripts.sh test       # Run tests
./docker-scripts.sh clean      # Clean up containers and volumes
```

### Docker Services

- **API Server**: http://localhost:5500
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6379
- **Email Worker**: Background service (optional profile)

## API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:5500/api-docs
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- auth-test.ts
```

### Test Coverage

The project includes comprehensive integration tests covering:

- Authentication (registration, login, OAuth2)
- Blog CRUD operations
- Comment functionality
- Like/Unlike features
- Authorization and role-based access
- Error handling

Coverage thresholds:

- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Project Structure

```
blog-backend/
├── config/                 # Configuration files
│   ├── config.js
│   └── config.ts
├── src/
│   ├── config/            # Application configuration
│   │   ├── db.ts          # Database connection
│   │   ├── logger.ts      # Winston logger setup
│   │   └── redis.ts       # Redis configuration
│   ├── controllers/       # Route controllers
│   │   ├── auth-controller.ts
│   │   ├── blog-controller.ts
│   │   ├── comment-controller.ts
│   │   ├── like-controller.ts
│   │   └── newsletter-controller.ts
│   ├── middlewares/       # Custom middleware
│   │   ├── auth.ts
│   │   ├── google-auth.ts
│   │   ├── protect.ts
│   │   ├── role-checker.ts
│   │   ├── session-blacklist.ts
│   │   └── validate-blog.ts
│   ├── migrations/        # Database migrations
│   ├── models/            # Sequelize models
│   │   ├── blog-model.ts
│   │   ├── comment-model.ts
│   │   ├── like-model.ts
│   │   ├── newsletter-subscriber-model.ts
│   │   ├── user-model.ts
│   │   └── index.ts
│   ├── routes/            # API routes
│   │   ├── auth-routes.ts
│   │   ├── blog-routes.ts
│   │   ├── comment-routes.ts
│   │   ├── like-routes.ts
│   │   ├── newsletter-routes.ts
│   │   └── queue-routes.ts
│   ├── services/          # Business logic
│   │   ├── email-queue-service.ts
│   │   ├── email-worker.ts
│   │   ├── event-service.ts
│   │   └── newsletter-service.ts
│   ├── swagger/           # Swagger configuration
│   ├── templates/         # Email templates (EJS)
│   │   ├── new-blog-notification.ejs
│   │   ├── subscription-confirmation.ejs
│   │   └── unsubscribe-confirmation.ejs
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   │   ├── email.ts
│   │   ├── helper.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── response.ts
│   │   └── upload.ts
│   └── workers/           # Background workers
│       └── email-worker.ts
├── tests/                 # Test files
│   ├── auth-test.ts
│   ├── blog-test.ts
│   ├── comment-test.ts
│   ├── like-test.ts
│   ├── setup.ts
│   └── README.md
├── docker-compose.yml
├── Dockerfile
├── index.ts               # Application entry point
├── jest.config.ts
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login with email and password
- `GET /auth/google` - Start Google OAuth2 flow
- `GET /auth/google/callback` - Google OAuth2 callback
- `GET /auth/status` - Check authentication status
- `GET /logout` - Logout user
- `GET /profile` - Get user profile (requires authentication)

### Blogs

- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get a single blog
- `POST /api/blogs` - Create a blog (admin only)
- `PUT /api/blogs/:id` - Update a blog (admin only)
- `DELETE /api/blogs/:id` - Soft delete a blog (admin only)
- `DELETE /api/blogs/hard-delete` - Permanently delete a blog (admin only)

### Comments

- `POST /api/blogs/:blogId/comments` - Add a comment (user only)
- `GET /api/blogs/:blogId/comments` - Get comments for a blog

### Likes

- `POST /api/blogs/:blogId/like` - Toggle like on a blog (user only)
- `GET /api/blogs/:blogId/likes` - Get likes for a blog

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter/subscribers` - Get all subscribers (admin only)
- `GET /api/newsletter/count` - Get subscriber count

### Queue Management

- `GET /api/queue/stats` - Get email queue statistics (admin only)
- `POST /api/queue/clear` - Clear all email queues (admin only)
- `POST /api/queue/reprocess` - Reprocess dead letter queue (admin only)

## Authentication

### JWT Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Google OAuth2

Users can authenticate using their Google account. The OAuth2 flow:

1. Redirect to `/auth/google`
2. User authenticates with Google
3. Callback to `/auth/google/callback`
4. JWT token is returned

### Role-Based Access Control

Two roles are supported:

- **User**: Can create comments and like blogs
- **Admin**: Can create, update, and delete blogs

## Email System

### Email Queue

The application uses Redis as a message queue for email notifications:

- **Main Queue**: New email jobs
- **Retry Queue**: Failed emails (up to 3 retries)
- **Dead Letter Queue**: Permanently failed emails

### Email Worker

A separate worker process handles email sending:

```bash
npm run worker:email
```

### Email Templates

Three email templates are available:

- New blog notification
- Subscription confirmation
- Unsubscribe confirmation

### Email Configuration

For development, the system uses test mode (logs emails instead of sending). Configure Gmail credentials in `.env` for production use.

## Logging

The application uses Winston for logging with the following features:

- Log levels: error, warn, info, http, debug
- Daily rotating log files
- Separate log files for errors, API requests, and email queue
- Console output with colorization

Log files are stored in the `logs/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code structure
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

## License

This project is licensed under the ISC License.

## Troubleshooting

### Port Conflicts

If port 5500 is already in use:

```bash
lsof -i :5500
kill -9 <PID>
```

### Database Connection Issues

1. Check PostgreSQL is running:

```bash
pg_isready
```

2. Verify database credentials in `.env`

3. Test database connection:

```bash
node test-db-connection.js
```

### Redis Connection Issues

Check Redis is running:

```bash
redis-cli ping
```

### Docker Issues

Clean up Docker resources:

```bash
./docker-scripts.sh clean
docker system prune -a
```

## Support

For issues and questions, please open an issue on the GitHub repository.
