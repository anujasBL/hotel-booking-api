import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createValidationError } from './errorHandler';

// Generic validation middleware factory
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate URL parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(error); // Let error handler format the response
      } else {
        next(createValidationError('Validation failed'));
      }
    }
  };
};

// Specific validation middleware for common patterns
export const validateBody = (schema: ZodSchema) => validate({ body: schema });
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });
export const validateParams = (schema: ZodSchema) => validate({ params: schema });

// Combined validation for body and params
export const validateBodyAndParams = (bodySchema: ZodSchema, paramsSchema: ZodSchema) => 
  validate({ body: bodySchema, params: paramsSchema });

// Combined validation for query and params
export const validateQueryAndParams = (querySchema: ZodSchema, paramsSchema: ZodSchema) => 
  validate({ query: querySchema, params: paramsSchema });

export default validate;
