# Chirpy 🐦

Chirpy is a RESTful backend API built with **TypeScript** as part of the [Boot.dev](https://www.boot.dev/) backend development curriculum.

The project is a Twitter-like service where users can register, authenticate, create chirps, and manage their accounts. It also includes authentication middleware, database migrations, error handling, API metrics, and automated tests.

## 🚀 Features

- User registration and management
- User authentication
- Password hashing with Argon2
- JWT-based authentication
- Refresh token support
- Create chirps
- Retrieve chirps
- Delete chirps
- PostgreSQL database integration
- Database migrations with Drizzle
- Authentication middleware
- Centralized error handling
- API metrics
- Readiness and health endpoints
- Automated tests

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT
- **Password Hashing:** Argon2
- **Package Manager:** npm
- **Testing:** Vitest
- **Database Migrations:** Drizzle Kit

## 📁 Project Structure

```text
chirpy/
│
├── drizzle/
│   ├── meta/
│   ├── 0000_young_golden_guardian.sql
│   └── 0001_daily_giant_man.sql
│
├── src/
│   │
│   ├── api/
│   │   ├── chirps.ts
│   │   ├── metrics.ts
│   │   ├── readiness.ts
│   │   ├── reset.ts
│   │   └── users.ts
│   │
│   ├── app/
│   │   └── assets/
│   │       ├── logo.png
│   │       └── index.html
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── meta/
│   │   │   ├── 0000_sticky_king_cobra.sql
│   │   │   ├── 0001_mean_trauma.sql
│   │   │   ├── 0002_foamy_odin.sql
│   │   │   └── 0003_aromatic_deadpool.sql
│   │   │
│   │   ├── queries/
│   │   │   ├── chirpsdb.ts
│   │   │   ├── refresh.ts
│   │   │   └── users.ts
│   │   │
│   │   ├── index.ts
│   │   └── schema.ts
│   │
│   ├── errors/
│   │   └── index.ts
│   │
│   ├── lib/
│   │   └── auth.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   │
│   ├── tests/
│   │   └── auth.test.ts
│   │
│   ├── config.ts
│   └── index.ts
│
├── .gitignore
├── drizzle.config.ts
├── package.json
├── package-lock.json
├── server.log
├── tsconfig.json
└── README.md
```

## 🏗️ Architecture

The application is organized into several layers to keep the codebase modular and maintainable.

### API

The `src/api` directory contains the HTTP route handlers.

```text
src/api/
├── chirps.ts
├── metrics.ts
├── readiness.ts
├── reset.ts
└── users.ts
```

These modules handle requests related to users, chirps, authentication, server metrics, and administrative endpoints.

### Database

Database-related functionality lives under `src/db`.

```text
src/db/
├── migrations/
├── queries/
├── index.ts
└── schema.ts
```

The project uses **Drizzle ORM** to interact with PostgreSQL.

Database queries are separated into dedicated modules:

```text
src/db/queries/
├── chirpsdb.ts
├── refresh.ts
└── users.ts
```

### Middleware

Reusable HTTP middleware is located in:

```text
src/middleware/
├── auth.ts
└── errorHandler.ts
```

The authentication middleware protects routes that require an authenticated user, while the error handler provides centralized API error handling.

### Authentication

Authentication-related utilities are located in:

```text
src/lib/auth.ts
```

The project uses JWTs for authentication and Argon2 for securely hashing passwords.

### Tests

Tests are located under:

```text
src/tests/
└── auth.test.ts
```

Testing helps verify authentication functionality and prevent regressions.

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd chirpy
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the root directory.

Example:

```env
DATABASE_URL=postgres://username:password@localhost:5432/chirpy
JWT_SECRET=your-secret-key
POLKA_KEY=your-polka-key
```

> **Important:** Never commit real secrets to Git. Make sure `.env` is included in `.gitignore`.

## 4. Run database migrations

Generate migrations when the database schema changes:

```bash
npx drizzle-kit generate
```

Apply migrations:

```bash
npx drizzle-kit migrate
```

## 5. Start the server

```bash
npm run dev
```

The server will start on the configured port.

---

# 🔌 API Endpoints

## Health Check

```http
GET /api/healthz
```

Checks whether the API server is running.

## Readiness

```http
GET /api/ready
```

Checks whether the application is ready to accept requests.

---

## 👤 Users

### Create User

```http
POST /api/users
```

Creates a new user account.

Example request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/login
```

Authenticates a user and returns authentication tokens.

### Update User

```http
PUT /api/users
Authorization: Bearer <access-token>
```

Updates information for the authenticated user.

---

## 🐦 Chirps

### Create Chirp

```http
POST /api/chirps
Authorization: Bearer <access-token>
```

Creates a new chirp.

Example:

```json
{
  "body": "Hello from Chirpy!"
}
```

### Get Chirps

```http
GET /api/chirps
```

Returns chirps stored in the database.

### Get Chirp

```http
GET /api/chirps/:chirpID
```

Returns a specific chirp.

### Delete Chirp

```http
DELETE /api/chirps/:chirpID
Authorization: Bearer <access-token>
```

Deletes a chirp owned by the authenticated user.

---

# 🔐 Authentication

Chirpy uses **JWT access tokens** to authenticate users.

Protected endpoints require an `Authorization` header:

```http
Authorization: Bearer <access-token>
```

The authentication flow can be summarized as:

```text
User
 │
 │ Login
 ▼
Chirpy API
 │
 │ Validate credentials
 ▼
JWT Access Token
 │
 │ Authorization: Bearer ...
 ▼
Protected API Endpoint
```

Refresh tokens are used to obtain new access tokens without requiring the user to log in again.

Passwords are hashed using **Argon2** before being stored in the database.

---

# 🗄️ Database

Chirpy uses **PostgreSQL** as its database and **Drizzle ORM** for database access.

The database schema is defined in:

```text
src/db/schema.ts
```

Database queries are organized in:

```text
src/db/queries/
```

Database migrations are stored in:

```text
src/db/migrations/
```

Drizzle Kit is used to generate and apply database schema migrations.

---

# 📊 Metrics

The project includes an API metrics endpoint:

```http
GET /admin/metrics
```

This provides information about server usage and request statistics.

There is also a reset endpoint used for administrative purposes:

```http
POST /admin/reset
```

---

# 🧪 Testing

Run the test suite with:

```bash
npm test
```

If a test watch script is configured, you can also use:

```bash
npm run test:watch
```

---

# 📜 Common Commands

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Generate database migrations:

```bash
npx drizzle-kit generate
```

Apply database migrations:

```bash
npx drizzle-kit migrate
```

---

# 📚 What I Learned

Building Chirpy provided practical experience with:

- TypeScript backend development
- Node.js
- REST API design
- HTTP methods and status codes
- PostgreSQL
- Drizzle ORM
- Database schema design
- Database migrations
- JWT authentication
- Refresh tokens
- Argon2 password hashing
- Authentication middleware
- Error-handling middleware
- API metrics
- Automated testing
- Environment configuration
- Backend project structure

---

# 🎯 About the Project

Chirpy was built as a hands-on project while following the **Boot.dev Backend Developer curriculum**.

The project focuses on learning backend development by progressively building a real-world API rather than relying solely on theoretical examples.

---

# 🙏 Credits

Built as part of the **Boot.dev** backend development curriculum.

- [Boot.dev](https://www.boot.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)

---

# 📝 License

This project is intended primarily for educational purposes as part of the Boot.dev curriculum.
