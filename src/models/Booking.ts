import { z } from 'zod';

// Booking status enum
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Guest information
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  specialRequests?: string;
}

// Booking interface
export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  bookingReference: string;
  status: BookingStatus;
  checkInDate: Date;
  checkOutDate: Date;
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: GuestInfo[];
  roomsBooked: number;
  
  // Pricing
  pricing: {
    roomRate: number; // Rate per night per room
    totalNights: number;
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
    currency: string;
  };
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  
  // Dates
  bookingDate: Date;
  cancellationDate?: Date;
  lastModified: Date;
  
  // Additional info
  specialRequests?: string;
  cancellationReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Booking creation data
export interface CreateBookingData {
  hotelId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: GuestInfo[];
  roomsBooked: number;
  specialRequests?: string;
  paymentMethod: string;
}

// Booking update data
export interface UpdateBookingData {
  status?: BookingStatus;
  guestInfo?: GuestInfo[];
  specialRequests?: string;
  paymentStatus?: PaymentStatus;
  paymentTransactionId?: string;
  cancellationReason?: string;
}

// Booking search filters
export interface BookingSearchFilters {
  userId?: string;
  hotelId?: string;
  status?: BookingStatus[];
  checkInFrom?: Date;
  checkInTo?: Date;
  bookingDateFrom?: Date;
  bookingDateTo?: Date;
  sortBy?: 'checkInDate' | 'bookingDate' | 'total';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Availability check data
export interface AvailabilityCheck {
  hotelId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomsRequested: number;
}

// Availability result
export interface AvailabilityResult {
  isAvailable: boolean;
  availableRooms: number;
  rate: number;
  total: number;
  restrictions?: string[];
}

export default Booking;
