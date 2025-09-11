import { z } from 'zod';

// Hotel amenities enum
export enum HotelAmenity {
  WIFI = 'wifi',
  PARKING = 'parking',
  POOL = 'pool',
  GYM = 'gym',
  SPA = 'spa',
  RESTAURANT = 'restaurant',
  BAR = 'bar',
  ROOM_SERVICE = 'room_service',
  CONFERENCE_ROOM = 'conference_room',
  BUSINESS_CENTER = 'business_center',
  PET_FRIENDLY = 'pet_friendly',
  AIR_CONDITIONING = 'air_conditioning',
  BREAKFAST = 'breakfast',
  LAUNDRY = 'laundry',
  CONCIERGE = 'concierge',
}

// Hotel star rating
export enum StarRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Hotel interface
export interface Hotel {
  id: string;
  name: string;
  description: string;
  starRating: StarRating;
  location: Location;
  amenities: HotelAmenity[];
  images: string[];
  checkInTime: string; // Format: "15:00"
  checkOutTime: string; // Format: "11:00"
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  policies: {
    cancellationPolicy: string;
    petPolicy?: string;
    smokingPolicy: string;
  };
  embedding?: number[]; // Vector embedding for semantic search
  createdAt: Date;
  updatedAt: Date;
}

// Hotel search filters
export interface HotelSearchFilters {
  city?: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  starRating?: StarRating[];
  amenities?: HotelAmenity[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Hotel with availability and pricing
export interface HotelWithAvailability extends Hotel {
  availableRooms: RoomWithAvailability[];
  minPrice: number;
  maxPrice: number;
  averageRating?: number;
  totalReviews?: number;
}

// Room types enum
export enum RoomType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential',
  FAMILY = 'family',
  ACCESSIBLE = 'accessible',
}

// Room amenities
export enum RoomAmenity {
  WIFI = 'wifi',
  TV = 'tv',
  MINI_BAR = 'mini_bar',
  SAFE = 'safe',
  BALCONY = 'balcony',
  OCEAN_VIEW = 'ocean_view',
  CITY_VIEW = 'city_view',
  KITCHENETTE = 'kitchenette',
  JACUZZI = 'jacuzzi',
  FIREPLACE = 'fireplace',
}

// Room interface
export interface Room {
  id: string;
  hotelId: string;
  type: RoomType;
  name: string;
  description: string;
  maxOccupancy: {
    adults: number;
    children: number;
  };
  bedConfiguration: {
    kingBeds?: number;
    queenBeds?: number;
    twinBeds?: number;
    sofaBeds?: number;
  };
  size: number; // Square meters
  amenities: RoomAmenity[];
  images: string[];
  basePrice: number; // Price per night
  createdAt: Date;
  updatedAt: Date;
}

// Room with availability and pricing
export interface RoomWithAvailability extends Room {
  isAvailable: boolean;
  availableCount: number;
  currentPrice: number; // Dynamic pricing
  discountPercentage?: number;
}

export default Hotel;
