const crypto = require('crypto');
const forge = require('node-forge');

// AES-256 encryption
function encryptFile(buffer, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

// AES-256 decryption
function decryptFile(buffer, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(buffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

// Generate RSA key pair
function generateRSAKeyPair() {
  const keypair = forge.pki.rsa.generateKeyPair(2048);
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  return { publicKey, privateKey };
}

// RSA encryption
function encryptWithRSA(data, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

// RSA decryption
function decryptWithRSA(encryptedData, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(encryptedData);
  const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP');
  return decrypted;
}

// SHA-256 hash
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate random key
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encryptFile,
  decryptFile,
  generateRSAKeyPair,
  encryptWithRSA,
  decryptWithRSA,
  generateHash,
  generateKey
};
