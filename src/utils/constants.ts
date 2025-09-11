/**
 * Application constants
 */

// API Response Messages
export const MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGIN_SUCCESS: 'User logged in successfully',
  USER_LOGOUT_SUCCESS: 'User logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  
  HOTELS_FOUND: 'Hotels found',
  HOTEL_RETRIEVED: 'Hotel retrieved successfully',
  
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  
  AVAILABILITY_CHECKED: 'Availability checked successfully',
  ROOMS_AVAILABLE: 'Rooms are available for selected dates',
  ROOMS_NOT_AVAILABLE: 'No rooms available for selected dates',
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  USER_EXISTS: 'USER_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CANNOT_MODIFY: 'BOOKING_CANNOT_MODIFY',
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  
  HOTEL_NOT_FOUND: 'HOTEL_NOT_FOUND',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  
  EMBEDDING_GENERATION_FAILED: 'EMBEDDING_GENERATION_FAILED',
  SEARCH_FAILED: 'SEARCH_FAILED',
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  SEARCH: {
    MAX_RESULTS: 50,
    SIMILARITY_THRESHOLD: 0.7,
    EMBEDDING_MODEL: 'text-embedding-ada-002',
  },
  
  BOOKING: {
    DEFAULT_ROOMS: 1,
    DEFAULT_ADULTS: 1,
    DEFAULT_CHILDREN: 0,
    CANCELLATION_WINDOW_HOURS: 24,
  },
  
  PRICING: {
    TAX_RATE: 0.12, // 12%
    BOOKING_FEE: 25, // Fixed fee
    CURRENCY: 'USD',
  },
  
  ROOM_INVENTORY: {
    DEFAULT_TOTAL_ROOMS: 10,
  },
} as const;

// Hotel Amenities
export const HOTEL_AMENITIES = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'spa',
  'restaurant',
  'bar',
  'room_service',
  'conference_room',
  'business_center',
  'pet_friendly',
  'air_conditioning',
  'breakfast',
  'laundry',
  'concierge',
] as const;

// Room Amenities
export const ROOM_AMENITIES = [
  'wifi',
  'tv',
  'mini_bar',
  'safe',
  'balcony',
  'ocean_view',
  'city_view',
  'kitchenette',
  'jacuzzi',
  'fireplace',
] as const;

// Booking Status Flow
export const BOOKING_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  cancelled: [], // Terminal state
  completed: [], // Terminal state
  no_show: [], // Terminal state
} as const;

// Payment Status Flow
export const PAYMENT_STATUS_FLOW = {
  pending: ['paid', 'failed'],
  paid: ['refunded', 'partially_refunded'],
  failed: ['pending'], // Can retry
  refunded: [], // Terminal state
  partially_refunded: ['refunded'], // Can complete refund
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  BOOKING_REFERENCE: /^HTL\d{6}[A-Z0-9]{4}$/,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export default {
  MESSAGES,
  ERROR_CODES,
  DEFAULTS,
  HOTEL_AMENITIES,
  ROOM_AMENITIES,
  BOOKING_STATUS_FLOW,
  PAYMENT_STATUS_FLOW,
  DATE_FORMATS,
  VALIDATION_PATTERNS,
  HTTP_STATUS,
};
