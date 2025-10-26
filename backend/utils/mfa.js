const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Generate MFA secret
function generateMFASecret() {
  return speakeasy.generateSecret({
    name: 'Secure File Sharing',
    issuer: 'SecureFS'
  });
}

// Generate QR code for MFA setup
async function generateQRCode(secret) {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.ascii,
    label: 'Secure File Sharing',
    issuer: 'SecureFS'
  });

  try {
    const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

// Verify MFA token
function verifyMFAToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'ascii',
    token: token,
    window: 2 // Allow 2 time windows (30 seconds each)
  });
}

module.exports = {
  generateMFASecret,
  generateQRCode,
  verifyMFAToken
};
