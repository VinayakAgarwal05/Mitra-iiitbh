import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ENV } from '../config/env';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  // Always log server-side for observability
  if (ENV.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => e.message).filter(Boolean);
    const summaryMsg = errorMessages.length > 0 ? errorMessages.join('. ') : 'Validation failed. Please verify your input.';
    res.status(400).json({
      error: summaryMsg,
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err.name === 'MulterError') {
    res.status(400).json({
      error: `File upload error: ${err.message}`,
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  
  // Mask sensitive database or internal stack traces in production for 5xx errors
  let message = err.message || 'An unexpected internal error occurred.';
  if (statusCode >= 500 && ENV.NODE_ENV === 'production') {
    message = 'An unexpected internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    error: message,
  });
}
