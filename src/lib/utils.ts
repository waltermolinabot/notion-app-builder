import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Encryption utilities for storing sensitive data
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.CLERK_SECRET_KEY || "default-secret-key";
  const salt = Buffer.alloc(SALT_LENGTH, "salt-for-encryption");
  return scryptSync(secret, salt, 32);
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const tag = cipher.getAuthTag();
  
  // Return iv:tag:encrypted
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");
  
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
