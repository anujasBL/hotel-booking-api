import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { JwtPayload } from '../types';
import { createUnauthorizedError, createForbiddenError, createValidationError, asyncHandler } from './errorHandler';

// Extract JWT token from request
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

// Verify JWT token
const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createUnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createUnauthorizedError('Invalid token');
    }
    throw createUnauthorizedError('Token verification failed');
  }
};

// Verify Supabase session
const verifySupabaseSession = async (token: string): Promise<any> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      logger.warn('Supabase session verification failed:', { error: error.message });
      throw createUnauthorizedError('Invalid session');
    }

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Supabase session verification error:', error);
    throw createUnauthorizedError('Session verification failed');
  }
};

// Authentication middleware
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    throw createUnauthorizedError('Authentication token is required');
  }

  // First verify JWT structure and expiration
  const payload = verifyToken(token);

  // Then verify the session with Supabase
  const user = await verifySupabaseSession(token);

  // Attach user info to request
  req.user = {
    userId: user.id,
    email: user.email,
    iat: payload.iat,
    exp: payload.exp,
  };

  logger.debug('User authenticated successfully:', {
    userId: req.user.userId,
    email: req.user.email,
  });

  next();
});

// Optional authentication middleware (doesn't throw if no token)
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await verifySupabaseSession(token);

    req.user = {
      userId: user.id,
      email: user.email,
      iat: payload.iat,
      exp: payload.exp,
    };

    logger.debug('Optional auth: User authenticated:', {
      userId: req.user.userId,
      email: req.user.email,
    });
  } catch (error) {
    // Don't throw error for optional auth, just log it
    logger.debug('Optional auth failed:', { error: (error as Error).message });
  }

  next();
});

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    // Get user role from database
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      logger.error('Failed to fetch user role:', error);
      throw createForbiddenError('Unable to verify user permissions');
    }

    if (!roles.includes(userProfile.role)) {
      throw createForbiddenError('Insufficient permissions');
    }

    next();
  });
};

// Resource ownership middleware
export const requireOwnership = (resourceIdParam: string = 'id', userIdField: string = 'userId') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    const resourceId = req.params[resourceIdParam];
    
    if (!resourceId) {
      throw createValidationError(`Resource ID parameter '${resourceIdParam}' is required`);
    }

    // This middleware assumes the route handler will check ownership
    // For now, we just pass through and let the service layer handle it
    next();
  });
};

export default authenticate;
