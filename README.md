# SecureShare - Secure File-Sharing System

A secure file-sharing application built with Node.js backend and vanilla HTML/CSS/JavaScript frontend, demonstrating practical implementation of cryptographic principles and secure coding practices.

## Features

- **End-to-End Encryption**: AES-256 encryption for file storage
- **RSA Key Exchange**: Secure key exchange mechanisms
- **Multi-Factor Authentication (MFA)**: TOTP-based two-factor authentication
- **Role-Based Access Control (RBAC)**: Admin and user roles
- **File Integrity**: SHA-256 hashing for integrity verification
- **Secure API**: JWT authentication with rate limiting and security headers

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Security**: AES, RSA, JWT, TOTP, bcrypt
- **Deployment**: Docker, Docker Compose, Nginx

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/elmalika2001/secure_file_app_project.git
   cd secure_file_app_project
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost/api

## Manual Installation

1. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (make sure it's running on localhost:27017)

4. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

5. **Start the frontend**
   ```bash
   cd frontend
   python -m http.server 8000
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secureshare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/setup-mfa` - Setup MFA
- `POST /api/auth/verify-mfa` - Verify MFA code

### Files
- `POST /api/files/upload` - Upload encrypted file
- `GET /api/files` - List user files
- `GET /api/files/:id/download` - Download decrypted file
- `DELETE /api/files/:id` - Delete file

### Contact
- `POST /api/contact` - Send contact message

### About
- `GET /api/about` - Get project information

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers
- File encryption at rest
- Integrity verification with SHA-256

## Project Structure

```
secure-file-sharing/
├── backend/                 # Node.js backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads directory
│   └── server.js           # Main server file
├── frontend/               # Static frontend files
│   ├── index.html          # Home page
│   ├── contact.html        # Contact page
│   ├── about.html          # About page
│   ├── styles.css          # Styles
│   └── script.js           # Frontend logic
├── .env.example           # Environment variables template
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker build configuration
├── nginx.conf            # Nginx configuration
└── README.md             # This file
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT implementation
- **speakeasy** - TOTP MFA
- **crypto-js** - Cryptographic functions
- **multer** - File upload handling

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome** - Icons

## Academic Context

This project was developed as a graduation project (مشروع تخرج) for the Cybersecurity program at Central Lancashire University. It demonstrates the practical application of theoretical concepts learned during the course, including:

- Cryptographic algorithms (AES, RSA, SHA-256)
- Secure authentication mechanisms
- Secure software development practices
- Web security principles

## Usage

1. **Registration**: Create a new account
2. **Login**: Authenticate with email/password
3. **MFA Setup** (optional): Enable two-factor authentication
4. **File Upload**: Select encryption method and upload files
5. **File Management**: View, download, or delete your files
6. **Contact**: Send messages through the contact form

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is for educational purposes as part of an academic graduation project.

## Author

[Your Name] - Cybersecurity Student at Central Lancashire University
