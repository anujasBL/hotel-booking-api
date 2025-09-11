import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/database';
import { logger } from '../config/logger';
import { 
  Booking, 
  CreateBookingData, 
  UpdateBookingData, 
  BookingSearchFilters,
  AvailabilityCheck,
  AvailabilityResult,
  BookingStatus,
  PaymentStatus 
} from '../models/Booking';
import { PaginationMeta } from '../types';
import { AppError, createNotFoundError, createConflictError } from '../middleware/errorHandler';

export class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId: string, bookingData: CreateBookingData): Promise<Booking> {
    try {
      logger.info('Creating booking:', { userId, hotelId: bookingData.hotelId });

      // Step 1: Check availability
      const availability = await this.checkAvailability({
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        roomsRequested: bookingData.roomsBooked,
      });

      if (!availability.isAvailable) {
        throw createConflictError('Requested rooms are not available for the selected dates');
      }

      // Step 2: Calculate pricing
      const pricing = await this.calculatePricing(
        bookingData.roomId,
        bookingData.checkInDate,
        bookingData.checkOutDate,
        bookingData.roomsBooked
      );

      // Step 3: Generate booking reference
      const bookingReference = this.generateBookingReference();

      // Step 4: Create booking record
      const booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        bookingReference,
        status: BookingStatus.PENDING,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.guests,
        guestInfo: bookingData.guestInfo,
        roomsBooked: bookingData.roomsBooked,
        pricing,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: bookingData.paymentMethod,
        bookingDate: new Date(),
        lastModified: new Date(),
        specialRequests: bookingData.specialRequests,
      };

      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create booking:', error);
        throw new AppError('Failed to create booking', 500, 'DATABASE_ERROR');
      }

      logger.info('Booking created successfully:', { 
        bookingId: newBooking.id, 
        bookingReference: newBooking.booking_reference 
      });

      return this.mapDbBookingToModel(newBooking);
    } catch (error) {
      logger.error('Booking creation failed:', { userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to create booking', 500);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, userId?: string): Promise<Booking> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, location, contact_info),
          rooms(name, type, amenities)
        `)
        .eq('id', bookingId);

      // If userId is provided, ensure user can only access their own bookings
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: booking, error } = await query.single();

      if (error || !booking) {
        throw createNotFoundError('Booking');
      }

      logger.info('Booking retrieved:', { bookingId, userId });

      return this.mapDbBookingToModel(booking);
    } catch (error) {
      logger.error('Failed to get booking by ID:', { bookingId, error });
      throw error instanceof AppError ? error : new AppError('Failed to retrieve booking', 500);
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(
    userId: string, 
    filters: BookingSearchFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    bookings: Booking[];
    meta: PaginationMeta;
  }> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, location, images),
          rooms(name, type, images)
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.checkInFrom) {
        query = query.gte('check_in_date', filters.checkInFrom.toISOString());
      }

      if (filters.checkInTo) {
        query = query.lte('check_in_date', filters.checkInTo.toISOString());
      }

      if (filters.bookingDateFrom) {
        query = query.gte('booking_date', filters.bookingDateFrom.toISOString());
      }

      if (filters.bookingDateTo) {
        query = query.lte('booking_date', filters.bookingDateTo.toISOString());
      }

      // Apply sorting
      const sortField = this.mapSortField(filters.sortBy || 'checkInDate');
      const sortOrder = filters.sortOrder === 'desc' ? false : true;
      query = query.order(sortField, { ascending: sortOrder });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: bookings, error, count } = await query;

      if (error) {
        logger.error('Failed to get user bookings:', error);
        throw new AppError('Failed to retrieve bookings', 500, 'DATABASE_ERROR');
      }

      const totalPages = Math.ceil((count || 0) / limit);

      const meta: PaginationMeta = {
        total: count || 0,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      logger.info('User bookings retrieved:', { 
        userId, 
        count: bookings?.length || 0, 
        total: count 
      });

      return {
        bookings: (bookings || []).map(this.mapDbBookingToModel),
        meta,
      };
    } catch (error) {
      logger.error('Failed to get user bookings:', { userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to retrieve bookings', 500);
    }
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string, 
    userId: string, 
    updateData: UpdateBookingData
  ): Promise<Booking> {
    try {
      // First, verify the booking exists and belongs to the user
      const existingBooking = await this.getBookingById(bookingId, userId);

      // Check if booking can be modified
      if (existingBooking.status === BookingStatus.CANCELLED) {
        throw createConflictError('Cannot modify a cancelled booking');
      }

      if (existingBooking.status === BookingStatus.COMPLETED) {
        throw createConflictError('Cannot modify a completed booking');
      }

      const updateFields = {
        ...updateData,
        last_modified: new Date().toISOString(),
        ...(updateData.status === BookingStatus.CANCELLED && {
          cancellation_date: new Date().toISOString(),
        }),
      };

      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update(updateFields)
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update booking:', error);
        throw new AppError('Failed to update booking', 500, 'DATABASE_ERROR');
      }

      logger.info('Booking updated successfully:', { 
        bookingId, 
        userId, 
        status: updateData.status 
      });

      return this.mapDbBookingToModel(updatedBooking);
    } catch (error) {
      logger.error('Booking update failed:', { bookingId, userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to update booking', 500);
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking> {
    try {
      const updateData: UpdateBookingData = {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
      };

      return await this.updateBooking(bookingId, userId, updateData);
    } catch (error) {
      logger.error('Booking cancellation failed:', { bookingId, userId, error });
      throw error instanceof AppError ? error : new AppError('Failed to cancel booking', 500);
    }
  }

  /**
   * Check room availability
   */
  async checkAvailability(availabilityCheck: AvailabilityCheck): Promise<AvailabilityResult> {
    try {
      const { hotelId, roomId, checkInDate, checkOutDate, roomsRequested } = availabilityCheck;

      // Get room information
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('base_price, max_occupancy')
        .eq('id', roomId)
        .eq('hotel_id', hotelId)
        .single();

      if (roomError || !room) {
        throw createNotFoundError('Room');
      }

      // Check existing bookings for the date range
      const { data: existingBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('rooms_booked')
        .eq('room_id', roomId)
        .in('status', [BookingStatus.CONFIRMED, BookingStatus.PENDING])
        .or(`and(check_in_date.lte.${checkOutDate.toISOString()},check_out_date.gte.${checkInDate.toISOString()})`);

      if (bookingError) {
        logger.error('Failed to check existing bookings:', bookingError);
        throw new AppError('Failed to check availability', 500, 'DATABASE_ERROR');
      }

      // Calculate available rooms (assuming 10 rooms per type as default inventory)
      const totalInventory = 10; // This should come from room inventory table
      const bookedRooms = existingBookings?.reduce((total, booking) => total + booking.rooms_booked, 0) || 0;
      const availableRooms = totalInventory - bookedRooms;

      const isAvailable = availableRooms >= roomsRequested;

      // Calculate pricing
      const nightlyRate = room.base_price;
      const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const subtotal = nightlyRate * totalNights * roomsRequested;
      const taxes = subtotal * 0.12; // 12% tax
      const fees = 25; // Fixed booking fee
      const total = subtotal + taxes + fees;

      const result: AvailabilityResult = {
        isAvailable,
        availableRooms,
        rate: nightlyRate,
        total,
        restrictions: isAvailable ? [] : ['No rooms available for selected dates'],
      };

      logger.info('Availability check completed:', { 
        roomId, 
        isAvailable, 
        availableRooms, 
        requestedRooms: roomsRequested 
      });

      return result;
    } catch (error) {
      logger.error('Availability check failed:', { availabilityCheck, error });
      throw error instanceof AppError ? error : new AppError('Failed to check availability', 500);
    }
  }

  /**
   * Calculate pricing for a booking
   */
  private async calculatePricing(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomsBooked: number
  ) {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('base_price')
      .eq('id', roomId)
      .single();

    if (error || !room) {
      throw createNotFoundError('Room');
    }

    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomRate = room.base_price;
    const subtotal = roomRate * totalNights * roomsBooked;
    const taxes = subtotal * 0.12; // 12% tax
    const fees = 25; // Fixed booking fee

    return {
      roomRate,
      totalNights,
      subtotal,
      taxes,
      fees,
      total: subtotal + taxes + fees,
      currency: 'USD',
    };
  }

  /**
   * Generate unique booking reference
   */
  private generateBookingReference(): string {
    const prefix = 'HTL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Map database sort field to actual column name
   */
  private mapSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      checkInDate: 'check_in_date',
      bookingDate: 'booking_date',
      total: 'pricing->total',
    };

    return fieldMap[sortBy] || 'check_in_date';
  }

  /**
   * Map database booking record to model
   */
  private mapDbBookingToModel(dbBooking: any): Booking {
    return {
      id: dbBooking.id,
      userId: dbBooking.user_id,
      hotelId: dbBooking.hotel_id,
      roomId: dbBooking.room_id,
      bookingReference: dbBooking.booking_reference,
      status: dbBooking.status,
      checkInDate: new Date(dbBooking.check_in_date),
      checkOutDate: new Date(dbBooking.check_out_date),
      guests: dbBooking.guests,
      guestInfo: dbBooking.guest_info,
      roomsBooked: dbBooking.rooms_booked,
      pricing: dbBooking.pricing,
      paymentStatus: dbBooking.payment_status,
      paymentMethod: dbBooking.payment_method,
      paymentTransactionId: dbBooking.payment_transaction_id,
      bookingDate: new Date(dbBooking.booking_date),
      cancellationDate: dbBooking.cancellation_date ? new Date(dbBooking.cancellation_date) : undefined,
      lastModified: new Date(dbBooking.last_modified),
      specialRequests: dbBooking.special_requests,
      cancellationReason: dbBooking.cancellation_reason,
      createdAt: new Date(dbBooking.created_at),
      updatedAt: new Date(dbBooking.updated_at),
    };
  }
}

export default new BookingService();
