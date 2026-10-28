# Freelance Marketplace (MERN)

A modern, high-performance freelance marketplace connecting businesses and clients with top-tier freelance professionals.

## Architecture Overview

This monorepo contains both frontend and backend applications:
- **`client/`**: React 18+ single-page application built with Vite, Tailwind CSS, React Router, Lucide React icons, React Hook Form, and Axios.
- **`server/`**: Express.js REST API with MongoDB Atlas (Mongoose), JWT authentication in HTTP-only secure cookies, Zod validation, and centralized error handling.

## Directory Structure

```
freelance-marketplace/
├── client/
│   ├── public/
│   │   ├── images/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── navigation/
│   │   │   ├── categories/
│   │   │   ├── freelancers/
│   │   │   ├── jobs/
│   │   │   └── forms/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Auth/
│   │   │   ├── Categories/
│   │   │   ├── Freelancers/
│   │   │   ├── Jobs/
│   │   │   ├── ClientDashboard/
│   │   │   ├── FreelancerDashboard/
│   │   │   └── NotFound/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

## Setup & Running Locally

### 1. Prerequisites
- Node.js >= 18
- MongoDB Atlas cluster or local MongoDB instance

### 2. Environment Configuration
- Copy `server/.env.example` to `server/.env` and update values.
- Copy `client/.env.example` to `client/.env` and update values.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Servers
```bash
# Run both client and server concurrently
npm run dev

# Or run separately:
npm run dev:client
npm run dev:server
```
