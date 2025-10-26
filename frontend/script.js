// Global variables
let currentUser = null;
let userToken = null;
let mfaRequired = false;
let mfaSecret = null;
let currentPage = 'home';

// DOM elements
const authSection = document.getElementById('auth-section');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const mfaSetup = document.getElementById('mfa-setup');
const dashboard = document.getElementById('dashboard');
const messageDiv = document.getElementById('message');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
    showPage('home');
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            showPage(page);
        });
    });

    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // MFA
    document.getElementById('mfa-confirm').addEventListener('click', handleMFAConfirm);

    // Dashboard
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // File upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
}

// Tab switching
function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const mfaToken = document.getElementById('mfa-token').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, mfaToken: mfaToken || undefined }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.mfaRequired) {
                mfaRequired = true;
                document.getElementById('mfa-group').style.display = 'block';
                showMessage('MFA token required', 'info');
            } else {
                userToken = data.token;
                currentUser = data.user;
                localStorage.setItem('token', userToken);
                showDashboard();
                showMessage('Login successful!', 'success');
            }
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            switchTab('login');
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// MFA functions
async function handleMFAConfirm() {
    try {
        const response = await fetch('/api/auth/setup-mfa', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            mfaSecret = data.secret;
            const qrCodeDiv = document.getElementById('qr-code');
            qrCodeDiv.innerHTML = '';
            QRCode.toCanvas(qrCodeDiv, data.qrCodeUrl, { width: 200, height: 200 }, function(error) {
                if (error) console.error(error);
            });
            mfaSetup.style.display = 'block';
        } else {
            showMessage(data.message || 'MFA setup failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

async function handleFiles(files) {
    for (let file of files) {
        await uploadFile(file);
    }
}

async function uploadFile(file) {
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Encrypting file...';

    try {
        // Generate AES key
        const aesKey = await generateAESKey();

        // Read file
        const fileBuffer = await file.arrayBuffer();

        // Encrypt file
        progressText.textContent = 'Encrypting file...';
        const encryptedData = await encryptFile(fileBuffer, aesKey);

        // Generate hash
        const hash = await generateHash(fileBuffer);

        // Encrypt AES key with RSA
        const encryptedAESKey = await encryptWithRSA(aesKey, currentUser.publicKey);

        progressText.textContent = 'Uploading...';

        const formData = new FormData();
        formData.append('file', new Blob([encryptedData]), file.name);
        formData.append('originalName', file.name);
        formData.append('size', file.size);
        formData.append('mimetype', file.type);
        formData.append('hash', hash);
        formData.append('encryptionKey', encryptedAESKey);

        const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            progressFill.style.width = '100%';
            progressText.textContent = 'Upload complete!';
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                loadFiles();
            }, 1000);
            showMessage('File uploaded successfully!', 'success');
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        uploadProgress.style.display = 'none';
        showMessage(error.message, 'error');
    }
}

// Crypto functions (simplified for client-side)
async function generateAESKey() {
    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function encryptFile(buffer, key) {
    const keyData = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        buffer
    );

    return new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
}

async function generateHash(buffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

async function encryptWithRSA(data, publicKeyPem) {
    // This would need server-side implementation for full RSA
    // For now, return the data as-is (server will handle RSA)
    return data;
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(`${pageName}-page`).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    currentPage = pageName;

    // Special handling for app page
    if (pageName === 'app') {
        if (!isAuthenticated()) {
            // Show auth section if not logged in
            authSection.style.display = 'block';
            mfaSetup.style.display = 'none';
            dashboard.style.display = 'none';
        } else {
            // Show dashboard if logged in
            authSection.style.display = 'none';
            mfaSetup.style.display = 'none';
            dashboard.style.display = 'block';
            loadFiles();
        }
    }
}

// Dashboard functions
function showDashboard() {
    if (currentPage === 'app') {
        authSection.style.display = 'none';
        mfaSetup.style.display = 'none';
        dashboard.style.display = 'block';
        loadFiles();
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    userToken = null;
    if (currentPage === 'app') {
        dashboard.style.display = 'none';
        authSection.style.display = 'block';
    }
    showMessage('Logged out successfully', 'info');
}

async function loadFiles() {
    try {
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
        });

        const files = await response.json();

        if (response.ok) {
            displayFiles(files);
        } else {
            showMessage('Failed to load files', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

function displayFiles(files) {
    const fileList = document.getElementById('file-list');

    if (files.length === 0) {
        fileList.innerHTML = '<p class="empty">No files uploaded yet.</p>';
        return;
    }

    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas ${getFileIcon(file.filename)} file-icon"></i>
                <div class="file-details">
                    <h4>${file.filename}</h4>
                    <p>${formatFileSize(file.size)} • Uploaded ${formatDate(file.uploadedAt)}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-primary btn-sm" onclick="downloadFile('${file.id}', '${file.filename}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteFile('${file.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function downloadFile(fileId, filename) {
    try {
        const response = await fetch(`/api/files/download/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('File downloaded successfully!', 'success');
        } else {
            const error = await response.json();
            showMessage(error.message || 'Download failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
        });

        if (response.ok) {
            loadFiles();
            showMessage('File deleted successfully!', 'success');
        } else {
            const error = await response.json();
            showMessage(error.message || 'Delete failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Utility functions
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        userToken = token;
        // Verify token and get user info
        fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                currentUser = data;
                showDashboard();
            } else {
                localStorage.removeItem('token');
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
        });
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'fa-image';
    if (ext === 'pdf') return 'fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
    if (ext === 'txt') return 'fa-file-alt';
    return 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function isAuthenticated() {
    return !!userToken;
}
