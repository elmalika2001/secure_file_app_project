const crypto = require('crypto');
const forge = require('node-forge');
const CryptoJS = require('crypto-js');

// AES-256 encryption/decryption
function encryptFile(buffer, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

function decryptFile(encryptedBuffer, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

// Generate AES key
function generateAESKey() {
  return crypto.randomBytes(32).toString('hex'); // 256 bits
}

// RSA key pair generation
function generateRSAKeyPair() {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  return { publicKey, privateKey };
}

// RSA encryption (using public key)
function encryptWithRSA(data, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

// RSA decryption (using private key)
function decryptWithRSA(encryptedData, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(encryptedData);
  const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP');
  return decrypted;
}

// SHA-256 hashing for integrity
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function verifyHash(data, hash) {
  const computedHash = generateHash(data);
  return computedHash === hash;
}

module.exports = {
  encryptFile,
  decryptFile,
  generateAESKey,
  generateRSAKeyPair,
  encryptWithRSA,
  decryptWithRSA,
  generateHash,
  verifyHash
};
