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

## API Documentation

The backend provides RESTful APIs for authentication, menu section management, menu item management, and image uploads.

**Base URL (Local Development)**

```text
http://localhost:3000
```

### Authentication

| Method | Endpoint         | Description                                     | Authentication       |
| ------ | ---------------- | ----------------------------------------------- | -------------------- |
| POST   | `/auth/register` | Register a new user                             | No                   |
| POST   | `/auth/login`    | Authenticate user and create a session          | No                   |
| GET    | `/auth/me`       | Get the authenticated user's information        | Bearer Token         |
| POST   | `/auth/refresh`  | Refresh authentication tokens                   | Refresh Token Cookie |
| POST   | `/auth/logout`   | Revoke the current session and clear the cookie | Refresh Token Cookie |

### Menu Sections

| Method | Endpoint                        | Description                                           | Authentication |
| ------ | ------------------------------- | ----------------------------------------------------- | -------------- |
| GET    | `/sections`                     | Retrieve publicly visible sections                    | No             |
| GET    | `/sections/admin`               | Retrieve sections for management                      | Bearer Token   |
| POST   | `/sections`                     | Create a new section                                  | Bearer Token   |
| PATCH  | `/sections/:id`                 | Update a section                                      | Bearer Token   |
| GET    | `/sections/:id/deletion-impact` | Preview affected menu items before deleting a section | Bearer Token   |
| DELETE | `/sections/:id`                 | Delete a section                                      | Bearer Token   |

### Menu Items

| Method | Endpoint            | Description                          | Authentication |
| ------ | ------------------- | ------------------------------------ | -------------- |
| GET    | `/menu-items`       | Retrieve publicly visible menu items | No             |
| GET    | `/menu-items/admin` | Retrieve menu items for management   | Bearer Token   |
| POST   | `/menu-items`       | Create a new menu item               | Bearer Token   |
| PATCH  | `/menu-items/:id`   | Update a menu item                   | Bearer Token   |
| DELETE | `/menu-items/:id`   | Delete a menu item                   | Bearer Token   |

### Image Upload

| Method | Endpoint        | Description                   | Authentication |
| ------ | --------------- | ----------------------------- | -------------- |
| POST   | `/image/upload` | Upload an image to Cloudinary | Bearer Token   |

**Upload Requirements**

- Content-Type: `multipart/form-data`
- File field name: `image`
- A valid Access Token must be provided in the Authorization header.

### Authentication Headers

Protected endpoints require an Access Token in the following format:

```http
Authorization: Bearer <access_token>
```

The Refresh Token is transmitted through an HttpOnly Cookie named `refreshToken`, rather than an Authorization header.

### Request Validation

The API uses Zod schemas to validate supported request bodies and route parameters.

Invalid requests are handled through the application's centralized error-handling middleware.

### API Response Status Codes

| Status Code               | Description                                     |
| ------------------------- | ----------------------------------------------- |
| 200 OK                    | Successful request                              |
| 201 Created               | Resource successfully created                   |
| 400 Bad Request           | Invalid request data or business rule violation |
| 401 Unauthorized          | Missing, expired, or invalid authentication     |
| 404 Not Found             | Requested resource does not exist               |
| 409 Conflict              | Conflicting resource or operation               |
| 429 Too Many Requests     | Rate limit exceeded                             |
| 500 Internal Server Error | Unexpected server error                         |

_The exact response status depends on the endpoint and the corresponding service logic._

## Database Schema

The application uses MySQL as its relational database, with Prisma ORM for schema management, migrations, and database operations.

The database consists of four main models: `User`, `Session`, `Section`, and `MenuItem`.

### Data Relationships

```text
User (1) ─────────── (N) Session
  │                       │
  └─ One user can have multiple sessions

Section (1) ──────── (N) MenuItem
  │                       │
  └─ One section can contain multiple menu items
```

### User

Stores user account information and login security state.

| Field                 | Type      | Description                    |
| --------------------- | --------- | ------------------------------ |
| id                    | Int       | Primary key, auto-increment    |
| name                  | String    | User's name                    |
| nickname              | String?   | Optional nickname              |
| email                 | String    | Unique email address           |
| password              | String    | bcrypt-hashed password         |
| failed_login_attempts | Int       | Consecutive failed login count |
| locked_until          | DateTime? | Account lockout expiration     |
| created_at            | DateTime  | Account creation timestamp     |

**Constraints:** Unique constraint on `email`.

### Session

Manages authenticated sessions and Refresh Token lifecycle.

| Field              | Type      | Description                       |
| ------------------ | --------- | --------------------------------- |
| id                 | String    | Primary key, generated using CUID |
| user_id            | Int       | Foreign key referencing User      |
| refresh_token_hash | String    | Hashed Refresh Token              |
| user_agent         | String?   | Client User Agent                 |
| ip_address         | String?   | Client IP address                 |
| expires_at         | DateTime  | Session expiration timestamp      |
| revoked_at         | DateTime? | Session revocation timestamp      |
| version            | Int       | Optimistic concurrency control    |
| created_at         | DateTime  | Session creation timestamp        |
| updated_at         | DateTime  | Last update timestamp             |

**Indexes:** `user_id`, `expires_at`.

**Relationship:** Multiple sessions can belong to one user.

### Section

Represents a menu category used to organize menu items.

| Field     | Type          | Description                           |
| --------- | ------------- | ------------------------------------- |
| id        | Int           | Primary key, auto-increment           |
| name      | String        | Section name                          |
| sortOrder | Int           | Display ordering                      |
| status    | SectionStatus | Visibility status, defaults to HIDDEN |

**Status Values:** `ACTIVE`, `HIDDEN`.

**Relationship:** One section can contain multiple menu items.

### MenuItem

Stores individual menu items, pricing information, and image references.

| Field         | Type           | Description                           |
| ------------- | -------------- | ------------------------------------- |
| id            | Int            | Primary key, auto-increment           |
| sectionId     | Int            | Foreign key referencing Section       |
| name          | String         | Menu item name                        |
| price         | Int            | Non-negative integer price            |
| unit          | String?        | Optional unit                         |
| option        | String?        | Optional item option                  |
| description   | String?        | Optional description                  |
| imageUrl      | String?        | Cloudinary image URL                  |
| imagePublicId | String?        | Cloudinary public ID                  |
| status        | MenuItemStatus | Visibility status, defaults to HIDDEN |
| sortOrder     | Int            | Display ordering                      |
| createdAt     | DateTime       | Creation timestamp                    |
| updatedAt     | DateTime       | Last update timestamp                 |

**Index:** Composite index on `(sectionId, sortOrder)`.

**Status Values:** `ACTIVE`, `HIDDEN`.

### Referential Integrity

The database defines foreign key relationships with cascading deletion:

- **User → Session:** Deleting a user automatically deletes their associated session records.
- **Section → MenuItem:** Deleting a section automatically deletes its associated menu item records.

These relationships are enforced at the database level through foreign key constraints.

Application-level business rules provide additional validation before certain operations, such as restricting invalid visibility changes and previewing the impact of section deletion.

### Database Indexes

Indexes are defined to support common data access patterns:

| Model    | Indexed Field(s)         | Purpose                                                     |
| -------- | ------------------------ | ----------------------------------------------------------- |
| User     | `email` (Unique)         | Enforce email uniqueness and support account lookup         |
| Session  | `user_id`                | Support user-session queries                                |
| Session  | `expires_at`             | Support expired-session cleanup                             |
| MenuItem | `sectionId`, `sortOrder` | Support retrieving and ordering menu items within a section |

Database schema changes are managed using Prisma Migrate.
