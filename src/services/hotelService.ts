import { supabase } from '../config/database';
import { logger } from '../config/logger';
import { 
  Hotel, 
  HotelWithAvailability, 
  HotelSearchFilters, 
  Room, 
  RoomWithAvailability 
} from '../models/Hotel';
import { ApiResponse, PaginationMeta } from '../types';
import { createNotFoundError, AppError } from '../middleware/errorHandler';

export class HotelService {
  /**
   * Search hotels with traditional filters
   */
  async searchHotels(filters: HotelSearchFilters): Promise<{
    hotels: HotelWithAvailability[];
    meta: PaginationMeta;
  }> {
    try {
      logger.info('Searching hotels with filters:', filters);

      // Build the base query
      let query = supabase
        .from('hotels')
        .select(`
          *,
          rooms(*)
        `);

      // Apply city filter
      if (filters.city) {
        query = query.ilike('location->>city', `%${filters.city}%`);
      }

      // Apply star rating filter
      if (filters.starRating && filters.starRating.length > 0) {
        query = query.in('star_rating', filters.starRating);
      }

      // Apply amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        query = query.overlaps('amenities', filters.amenities);
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 10;
      query = query.range(offset, offset + limit - 1);

      const { data: hotelsData, error } = await query;

      if (error) {
        logger.error('Hotel search query failed:', error);
        throw new AppError('Failed to search hotels', 500, 'DATABASE_ERROR');
      }

      // Process each hotel to add availability and pricing
      const hotelsWithAvailability = await Promise.all(
        hotelsData.map(async (hotel) => {
          try {
            return await this.addAvailabilityToHotel(hotel, filters);
          } catch (error) {
            logger.warn('Failed to process hotel availability:', { hotelId: hotel.id, error });
            // Return hotel with default values if processing fails
            return {
              ...hotel,
              availableRooms: [],
              minPrice: 0,
              maxPrice: 0,
              averageRating: 0,
              totalReviews: 0,
            };
          }
        })
      );

      // Filter out hotels with no available rooms
      const availableHotels = hotelsWithAvailability.filter(hotel => 
        hotel.availableRooms.length > 0
      );

      // Apply price filters after availability check
      let filteredHotels = availableHotels;
      
      if (filters.minPrice !== undefined) {
        filteredHotels = filteredHotels.filter(hotel => hotel.minPrice >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        filteredHotels = filteredHotels.filter(hotel => hotel.maxPrice <= filters.maxPrice!);
      }

      // Apply sorting
      filteredHotels = this.sortHotels(filteredHotels, filters.sortBy, filters.sortOrder);

      // Create pagination meta
      const totalPages = Math.ceil((totalCount || 0) / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      const meta: PaginationMeta = {
        total: totalCount || 0,
        page: currentPage,
        limit,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      };

      logger.info('Hotel search completed:', {
        totalFound: filteredHotels.length,
        totalResults: totalCount,
        page: currentPage,
      });

      return {
        hotels: filteredHotels,
        meta,
      };
    } catch (error) {
      logger.error('Hotel search failed:', error);
      throw error instanceof AppError ? error : new AppError('Hotel search failed', 500);
    }
  }

  /**
   * Get hotel by ID with availability
   */
  async getHotelById(hotelId: string, filters?: Partial<HotelSearchFilters>): Promise<HotelWithAvailability> {
    try {
      const { data: hotel, error } = await supabase
        .from('hotels')
        .select(`
          *,
          rooms(*)
        `)
        .eq('id', hotelId)
        .single();

      if (error || !hotel) {
        throw createNotFoundError('Hotel');
      }

      const hotelWithAvailability = await this.addAvailabilityToHotel(hotel, filters);

      logger.info('Hotel retrieved:', { hotelId, hasAvailability: hotelWithAvailability.availableRooms.length > 0 });

      return hotelWithAvailability;
    } catch (error) {
      logger.error('Failed to get hotel by ID:', { hotelId, error });
      throw error instanceof AppError ? error : new AppError('Failed to retrieve hotel', 500);
    }
  }

  /**
   * Get all hotels (for admin/management purposes)
   */
  async getAllHotels(page: number = 1, limit: number = 20): Promise<{
    hotels: Hotel[];
    meta: PaginationMeta;
  }> {
    try {
      const offset = (page - 1) * limit;

      const { data: hotels, error, count } = await supabase
        .from('hotels')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError('Failed to fetch hotels', 500, 'DATABASE_ERROR');
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

      return {
        hotels: hotels || [],
        meta,
      };
    } catch (error) {
      logger.error('Failed to get all hotels:', error);
      throw error instanceof AppError ? error : new AppError('Failed to fetch hotels', 500);
    }
  }

  /**
   * Add availability and pricing information to a hotel
   */
  private async addAvailabilityToHotel(
    hotel: any, 
    filters?: Partial<HotelSearchFilters>
  ): Promise<HotelWithAvailability> {
    const availableRooms: RoomWithAvailability[] = [];
    let minPrice = Infinity;
    let maxPrice = 0;

    if (hotel.rooms && hotel.rooms.length > 0) {
      for (const room of hotel.rooms) {
        const roomAvailability = await this.checkRoomAvailability(
          room,
          filters?.checkIn,
          filters?.checkOut,
          filters?.adults || 1,
          filters?.children || 0,
          filters?.rooms || 1
        );

        if (roomAvailability.isAvailable) {
          availableRooms.push(roomAvailability);
          minPrice = Math.min(minPrice, roomAvailability.currentPrice);
          maxPrice = Math.max(maxPrice, roomAvailability.currentPrice);
        }
      }
    }

    // If no rooms are available, set reasonable defaults
    if (availableRooms.length === 0) {
      minPrice = 0;
      maxPrice = 0;
    }

    return {
      ...hotel,
      availableRooms,
      minPrice,
      maxPrice,
      averageRating: 4.5, // TODO: Calculate from reviews
      totalReviews: 120,   // TODO: Get from reviews table
    };
  }

  /**
   * Check room availability for given dates and occupancy
   */
  private async checkRoomAvailability(
    room: Room,
    checkIn?: Date,
    checkOut?: Date,
    adults: number = 1,
    children: number = 0,
    roomsRequested: number = 1
  ): Promise<RoomWithAvailability> {
    let isAvailable = true;
    let availableCount = 10; // Default room inventory
    let currentPrice = room.basePrice || 100; // Default price if missing

    // Check if room can accommodate the occupancy
    const totalGuests = adults + children;
    
    // Safely parse maxOccupancy JSONB field
    let maxOccupancy = 2; // Default fallback
    try {
      if (room.maxOccupancy && typeof room.maxOccupancy === 'object') {
        maxOccupancy = (room.maxOccupancy.adults || 0) + (room.maxOccupancy.children || 0);
      } else if (typeof room.maxOccupancy === 'string') {
        const parsed = JSON.parse(room.maxOccupancy);
        maxOccupancy = (parsed.adults || 0) + (parsed.children || 0);
      }
    } catch (error) {
      logger.warn('Failed to parse room maxOccupancy:', { roomId: room.id, maxOccupancy: room.maxOccupancy });
    }
    
    if (totalGuests > maxOccupancy) {
      isAvailable = false;
    }

    // Check availability for specific dates if provided
    if (checkIn && checkOut && isAvailable) {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('rooms_booked')
        .eq('room_id', room.id)
        .eq('status', 'confirmed')
        .or(`and(check_in_date.lte.${checkOut.toISOString()},check_out_date.gte.${checkIn.toISOString()})`);

      if (error) {
        logger.warn('Failed to check room availability:', error);
        // Don't fail the entire request, just assume availability
      } else {
        const bookedRooms = bookings?.reduce((total, booking) => total + booking.rooms_booked, 0) || 0;
        availableCount = Math.max(0, availableCount - bookedRooms);
        isAvailable = availableCount >= roomsRequested;
      }

      // Apply dynamic pricing based on demand and dates
      currentPrice = this.calculateDynamicPricing(room.basePrice, checkIn, checkOut);
    }

    const discountPercentage = currentPrice < room.basePrice 
      ? Math.round(((room.basePrice - currentPrice) / room.basePrice) * 100)
      : undefined;

    return {
      ...room,
      isAvailable,
      availableCount,
      currentPrice,
      discountPercentage,
    };
  }

  /**
   * Calculate dynamic pricing based on dates and demand
   */
  private calculateDynamicPricing(basePrice: number, checkIn: Date, checkOut: Date): number {
    let price = basePrice;

    // Weekend pricing (Friday, Saturday)
    const checkInDay = checkIn.getDay();
    if (checkInDay === 5 || checkInDay === 6) {
      price *= 1.2; // 20% markup for weekends
    }

    // Advance booking discount
    const daysUntilCheckIn = Math.floor((checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilCheckIn > 30) {
      price *= 0.9; // 10% discount for bookings 30+ days in advance
    } else if (daysUntilCheckIn < 7) {
      price *= 1.1; // 10% markup for last-minute bookings
    }

    // Length of stay discount
    const lengthOfStay = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (lengthOfStay >= 7) {
      price *= 0.95; // 5% discount for week+ stays
    }

    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Sort hotels based on criteria
   */
  private sortHotels(
    hotels: HotelWithAvailability[], 
    sortBy: string = 'price', 
    sortOrder: string = 'asc'
  ): HotelWithAvailability[] {
    return hotels.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.minPrice - b.minPrice;
          break;
        case 'rating':
          comparison = (b.averageRating || 0) - (a.averageRating || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'distance':
          // TODO: Implement distance calculation when user location is provided
          comparison = 0;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}

export default new HotelService();
