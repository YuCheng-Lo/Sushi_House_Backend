## Tech Stack

| Category       | Technology                       | Purpose                                                             |
| -------------- | -------------------------------- | ------------------------------------------------------------------- |
| Runtime        | Node.js                          | JavaScript runtime environment                                      |
| Language       | TypeScript                       | Static typing and code maintainability                              |
| Framework      | Express 5                        | RESTful API development                                             |
| Database       | MySQL                            | Relational database management                                      |
| ORM            | Prisma 7 + MariaDB Adapter       | Database access and schema migrations                               |
| Authentication | JWT + bcrypt                     | Token-based authentication and password hashing                     |
| Validation     | Zod                              | Request data validation                                             |
| Security       | Helmet, CORS, express-rate-limit | HTTP security headers, cross-origin configuration and rate limiting |
| File Upload    | Multer                           | Multipart file upload handling                                      |
| Image Storage  | Cloudinary                       | Cloud image storage and management                                  |
| Scheduling     | node-cron                        | Scheduled cleanup of expired sessions                               |
| Development    | tsx                              | Running TypeScript during development                               |

## Project Architecture

This project follows a layered architecture to separate HTTP request handling, business logic, and database operations.

### Directory Structure

```text
Sushi_House_Backend/
├── config/          # Environment and application configuration
├── constants/       # Shared constants
├── controllers/     # HTTP request and response handling
├── jobs/            # Scheduled background tasks
├── lib/             # Shared library and database initialization
├── middlewares/     # Authentication, validation, and error handling
├── prisma/          # Database schema and migrations
├── routes/          # API endpoint definitions
├── services/        # Business logic and database operations
├── types/           # TypeScript type definitions
├── utils/           # Reusable utility functions
├── validations/     # Request validation schemas
├── app.ts           # Express application setup
└── package.json
```

### Request Flow

```text
Client
  ↓
Routes
  ↓
Middlewares
  ↓
Controllers
  ↓
Services
  ↓
Prisma ORM
  ↓
MySQL Database
```

Each layer has a specific responsibility:

- **Routes:** Define API endpoints and attach middleware.
- **Middlewares:** Handle authentication, input validation, rate limiting, and error handling.
- **Controllers:** Process HTTP requests and return responses.
- **Services:** Implement business rules and interact with the database or external services.
- **Prisma ORM:** Manage database queries and data persistence.

## Core Features

### Authentication & Session Management

- User registration and login with bcrypt password hashing.
- JWT-based authentication using Access Tokens and Refresh Tokens.
- Refresh Token rotation with database-backed session management.
- Support for multiple independent user sessions.
- Account lockout mechanism with progressive lockout durations after failed login attempts.
- Session revocation on logout.

### Menu & Section Management

- CRUD operations for menu items and menu sections.
- Separate public and authenticated management endpoints.
- Visibility control using `ACTIVE` and `HIDDEN` statuses.
- Automatic sort order assignment for newly created sections and menu items.
- Business rule validation to prevent invalid visibility changes.
- Deletion restrictions and impact preview for menu sections.

### Image Upload & Storage

- Image uploads using Multer and Cloudinary.
- Cloud-based image storage with image URLs and public IDs.
- Authentication required for image uploads.
- Cloudinary image cleanup during menu item and section deletion.

### Security & Maintenance

- Request validation using Zod.
- HTTP security headers configured with Helmet.
- Cross-origin resource sharing configured with CORS.
- Rate limiting for authentication-related endpoints.
- Centralized error handling.
- Scheduled cleanup of expired sessions using node-cron.

## Authentication & Session Management

The authentication system uses JWT-based authentication with database-backed sessions to support multiple logins, token renewal, and session revocation.

### Token Strategy

The system uses two types of JSON Web Tokens:

| Token         | Storage / Delivery           | Purpose                                            |
| ------------- | ---------------------------- | -------------------------------------------------- |
| Access Token  | Returned in the API response | Authenticate requests to protected endpoints       |
| Refresh Token | HttpOnly Cookie              | Obtain a new Access Token without logging in again |

- Access Tokens are short-lived and validated by authentication middleware.
- Refresh Tokens are associated with individual database sessions.
- Refresh Tokens are stored as bcrypt hashes in the database.
- Refresh Token cookies use `HttpOnly`, `SameSite=Lax`, and environment-dependent `Secure` settings.

### Authentication Flow

```text
User Login
    |
    v
Validate Credentials
    |
    v
Verify Password (bcrypt)
    |
    v
Create Database Session
    |
    v
Generate Access & Refresh Tokens
    |
    +--> Return Access Token in API Response
    |
    +--> Set Refresh Token in HttpOnly Cookie
```

### Session Management

Each successful login creates an independent session in MySQL.

Session records include:

- Session ID and associated User ID
- Hashed Refresh Token
- Token expiration timestamp
- Revocation timestamp
- User Agent and IP address
- Version number for concurrent update control

This design supports multiple active sessions for the same user and allows individual sessions to be revoked.

### Token Refresh & Rotation

When a client requests a new Access Token:

1. Verify the Refresh Token's signature and expiration.
2. Retrieve the associated session from the database.
3. Check the session's user ownership, expiration, and revocation status.
4. Compare the provided Refresh Token against the stored bcrypt hash.
5. Generate new tokens and update the session's Refresh Token hash.
6. Use optimistic concurrency control with a session version number to detect conflicting updates.

The session's original expiration time is preserved during refresh operations.

### Login Protection

The system implements progressive account lockouts after consecutive failed password attempts.

| Failed Attempts | Lockout Duration   |
| --------------- | ------------------ |
| 1–4             | No account lockout |
| 5               | 5 minutes          |
| 6               | 10 minutes         |
| 7               | 20 minutes         |
| 8 or more       | 30 minutes         |

- Failed login counters are updated inside database transactions.
- MySQL `SELECT ... FOR UPDATE` is used to serialize updates to the user's failed-login state.
- A successful login resets the failure counter and lockout status.
- IP-based rate limiting provides an additional layer of protection.

### Logout & Session Cleanup

- Logging out revokes the associated database session and clears the Refresh Token cookie.
- Revoked sessions cannot be used to refresh authentication tokens.
- A scheduled job removes expired sessions from the database.
