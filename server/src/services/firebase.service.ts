import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_STORAGE_BUCKET,
} from '../config/config';

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
};

export function getExtensionForMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (normalized in MIME_TO_EXTENSION) {
    return MIME_TO_EXTENSION[normalized];
  }

  if (normalized.startsWith('image/')) {
    const subtype = normalized.slice('image/'.length).split('+')[0];
    const sanitized = subtype.replace(/[^a-z0-9]/g, '');
    if (sanitized.length > 0) {
      return sanitized;
    }
  }

  return 'png';
}

class FirebaseService {
  private static instance: FirebaseService;
  private initialized = false;

  private constructor() {
    try {
      if (!GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error(
          'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set'
        );
      }

      if (!FIREBASE_STORAGE_BUCKET) {
        throw new Error(
          'FIREBASE_STORAGE_BUCKET environment variable is not set'
        );
      }

      // Load service account credentials
      const serviceAccountPath = GOOGLE_APPLICATION_CREDENTIALS.startsWith('/')
        ? GOOGLE_APPLICATION_CREDENTIALS
        : join(process.cwd(), GOOGLE_APPLICATION_CREDENTIALS);

      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf-8')
      );

      // Initialize Firebase Admin SDK
      admin.initializeApp({
        storageBucket: FIREBASE_STORAGE_BUCKET,
        credential: admin.credential.cert(serviceAccount),
      });

      this.initialized = true;
      console.log(
        `[FirebaseService] Firebase initialized for storage bucket: ${FIREBASE_STORAGE_BUCKET}`
      );
    } catch (error) {
      console.error('[FirebaseService] Failed to initialize Firebase:', error);
      throw new Error(
        'Could not initialize Firebase Admin SDK. Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly.'
      );
    }
  }

  public async uploadImageToStorage(
    imageBuffer: Buffer,
    animalType: 'cat' | 'dog',
    mimeType = 'image/png'
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Firebase Service is not initialized');
    }

    try {
      const bucket = getStorage().bucket();
      const nanoidValue = nanoid(10);
      const normalizedMimeType = mimeType.toLowerCase().split(';')[0].trim() || 'image/png';
      const extension = getExtensionForMimeType(normalizedMimeType);
      const fileName = `images/${animalType}-${nanoidValue}.${extension}`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: {
          contentType: normalizedMimeType,
        },
      });

      await file.makePublic();
      return file.publicUrl();
    } catch (error) {
      console.error('[FirebaseService] Failed to upload image:', error);
      throw new Error('Failed to upload image to Firebase Storage');
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
}

export default FirebaseService;

