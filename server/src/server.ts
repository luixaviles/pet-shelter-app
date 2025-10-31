import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import petsRoutes from './routes/pets.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { PORT } from './config/config';

const app: Express = express();

// CORS configuration
app.use(
  cors({
    origin: '*', // Allow all origins - can be configured via environment variable
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/pets', petsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

