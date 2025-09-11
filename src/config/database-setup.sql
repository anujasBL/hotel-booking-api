-- Hotel Booking System Database Schema
-- This file contains the SQL setup for Supabase database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create enum types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE star_rating AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE room_type AS ENUM ('standard', 'deluxe', 'suite', 'presidential', 'family', 'accessible');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels table
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    star_rating star_rating NOT NULL,
    location JSONB NOT NULL, -- {latitude, longitude, address, city, state, country, postalCode}
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    contact_info JSONB, -- {phone, email, website}
    policies JSONB, -- {cancellationPolicy, petPolicy, smokingPolicy}
    embedding vector(1536), -- OpenAI ada-002 embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    type room_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_occupancy JSONB NOT NULL, -- {adults: number, children: number}
    bed_configuration JSONB, -- {kingBeds, queenBeds, twinBeds, sofaBeds}
    size INTEGER, -- Square meters
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    base_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    status booking_status DEFAULT 'pending',
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests JSONB NOT NULL, -- {adults: number, children: number}
    guest_info JSONB NOT NULL, -- Array of guest information
    rooms_booked INTEGER NOT NULL DEFAULT 1,
    pricing JSONB NOT NULL, -- {roomRate, totalNights, subtotal, taxes, fees, total, currency}
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_transaction_id VARCHAR(255),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancellation_date TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    special_requests TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT check_rooms_booked CHECK (rooms_booked > 0)
);

-- Room inventory table (for managing available rooms)
CREATE TABLE room_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 10,
    available_rooms INTEGER NOT NULL DEFAULT 10,
    price_override DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(room_id, date),
    CONSTRAINT check_available_rooms CHECK (available_rooms >= 0 AND available_rooms <= total_rooms)
);

-- Reviews table (optional, for future use)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_hotels_location_city ON hotels USING GIN ((location->>'city'));
CREATE INDEX idx_hotels_star_rating ON hotels(star_rating);
CREATE INDEX idx_hotels_amenities ON hotels USING GIN (amenities);
CREATE INDEX idx_hotels_embedding ON hotels USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_price ON rooms(base_price);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

CREATE INDEX idx_room_inventory_room_date ON room_inventory(room_id, date);
CREATE INDEX idx_room_inventory_date ON room_inventory(date);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_hotels_by_similarity(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    star_rating star_rating,
    location jsonb,
    amenities text[],
    images text[],
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT 
        h.id,
        h.name,
        h.description,
        h.star_rating,
        h.location,
        h.amenities,
        h.images,
        1 - (h.embedding <=> query_embedding) as similarity
    FROM hotels h
    WHERE h.embedding IS NOT NULL
        AND 1 - (h.embedding <=> query_embedding) > similarity_threshold
    ORDER BY h.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Create function to update room availability after booking
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- When a booking is confirmed, reduce available rooms
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
        SELECT 
            NEW.room_id,
            generate_series(NEW.check_in_date, NEW.check_out_date - INTERVAL '1 day', INTERVAL '1 day')::date,
            10, -- Default total rooms
            10 - NEW.rooms_booked
        ON CONFLICT (room_id, date) 
        DO UPDATE SET 
            available_rooms = room_inventory.available_rooms - NEW.rooms_booked,
            updated_at = NOW()
        WHERE room_inventory.available_rooms >= NEW.rooms_booked;
    END IF;
    
    -- When a booking is cancelled, increase available rooms
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE room_inventory 
        SET 
            available_rooms = available_rooms + OLD.rooms_booked,
            updated_at = NOW()
        WHERE room_id = OLD.room_id 
            AND date >= OLD.check_in_date 
            AND date < OLD.check_out_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room availability updates
CREATE TRIGGER trigger_update_room_availability
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_room_availability();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at 
    BEFORE UPDATE ON hotels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_inventory_updated_at 
    BEFORE UPDATE ON room_inventory 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Users can only see and modify their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see and modify their own reviews
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for hotels and rooms
CREATE POLICY "Anyone can view hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can view room inventory" ON room_inventory FOR SELECT USING (true);

-- Sample data (optional)
INSERT INTO hotels (name, description, star_rating, location, amenities, images) VALUES
(
    'Grand Palace Hotel',
    'Luxury hotel in the heart of downtown with stunning city views and world-class amenities.',
    '5',
    '{"latitude": 40.7614, "longitude": -73.9776, "address": "123 5th Avenue", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10001"}',
    ARRAY['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'room_service', 'concierge'],
    ARRAY['https://example.com/hotel1-1.jpg', 'https://example.com/hotel1-2.jpg']
),
(
    'Coastal Resort & Spa',
    'Beachfront resort with pristine sandy beaches, multiple pools, and rejuvenating spa treatments.',
    '4',
    '{"latitude": 25.7617, "longitude": -80.1918, "address": "456 Ocean Drive", "city": "Miami", "state": "FL", "country": "USA", "postalCode": "33139"}',
    ARRAY['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'beach_access'],
    ARRAY['https://example.com/hotel2-1.jpg', 'https://example.com/hotel2-2.jpg']
),
(
    'Mountain View Lodge',
    'Cozy mountain retreat with breathtaking views, hiking trails, and rustic charm.',
    '3',
    '{"latitude": 39.1612, "longitude": -106.7700, "address": "789 Mountain Road", "city": "Aspen", "state": "CO", "country": "USA", "postalCode": "81611"}',
    ARRAY['wifi', 'parking', 'restaurant', 'fireplace', 'hiking'],
    ARRAY['https://example.com/hotel3-1.jpg', 'https://example.com/hotel3-2.jpg']
);

-- Insert sample rooms for hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price)
SELECT 
    h.id,
    'deluxe',
    'Deluxe King Room',
    'Spacious room with king bed and city views',
    '{"adults": 2, "children": 1}',
    '{"kingBeds": 1}',
    35,
    ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'city_view'],
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 299.00
        WHEN h.name = 'Coastal Resort & Spa' THEN 199.00
        ELSE 149.00
    END
FROM hotels h;

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price)
SELECT 
    h.id,
    'suite',
    'Executive Suite',
    'Luxurious suite with separate living area',
    '{"adults": 4, "children": 2}',
    '{"kingBeds": 1, "sofaBeds": 1}',
    65,
    ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'balcony', 'kitchenette'],
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 499.00
        WHEN h.name = 'Coastal Resort & Spa' THEN 349.00
        ELSE 249.00
    END
FROM hotels h;
