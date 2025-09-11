// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Chat search types
export interface ChatSearchQuery {
  query: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: {
    adults: number;
    children: number;
    rooms: number;
  };
  filters?: {
    maxPrice?: number;
    starRating?: number[];
    amenities?: string[];
  };
}

export interface ChatSearchResult {
  hotels: any[];
  query: string;
  processingTime: number;
  totalResults: number;
  searchMetadata: {
    embedding: number[];
    similarityThreshold: number;
    searchRadius?: number;
  };
}

// JWT payload type
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export * from '../models/User';
export * from '../models/Hotel';
export * from '../models/Booking';
