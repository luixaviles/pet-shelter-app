import type { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let errorMessage = 'Internal server error';

  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    errorMessage = 'Invalid JSON in request body';
  }

  // Handle file system errors
  if ('code' in err) {
    if (err.code === 'ENOENT') {
      statusCode = 500;
      errorMessage = 'Data file not found';
    } else if (err.code === 'EACCES') {
      statusCode = 500;
      errorMessage = 'Permission denied accessing data file';
    }
  }

  // Use custom error message if available
  if (err.message) {
    errorMessage = err.message;
  }

  const response: ErrorResponse = {
    success: false,
    error: errorMessage,
  };

  // Include error details in development mode
  if (process.env.NODE_ENV === 'development') {
    response.details = err.stack;
  }

  res.status(statusCode).json(response);
};

