# WorkBridge API Backend Server

Production-ready Node.js, Express, and MongoDB backend for the WorkBridge Freelance Marketplace.

---

## Architecture Overview

```
server/
├── .env.example              # Template environment variables
├── .env                      # Local development environment (ignored by git)
├── package.json              # Backend scripts and dependencies
├── tests/
│   └── api.test.js           # Automated integration test suite (node:test + supertest)
└── src/
    ├── app.js                # Express app configuration & middleware pipeline
    ├── server.js             # HTTP server entrypoint & graceful shutdown
    ├── config/
    │   ├── db.js             # Mongoose connection & health telemetry
    │   └── env.js            # Zod-validated environment configuration
    ├── constants/
    │   ├── categories.js     # Shared category taxonomy
    │   └── roles.js          # Shared user roles (client, freelancer, admin)
    ├── controllers/
    │   └── healthController.js # Health status & diagnostics controller
    ├── middleware/
    │   ├── auth.js           # JWT authentication & role authorization
    │   ├── errorHandler.js   # Centralized error handler
    │   ├── notFoundHandler.js# 404 route handler
    │   ├── rateLimiter.js    # express-rate-limit security limiters
    │   └── validate.js       # Zod schema request validation middleware
    ├── models/
    │   ├── index.js          # Unified model exports
    │   ├── User.js           # User credentials, roles, and bcrypt hashing
    │   ├── FreelancerProfile.js # Skills, hourly rate, portfolio, and ratings
    │   ├── Job.js            # Job postings, budget ranges, and skills
    │   ├── Proposal.js       # Bid submissions, cover letters, and statuses
    │   └── Project.js        # Contracts, milestone escrow, and deliverables
    ├── routes/
    │   ├── api.js            # Versioned route router (/api/v1)
    │   ├── categoryRoutes.js # Category data routes
    │   └── healthRoutes.js   # Service health check routes
    ├── services/             # Domain business logic layer
    ├── utils/
    │   ├── apiResponse.js    # Standardized JSON response envelope
    │   └── appError.js       # Operational error class
    └── validators/
        └── authValidators.js # Zod schemas for auth request validation
```

---

## Standard JSON API Response Formats

### 1. Success Response
```json
{
  "success": true,
  "message": "WorkBridge API service is healthy",
  "data": {
    "status": "online",
    "environment": "development",
    "timestamp": "2026-10-20T17:01:46.686Z",
    "uptime": "0h 15m 32s",
    "uptimeSeconds": 932,
    "memory": {
      "rssMB": "75.36",
      "heapUsedMB": "20.22",
      "heapTotalMB": "22.39"
    },
    "database": {
      "status": "connected",
      "readyState": 1,
      "host": "127.0.0.1",
      "name": "freelance_marketplace"
    }
  }
}
```

### 2. Error Response
```json
{
  "success": false,
  "message": "Request validation failed",
  "errors": [
    { "field": "body.name", "message": "Name must be at least 2 characters long" },
    { "field": "body.email", "message": "Please enter a valid email address" },
    { "field": "body.password", "message": "Password must be at least 8 characters long" },
    { "field": "body.role", "message": "Role must be either client or freelancer" }
  ]
}
```

---

## Setting up MongoDB Atlas (Step-by-Step)

Follow these steps to configure a free cloud MongoDB Atlas cluster:

### Step 1: Create Account & Project
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account or log in.
2. Create a new organization or project named `WorkBridge`.

### Step 2: Deploy a Free M0 Cluster
1. Click **Create** or **Build a Database**.
2. Select the **M0 Free** shared tier.
3. Choose a cloud provider (AWS, GCP, or Azure) and select a region close to your target users (e.g., `us-east-1` or `eu-west-1`).
4. Click **Create Cluster** (takes ~1-3 minutes to provision).

### Step 3: Configure Database Access (User & Password)
1. In the left navigation, go to **Security > Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a Username (e.g., `workbridge_admin`) and a secure Password.
5. Under Database User Privileges, select **Read and write to any database**.
6. Click **Add User**.

### Step 4: Configure Network Access (IP Whitelist)
1. In the left navigation, go to **Security > Network Access**.
2. Click **Add IP Address**.
3. For local development, click **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current public IP address.
4. Click **Confirm**.

### Step 5: Obtain Connection String
1. Go to **Deployment > Database**.
2. Click the **Connect** button next to your cluster.
3. Choose **Drivers** (Node.js).
4. Copy the connection string format:
   ```
   mongodb+srv://workbridge_admin:<password>@cluster0.abcde.mongodb.net/freelance_marketplace?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you created in Step 3.
6. Replace the database name (before `?`) with `freelance_marketplace`.

### Step 6: Configure Environment
Add the connection string to `server/.env`:
```env
MONGODB_URI=mongodb+srv://workbridge_admin:your_secure_password@cluster0.abcde.mongodb.net/freelance_marketplace?retryWrites=true&w=majority
```

---

## Local Development & Testing

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Starts with `nodemon` and auto-reloads on file changes.

### 3. Run Automated Tests
```bash
npm test
```
Executes all integration tests using Node's native test runner and `supertest`:
- Health check endpoints (`/api/health`, `/api/v1/health`)
- 404 handler
- Zod request validation
- CORS and security headers

### 4. Production Run
```bash
npm start
```
Runs `node src/server.js` with production logging and performance optimizations.
