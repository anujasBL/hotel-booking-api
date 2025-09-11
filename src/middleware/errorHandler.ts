import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { ApiResponse, ApiError } from '../types';

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
const formatErrorResponse = (error: AppError | Error, req: Request): ApiResponse => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.code,
      message: error.message,
      ...(isProduction ? {} : { stack: error.stack }),
    };
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      data: { errors: validationErrors },
    };
  }

  // Handle Supabase errors
  if (error.message.includes('duplicate key value violates unique constraint')) {
    return {
      success: false,
      error: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
    };
  }

  if (error.message.includes('violates foreign key constraint')) {
    return {
      success: false,
      error: 'INVALID_REFERENCE',
      message: 'Referenced resource does not exist',
    };
  }

  // Generic error response
  return {
    success: false,
    error: 'INTERNAL_ERROR',
    message: isProduction ? 'Internal server error' : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  };
};

// Global error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
  });

  // Send error response
  const errorResponse = formatErrorResponse(error, req);
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  res.status(404).json(formatErrorResponse(error, req));
};

// Common error creators
export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

export default errorHandler;
