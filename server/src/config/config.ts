export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN;

export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

export function parseCorsOrigin(
  corsOriginEnv: string | undefined,
  nodeEnv: string = NODE_ENV
): string | string[] | boolean {
  if (corsOriginEnv && corsOriginEnv.trim().length > 0) {
    const origins = corsOriginEnv
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);

    if (origins.includes('*')) {
      return '*';
    }
    if (origins.length === 1) {
      return origins[0];
    }
    if (origins.length > 1) {
      return origins;
    }
  }

  return nodeEnv === 'production' ? false : '*';
}

// Validate required environment variables
if (!GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('[Config] Warning: GOOGLE_APPLICATION_CREDENTIALS is not set');
}

if (!FIREBASE_STORAGE_BUCKET) {
  console.warn('[Config] Warning: FIREBASE_STORAGE_BUCKET is not set');
}
