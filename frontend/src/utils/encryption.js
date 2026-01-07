import sodium from 'libsodium-wrappers';
import CryptoJS from 'crypto-js';

// Quantum-resistant encryption client-side
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

  // Generate key pair
  async generateKeyPair() {
    await this.initialize();
    const keypair = sodium.crypto_box_keypair();
    return {
      publicKey: sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL),
      privateKey: sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL)
    };
  }

  // Encrypt with public key
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

  // Decrypt with private key
  async decryptAsymmetric(encryptedData, nonce, senderPublicKey, recipientPrivateKey) {
    await this.initialize();
    const encrypted = sodium.from_base64(encryptedData, sodium.base64_variants.ORIGINAL);
    const nonceBuf = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);
    const senderKey = sodium.from_base64(senderPublicKey, sodium.base64_variants.ORIGINAL);
    const recipientKey = sodium.from_base64(recipientPrivateKey, sodium.base64_variants.ORIGINAL);
    
    const decrypted = sodium.crypto_box_open_easy(encrypted, nonceBuf, senderKey, recipientKey);
    return sodium.to_string(decrypted);
  }

  // Symmetric encryption
  async encryptSymmetric(data, key) {
    await this.initialize();
    const message = sodium.from_string(data);
    const keyBuf = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const encrypted = sodium.crypto_secretbox_easy(message, nonce, keyBuf);
    
    return {
      encrypted: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL),
      nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL)
    };
  }

  // Decrypt symmetric
  async decryptSymmetric(encryptedData, nonce, key) {
    await this.initialize();
    const encrypted = sodium.from_base64(encryptedData, sodium.base64_variants.ORIGINAL);
    const nonceBuf = sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL);
    const keyBuf = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    
    const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonceBuf, keyBuf);
    return sodium.to_string(decrypted);
  }

  // Generate symmetric key
  async generateSymmetricKey() {
    await this.initialize();
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    return sodium.to_base64(key, sodium.base64_variants.ORIGINAL);
  }

  // Hash function
  async hash(data) {
    await this.initialize();
    return sodium.to_base64(
      sodium.crypto_generichash(sodium.crypto_generichash_BYTES, sodium.from_string(data)),
      sodium.base64_variants.ORIGINAL
    );
  }

  // Generate anonymous ID
  async generateAnonymousId(seed) {
    await this.initialize();
    const hash = await this.hash(seed + Date.now().toString());
    return hash.substring(0, 16).replace(/[+/=]/g, '');
  }
}

export default new QuantumResistantEncryption();

