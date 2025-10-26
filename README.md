# Secure File-Sharing System

A secure file-sharing application with end-to-end encryption, multi-factor authentication (MFA), and role-based access control (RBAC).

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Multi-Factor Authentication (MFA)**: TOTP-based MFA using speakeasy
- **Role-Based Access Control (RBAC)**: Admin and user roles with middleware
- **File Encryption**: AES-256 encryption for uploaded files
- **RSA Key Exchange**: Secure key exchange for encryption
- **File Integrity**: SHA-256 hashing for integrity checks
- **Security Measures**: Helmet for security headers, rate limiting, CORS

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Bootstrap
- **Security**: bcryptjs, crypto-js, node-forge, speakeasy, jsonwebtoken

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd secure-file-sharing
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up MongoDB:
   - Install MongoDB locally or use a cloud service like MongoDB Atlas
   - Update the connection string in `backend/server.js` if needed

5. Configure environment variables (optional):
   - Create a `.env` file in the backend directory
   - Add variables like `PORT`, `JWT_SECRET`, etc.

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   The server will run on http://localhost:5000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   The app will be available at http://localhost:3000

## Building for Production

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The production build will be in `frontend/build/`

3. For deployment, you can serve the built frontend and run the backend on a server.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/verify-mfa` - Verify MFA token

### Files
- `POST /api/files/upload` - Upload encrypted file
- `GET /api/files/list` - List user's files
- `GET /api/files/download/:id` - Download and decrypt file

## Security Features

- **Encryption**: Files are encrypted using AES-256 before storage
- **Authentication**: JWT-based authentication with MFA support
- **Authorization**: RBAC with admin and user roles
- **Rate Limiting**: Prevents brute force attacks
- **Security Headers**: Helmet.js for secure HTTP headers
- **Input Validation**: Server-side validation for all inputs

## Testing

Run tests for the backend:
```bash
cd backend
npm test
```

Run tests for the frontend:
```bash
cd frontend
npm test
```

## Deployment

1. Set up a production MongoDB instance
2. Build the frontend for production
3. Deploy the backend to a server (e.g., Heroku, AWS, DigitalOcean)
4. Serve the built frontend from the backend or a CDN

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
