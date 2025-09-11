import { z } from 'zod';
import { HotelAmenity, StarRating, RoomType } from '../models/Hotel';
import { BookingStatus, PaymentStatus } from '../models/Booking';

// Common validation schemas
export const dateSchema = z.string().datetime().or(z.date()).transform((val) => new Date(val));
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
}).transform((data) => ({
  ...data,
  offset: (data.page - 1) * data.limit,
}));

// User validation schemas
export const registerUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phoneNumber: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
});

// Hotel search validation schemas
export const hotelSearchSchema = z.object({
  city: z.string().min(1).optional(),
  checkIn: dateSchema,
  checkOut: dateSchema,
  adults: z.string().transform(Number).pipe(z.number().int().min(1).max(20)),
  children: z.string().transform(Number).pipe(z.number().int().min(0).max(20)).default('0'),
  rooms: z.string().transform(Number).pipe(z.number().int().min(1).max(10)).default('1'),
  starRating: z.array(z.nativeEnum(StarRating)).optional(),
  amenities: z.array(z.nativeEnum(HotelAmenity)).optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  sortBy: z.enum(['price', 'rating', 'distance', 'name']).optional().default('price'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
}).transform((data) => ({
  ...data,
  offset: (data.page - 1) * data.limit,
})).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

// Chat search validation schema
export const chatSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500),
  checkIn: dateSchema.optional(),
  checkOut: dateSchema.optional(),
  guests: z.object({
    adults: z.number().int().min(1).max(20).default(1),
    children: z.number().int().min(0).max(20).default(0),
    rooms: z.number().int().min(1).max(10).default(1),
  }).optional(),
  filters: z.object({
    maxPrice: z.number().min(0).optional(),
    starRating: z.array(z.nativeEnum(StarRating)).optional(),
    amenities: z.array(z.nativeEnum(HotelAmenity)).optional(),
  }).optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return data.checkOut > data.checkIn;
  }
  return true;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

// Booking validation schemas
export const guestInfoSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: emailSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: dateSchema.optional(),
  specialRequests: z.string().max(500).optional(),
});

export const createBookingSchema = z.object({
  hotelId: uuidSchema,
  roomId: uuidSchema,
  checkInDate: dateSchema,
  checkOutDate: dateSchema,
  guests: z.object({
    adults: z.number().int().min(1).max(20),
    children: z.number().int().min(0).max(20),
  }),
  guestInfo: z.array(guestInfoSchema).min(1),
  roomsBooked: z.number().int().min(1).max(10),
  specialRequests: z.string().max(1000).optional(),
  paymentMethod: z.string().min(1),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOutDate'],
});

export const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  guestInfo: z.array(guestInfoSchema).optional(),
  specialRequests: z.string().max(1000).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paymentTransactionId: z.string().optional(),
  cancellationReason: z.string().max(500).optional(),
});

export const bookingSearchSchema = z.object({
  status: z.array(z.nativeEnum(BookingStatus)).optional(),
  checkInFrom: dateSchema.optional(),
  checkInTo: dateSchema.optional(),
  bookingDateFrom: dateSchema.optional(),
  bookingDateTo: dateSchema.optional(),
  sortBy: z.enum(['checkInDate', 'bookingDate', 'total']).optional().default('checkInDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
}).transform((data) => ({
  ...data,
  offset: (data.page - 1) * data.limit,
}));

// Availability check schema
export const availabilityCheckSchema = z.object({
  hotelId: uuidSchema,
  roomId: uuidSchema,
  checkInDate: dateSchema,
  checkOutDate: dateSchema,
  roomsRequested: z.number().int().min(1).max(10),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOutDate'],
});

// UUID parameter validation
export const uuidParamSchema = z.object({
  id: uuidSchema,
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;
export type ChatSearchInput = z.infer<typeof chatSearchSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingSearchInput = z.infer<typeof bookingSearchSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type UuidParamInput = z.infer<typeof uuidParamSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
