const { encryptData, decryptData, generateSecurePassword } = require('../../utils/encryptionUtils');

describe('Encryption Utils', () => {
  const testData = 'This is sensitive data that needs encryption';
  const testPassword = 'testPassword123!';

  describe('encryptData', () => {
    it('should encrypt data successfully with valid inputs', () => {
      const result = encryptData(testData, testPassword);
      
      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('salt');
      
      expect(typeof result.encrypted).toBe('string');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.salt).toBe('string');
      
      expect(result.encrypted).not.toBe(testData);
      expect(result.encrypted.length).toBeGreaterThan(0);
    });

    it('should throw error when data is null or undefined', () => {
      expect(() => {
        encryptData(null, testPassword);
      }).toThrow('Data and password are required');
      
      expect(() => {
        encryptData(undefined, testPassword);
      }).toThrow('Data and password are required');
    });

    it('should throw error when password is missing', () => {
      expect(() => {
        encryptData(testData, '');
      }).toThrow('Data and password are required');
      
      expect(() => {
        encryptData(testData, null);
      }).toThrow('Data and password are required');
    });

    it('should produce different results for same data (due to random salt/iv)', () => {
      const result1 = encryptData(testData, testPassword);
      const result2 = encryptData(testData, testPassword);
      
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.salt).not.toBe(result2.salt);
    });
  });

  describe('decryptData', () => {
    it('should decrypt data successfully with valid inputs', () => {
      const encrypted = encryptData(testData, testPassword);
      const decrypted = decryptData(encrypted, testPassword);
      
      expect(decrypted).toBe(testData);
    });

    it('should throw error when encrypted data is invalid', () => {
      expect(() => {
        decryptData(null, testPassword);
      }).toThrow('Encrypted data and password are required');
      
      expect(() => {
        decryptData({}, testPassword);
      }).toThrow('Invalid encrypted data format');
      
      expect(() => {
        decryptData({ encrypted: 'test' }, testPassword);
      }).toThrow('Invalid encrypted data format');
    });

    it('should throw error when password is wrong', () => {
      const encrypted = encryptData(testData, testPassword);
      
      expect(() => {
        decryptData(encrypted, 'wrongPassword');
      }).toThrow('Decryption failed');
    });

    it('should throw error when encrypted data is tampered', () => {
      const encrypted = encryptData(testData, testPassword);
      encrypted.encrypted = encrypted.encrypted.slice(0, -5) + 'XXXXX';
      
      expect(() => {
        decryptData(encrypted, testPassword);
      }).toThrow('Decryption failed');
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password with default length', () => {
      const password = generateSecurePassword();
      
      expect(password).toHaveLength(32);
      expect(typeof password).toBe('string');
    });

    it('should generate password with specified length', () => {
      const length = 16;
      const password = generateSecurePassword(length);
      
      expect(password).toHaveLength(length);
    });

    it('should generate different passwords on each call', () => {
      const password1 = generateSecurePassword();
      const password2 = generateSecurePassword();
      
      expect(password1).not.toBe(password2);
    });

    it('should contain mix of characters', () => {
      const password = generateSecurePassword(100); // Longer for better test
      
      expect(password).toMatch(/[A-Z]/); // Uppercase
      expect(password).toMatch(/[a-z]/); // Lowercase
      expect(password).toMatch(/[0-9]/); // Numbers
      expect(password).toMatch(/[!@#$%^&*]/); // Special chars
    });
  });

  describe('encryption/decryption cycle', () => {
    it('should handle various data types as strings', () => {
      const testCases = [
        'Simple string',
        'String with special chars: !@#$%^&*()_+{}|:"<>?',
        'Multi\nline\nstring',
        '{"json": "data", "number": 123}',
        '',
        ' ',
        '123456789'
      ];

      testCases.forEach(data => {
        const encrypted = encryptData(data, testPassword);
        const decrypted = decryptData(encrypted, testPassword);
        expect(decrypted).toBe(data);
      });
    });

    it('should work with different passwords', () => {
      const passwords = [
        'short',
        'verylongpasswordwithmanycharacters123!@#',
        '123456',
        '!@#$%^&*()',
        'Password with spaces'
      ];

      passwords.forEach(password => {
        const encrypted = encryptData(testData, password);
        const decrypted = decryptData(encrypted, password);
        expect(decrypted).toBe(testData);
      });
    });
  });
});