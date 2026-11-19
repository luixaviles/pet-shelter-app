import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import petsRoutes from './routes/pets.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { CORS_ORIGIN, NODE_ENV, PORT, parseCorsOrigin } from './config/config';

export function createApp(): Express {
  const app: Express = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: parseCorsOrigin(CORS_ORIGIN, NODE_ENV),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser middleware
  app.use(express.json());

  // Rate limiting on pet creation endpoint
  const createPetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
  });
  app.post('/api/pets', createPetLimiter);

  // Routes
  app.use('/api/pets', petsRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

