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
