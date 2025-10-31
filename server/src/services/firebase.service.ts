import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_STORAGE_BUCKET,
} from '../config/config';

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
    animalType: 'cat' | 'dog'
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Firebase Service is not initialized');
    }

    try {
      const bucket = getStorage().bucket();
      const nanoidValue = nanoid(10);
      const fileName = `images/${animalType}-${nanoidValue}.png`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/png',
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

