# Support App Backend

Backend part of the user support application built with Node.js, Express, and MongoDB.

## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Main Features](#main-features)
- [API Endpoints](#api-endpoints)
- [File Upload](#file-upload)
- [Authorization and Roles](#authorization-and-roles)
- [Error Handling](#error-handling)
- [License](#license)

## Description

REST API for managing users, contacts, and support services. Features registration, authentication, role-based authorization, avatar upload, protected routes, and admin functions.

## Technologies

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- Multer (file upload)
- Joi (validation)
- CORS
- dotenv

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/support-app-backend.git
   cd support-app-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and set environment variables (see below).

4. Start the server:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

## Environment Variables

Example `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/support-app
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Project Structure

```
/models         - Mongoose models (User, Contact, etc.)
/controllers    - Request handling logic
/routes         - API route definitions
/middleware     - Middlewares (auth, upload, etc.)
/uploads        - Folder for uploaded files (avatars)
/config         - Database connection configuration
/utils          - Utility helpers (e.g., CustomError)
server.js       - Entry point
```

## Main Features

- User registration and login (JWT)
- User roles: user, admin, business, personal
- Get and update user profile
- Avatar upload and storage (locally, link stored in DB)
- Get user list (admin only)
- Delete users (admin only)
- Manage contacts and support services

## API Endpoints

- `POST /api/auth/register` — register
- `POST /api/auth/login` — login
- `GET /api/user/profile` — get profile (auth required)
- `PUT /api/user/profile` — update profile, upload avatar
- `GET /api/user/` — get user list (admin)
- `DELETE /api/user/:id` — delete user (admin)
- `GET /api/user/me` — get current user
- `GET /api/contact` — get contacts
- `GET /api/services` — get services

## File Upload

- To upload an avatar, use `multipart/form-data` with the `avatar` field.
- Files are saved to the `/uploads` folder, and the file link is stored in the user's `avatar` field.

## Authorization and Roles

- JWT token is required for protected routes.
- Use the header `Authorization: Bearer <token>`.
- Some routes are only available for specific roles (e.g., admin).

## Error Handling

- All errors are handled centrally via middleware.
- The response contains an object with a `message` field.

## License

MIT License
