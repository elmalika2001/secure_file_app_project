# SecureShare - Secure File-Sharing System

A secure file-sharing application built with Node.js backend and vanilla HTML/CSS/JavaScript frontend, demonstrating practical implementation of cryptographic principles and secure coding practices.

## Features

- **End-to-End Encryption**: AES-256 encryption for file storage
- **RSA Key Exchange**: Secure key exchange mechanisms
- **Multi-Factor Authentication (MFA)**: TOTP-based two-factor authentication
- **Role-Based Access Control (RBAC)**: Admin and user roles
- **File Integrity**: SHA-256 hashing for integrity verification
- **Secure API**: JWT authentication with rate limiting and security headers

## Project Structure

```
secure-file-sharing/
├── frontend/
│   ├── index.html          # Home page with file upload
│   ├── contact.html        # Contact page with form
│   ├── about.html          # About page
│   ├── script.js           # Frontend JavaScript
│   └── styles.css          # CSS styles
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── files.js        # File management routes
│   │   ├── contact.js      # Contact form routes
│   │   └── about.js        # About page routes
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   ├── contactController.js
│   │   └── aboutController.js
│   ├── models/             # MongoDB models
│   │   ├── user.js
│   │   ├── file.js
│   │   └── message.js
│   └── utils/              # Utility functions
│       ├── crypto.js       # Cryptographic utilities
│       └── db.js           # Database connection
├── uploads/                # File upload directory
│   └── encrypted/          # Encrypted files storage
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-file-sharing
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/secureshare
   JWT_SECRET=your-secret-key
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Start the frontend**
   Open `frontend/index.html` in your browser or use a local server:
   ```bash
   cd frontend
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/setup-mfa` - Setup MFA
- `GET /api/auth/profile` - Get user profile

### File Management
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get user's files
- `GET /api/files/download/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### Contact & About
- `POST /api/contact` - Send contact message
- `GET /api/about` - Get about information

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin resource sharing controls
- **Helmet Security Headers**: Security headers middleware

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
