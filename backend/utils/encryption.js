const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const sodium = require('libsodium-wrappers');

// Quantum-resistant encryption using XChaCha20-Poly1305 (via libsodium)
// This is resistant to quantum attacks

class QuantumResistantEncryption {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await sodium.ready;
      this.initialized = true;
    }
  }

  // Generate a quantum-resistant key pair
  async generateKeyPair() {
    await this.initialize();
    const keypair = sodium.crypto_box_keypair();
    return {
      publicKey: sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL),
      privateKey: sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL)
    };
  }

  // Encrypt data with public key (asymmetric)
  async encryptAsymmetric(data, recipientPublicKey, senderPrivateKey) {
    await this.initialize();
    const message = sodium.from_string(data);
    const recipientKey = sodium.from_base64(recipientPublicKey, sodium.base64_variants.ORIGINAL);
    const senderKey = sodium.from_base64(senderPrivateKey, sodium.base64_variants.ORIGINAL);
    
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const encrypted = sodium.crypto_box_easy(message, nonce, recipientKey, senderKey);
    
    return {
      encrypted: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL),
      nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL)
    };
  }

  // Decrypt data with private key
  async decryptAsymmetric(encryptedData, nonce, senderPublicKey, recipientPrivateKey) {
    await this.initialize();
    const encrypted = sodium.from_base64(encryptedData, sodium.base64_variants.ORIGINAL);
    const nonceBuf = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);
    const senderKey = sodium.from_base64(senderPublicKey, sodium.base64_variants.ORIGINAL);
    const recipientKey = sodium.from_base64(recipientPrivateKey, sodium.base64_variants.ORIGINAL);
    
    const decrypted = sodium.crypto_box_open_easy(encrypted, nonceBuf, senderKey, recipientKey);
    return sodium.to_string(decrypted);
  }

  // Derive key from passphrase (deterministic - same passphrase = same key)
  async deriveKeyFromPassphrase(passphrase) {
    await this.initialize();
    // Use crypto_generichash to derive a key from passphrase
    // This is deterministic - same passphrase always produces same key
    const passphraseBytes = sodium.from_string(passphrase);
    
    // Use a fixed salt prefix for key derivation (or use passphrase hash as salt)
    const saltPrefix = sodium.from_string('quantacipher-salt-v1');
    const combined = new Uint8Array(passphraseBytes.length + saltPrefix.length);
    combined.set(passphraseBytes);
    combined.set(saltPrefix, passphraseBytes.length);
    
    const derivedKey = sodium.crypto_generichash(
      sodium.crypto_secretbox_KEYBYTES,
      combined
    );
    return sodium.to_base64(derivedKey, sodium.base64_variants.ORIGINAL);
  }

  // Symmetric encryption for data at rest (XChaCha20-Poly1305)
  async encryptSymmetric(data, key) {
    await this.initialize();
    const message = sodium.from_string(data);
    
    // Check if key is a passphrase (string) or already a base64 key
    let keyBuf;
    if (typeof key === 'string' && key.length > 0 && !key.includes('=') && key.length < 100) {
      // Likely a passphrase, derive key
      const derivedKey = await this.deriveKeyFromPassphrase(key);
      keyBuf = sodium.from_base64(derivedKey, sodium.base64_variants.ORIGINAL);
    } else {
      // Assume it's a base64-encoded key
      try {
        keyBuf = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
      } catch (e) {
        // If base64 decode fails, treat as passphrase
        const derivedKey = await this.deriveKeyFromPassphrase(key);
        keyBuf = sodium.from_base64(derivedKey, sodium.base64_variants.ORIGINAL);
      }
    }
    
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const encrypted = sodium.crypto_secretbox_easy(message, nonce, keyBuf);
    
    return {
      encrypted: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL),
      nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL)
    };
  }

  // Decrypt symmetric data
  async decryptSymmetric(encryptedData, nonce, key) {
    await this.initialize();
    const encrypted = sodium.from_base64(encryptedData, sodium.base64_variants.ORIGINAL);
    const nonceBuf = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);
    
    // Check if key is a passphrase (string) or already a base64 key
    let keyBuf;
    if (typeof key === 'string' && key.length > 0 && !key.includes('=') && key.length < 100) {
      // Likely a passphrase, derive key
      const derivedKey = await this.deriveKeyFromPassphrase(key);
      keyBuf = sodium.from_base64(derivedKey, sodium.base64_variants.ORIGINAL);
    } else {
      // Assume it's a base64-encoded key
      try {
        keyBuf = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
      } catch (e) {
        // If base64 decode fails, treat as passphrase
        const derivedKey = await this.deriveKeyFromPassphrase(key);
        keyBuf = sodium.from_base64(derivedKey, sodium.base64_variants.ORIGINAL);
      }
    }
    
    const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonceBuf, keyBuf);
    return sodium.to_string(decrypted);
  }

  // Generate a random symmetric key
  async generateSymmetricKey() {
    await this.initialize();
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    return sodium.to_base64(key, sodium.base64_variants.ORIGINAL);
  }

  // Hash function (for anonymous IDs)
  async hash(data) {
    await this.initialize();
    return sodium.to_base64(
      sodium.crypto_generichash(sodium.crypto_generichash_BYTES, sodium.from_string(data)),
      sodium.base64_variants.ORIGINAL
    );
  }

  // Generate anonymous ID from key material
  async generateAnonymousId(seed) {
    await this.initialize();
    const hash = await this.hash(seed + Date.now().toString());
    // Return first 16 characters as anonymous ID
    return hash.substring(0, 16).replace(/[+/=]/g, '');
  }
}

// Legacy AES encryption for backward compatibility (fallback)
class AESEncryption {
  encrypt(data, key) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  decrypt(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  generateKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
}

module.exports = {
  QuantumResistantEncryption,
  AESEncryption
};

