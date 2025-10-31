export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

// Validate required environment variables
if (!GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('[Config] Warning: GOOGLE_APPLICATION_CREDENTIALS is not set');
}

if (!FIREBASE_STORAGE_BUCKET) {
  console.warn('[Config] Warning: FIREBASE_STORAGE_BUCKET is not set');
}
