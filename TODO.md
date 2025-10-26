# Secure File-Sharing System TODO

## Project Setup
- [x] Create project directory "secure-file-sharing" with backend/ and frontend/ subdirectories
- [x] Set up backend: Express server, package.json with dependencies, basic server.js
- [x] Set up React frontend: basic structure, package.json

## Database and Models
- [x] Implement user model and database (using MongoDB for simplicity)

## Authentication & Authorization
- [x] Implement authentication: registration, login, JWT tokens
- [x] Implement MFA with TOTP using speakeasy
- [x] Implement RBAC: middleware for role checking (admin, user roles)

## Cryptography
- [x] Implement crypto utilities: AES-256 encryption/decryption
- [x] Implement RSA key generation/exchange
- [x] Implement SHA-256 hashing for integrity

## File Management
- [x] Implement file routes: upload (encrypt), download (decrypt), integrity check

## Frontend
- [x] Create React components: Login, FileList, FileUpload
- [x] Connect frontend to backend APIs

## Security & Error Handling
- [x] Add error handling and security measures (input validation, rate limiting, etc.)

## Testing & Deployment
- [x] Install backend and frontend dependencies
- [x] Start backend server (npm start)
- [x] Start frontend dev server (npm start)
- [x] Manual testing of features
- [ ] Add unit/integration tests
