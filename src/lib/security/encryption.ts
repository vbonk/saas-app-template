import crypto from 'crypto';

// Get encryption key from environment variable
const ENCRYPTION_KEY =
  process.env.ADMIN_ENCRYPTION_KEY || 'fallback-key-for-development-only-not-secure';

// Ensure key is 32 bytes for AES-256
const KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

export function encrypt(data: any): string {
  try {
    const text = JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedData: string): any {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return empty object if decryption fails (could be old format)
    return {};
  }
}

// Utility to securely generate encryption keys
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}