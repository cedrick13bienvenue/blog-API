# Integration Testing Guide

## Overview

This testing suite provides comprehensive integration tests for the Blog API, covering authentication, authorization, CRUD operations, and error handling.

## Test Structure

### Files

- `setup.ts` - Test configuration and database setup
- `auth-test.ts` - Authentication tests (login, register, OAuth2)
- `blog-test.ts` - Blog CRUD operations tests
- `comment-test.ts` - Comment functionality tests
- `like-test.ts` - Like/unlike functionality tests

### Test Categories

#### 1. Authentication Tests (`auth-test.ts`)

- **User Registration**: Valid/invalid registration, duplicate emails
- **User Login**: Valid credentials, wrong password, non-existent user
- **Authentication Status**: Check if user is authenticated
- **Logout**: Session termination
- **Database Error Handling**: Mock database failures

#### 2. Blog Tests (`blog-test.ts`)

- **Create Blog**: Admin-only creation, authentication required
- **Get All Blogs**: Public access, error handling
- **Get Single Blog**: By ID, non-existent blogs
- **Update Blog**: Admin-only updates, authorization
- **Delete Blog**: Soft delete, hard delete, authorization
- **Database Error Handling**: Mock failures

#### 3. Comment Tests (`comment-test.ts`)

- **Create Comment**: User authentication required
- **Get Comments**: For specific blog, empty comments
- **Authorization**: User-only access
- **Database Error Handling**: Mock failures

#### 4. Like Tests (`like-test.ts`)

- **Toggle Like**: Like/unlike functionality
- **Get Likes**: For specific blog
- **Authentication**: Required for liking
- **Database Error Handling**: Mock failures

## Test Database Configuration

### Environment Variables

```env
TEST_USERNAME=postgres
TEST_PASSWORD=cedrique13
TEST_DATABASE=blogAPI-Test
TEST_HOST=localhost
TEST_PORT=5433
TEST_SERVER_PORT=5501
```

### Database Setup

1. Create a separate test database
2. Tests automatically sync models
3. Database is cleared before each test
4. Connection is closed after all tests

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Test Execution Flow

1. **Before All**: Connect to test database, sync models
2. **Before Each**: Clear database tables
3. **Test Execution**: Run individual test cases
4. **After Each**: Clear Jest mocks
5. **After All**: Close database connection

## Test Coverage

### What's Tested

- ✅ **Authentication**: Login, register, logout, OAuth2
- ✅ **Authorization**: Role-based access control
- ✅ **CRUD Operations**: Create, read, update, delete
- ✅ **Error Handling**: Invalid data, database errors
- ✅ **JWT Tokens**: Token generation and verification
- ✅ **File Upload**: Image upload for blogs
- ✅ **Database Operations**: Sequelize model interactions

### Coverage Areas

- **Controllers**: All CRUD operations
- **Middleware**: Authentication, authorization
- **Routes**: All API endpoints
- **Models**: Database interactions
- **Error Handling**: Graceful failure responses

## Test Data Management

### Test Users

- **Admin User**: Can create/update/delete blogs
- **Regular User**: Can create comments and like blogs
- **Unauthenticated**: Limited access

### Test Data

- Blogs with various content types
- Comments with different authors
- Likes from multiple users
- Invalid data for error testing

## Mocking Strategy

### Database Mocks

```typescript
jest.spyOn(Model, "method").mockRejectedValue(new Error("Database error"));
```

### Authentication Mocks

- JWT token verification
- Session-based authentication
- Role-based authorization

## Best Practices

### Test Organization

1. **Describe blocks** for feature grouping
2. **It blocks** for individual test cases
3. **BeforeEach** for test setup
4. **AfterEach** for cleanup

### Assertions

- **Status codes**: HTTP response codes
- **Response structure**: Success/error messages
- **Data validation**: Expected data format
- **Authorization**: Role-based access

### Error Testing

- **Invalid data**: Malformed requests
- **Authentication**: Missing/invalid tokens
- **Authorization**: Insufficient permissions
- **Database errors**: Connection failures

## Continuous Integration

### GitHub Actions (Optional)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Check PostgreSQL service
2. **Test Database**: Ensure test database exists
3. **Environment Variables**: Verify .env configuration
4. **Port Conflicts**: Use different port for test server

### Debug Mode

```bash
# Run single test file
npm test -- auth-test.ts

# Run specific test
npm test -- --testNamePattern="should login successfully"
```

## Coverage Reports

### HTML Coverage

- Generated in `coverage/` directory
- Open `coverage/lcov-report/index.html`
- View detailed coverage metrics

### Coverage Thresholds

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

## Future Enhancements

### Planned Tests

- [ ] **OAuth2 Integration**: Google login flow
- [ ] **File Upload**: Image upload testing
- [ ] **Rate Limiting**: API rate limit tests
- [ ] **Performance**: Load testing
- [ ] **Security**: Penetration testing

### Test Utilities

- [ ] **Test Factories**: Generate test data
- [ ] **Custom Matchers**: Custom Jest matchers
- [ ] **Test Helpers**: Reusable test utilities
- [ ] **API Documentation**: Auto-generate from tests
