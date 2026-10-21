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
