-- =====================================================
-- HOTEL BOOKING SYSTEM - SUPABASE DATABASE SETUP
-- =====================================================
-- This script sets up the complete database schema for the hotel booking system
-- with support for traditional search and AI-powered vector search

-- =====================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for AI similarity search
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable PostGIS for geographical operations (optional)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- STEP 2: CREATE CUSTOM TYPES
-- =====================================================

-- Booking status enumeration
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed', 
    'cancelled',
    'completed',
    'no_show'
);

-- Payment status enumeration
CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
);

-- Hotel star rating enumeration
CREATE TYPE star_rating AS ENUM ('1', '2', '3', '4', '5');

-- Room type enumeration
CREATE TYPE room_type AS ENUM (
    'standard',
    'deluxe',
    'suite',
    'presidential',
    'family',
    'accessible'
);

-- =====================================================
-- STEP 3: CREATE MAIN TABLES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    role VARCHAR(50) DEFAULT 'customer',
    preferences JSONB DEFAULT '{}', -- User preferences for search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels table with vector search support
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    star_rating star_rating NOT NULL,
    
    -- Location information for traditional search
    location JSONB NOT NULL, -- {latitude, longitude, address, city, state, country, postalCode}
    
    -- Amenities for filtering
    amenities TEXT[] DEFAULT '{}',
    
    -- Media and contact information
    images TEXT[] DEFAULT '{}',
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    contact_info JSONB, -- {phone, email, website}
    policies JSONB, -- {cancellationPolicy, petPolicy, smokingPolicy}
    
    -- Vector embedding for AI search (1536 dimensions for OpenAI ada-002)
    embedding vector(1536),
    
    -- Search optimization fields
    search_text TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
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
    
    -- Capacity and configuration
    max_occupancy JSONB NOT NULL, -- {adults: number, children: number}
    bed_configuration JSONB, -- {kingBeds, queenBeds, twinBeds, sofaBeds}
    size INTEGER, -- Square meters
    
    -- Amenities and media
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    
    -- Room inventory settings
    total_rooms INTEGER DEFAULT 10,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Booking identification
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    status booking_status DEFAULT 'pending',
    
    -- Stay details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests JSONB NOT NULL, -- {adults: number, children: number}
    guest_info JSONB NOT NULL, -- Array of guest information
    rooms_booked INTEGER NOT NULL DEFAULT 1,
    
    -- Pricing breakdown
    pricing JSONB NOT NULL, -- {roomRate, totalNights, subtotal, taxes, fees, total, currency}
    
    -- Payment information
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_transaction_id VARCHAR(255),
    
    -- Important dates
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancellation_date TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional information
    special_requests TEXT,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT check_rooms_booked CHECK (rooms_booked > 0),
    CONSTRAINT check_positive_pricing CHECK ((pricing->>'total')::decimal > 0)
);

-- Room inventory table for availability tracking
CREATE TABLE room_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 10,
    available_rooms INTEGER NOT NULL DEFAULT 10,
    price_override DECIMAL(10,2), -- Dynamic pricing
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(room_id, date),
    CONSTRAINT check_available_rooms CHECK (available_rooms >= 0 AND available_rooms <= total_rooms)
);

-- Reviews table for hotel ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Review categories
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Metadata
    is_verified BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search analytics table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    search_type VARCHAR(50) NOT NULL, -- 'traditional' or 'semantic'
    search_query TEXT,
    search_filters JSONB,
    results_count INTEGER,
    search_duration_ms INTEGER,
    clicked_results JSONB, -- Array of clicked hotel IDs
    conversion_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Hotels indexes for traditional search
CREATE INDEX idx_hotels_active ON hotels(is_active) WHERE is_active = true;
CREATE INDEX idx_hotels_star_rating ON hotels(star_rating);
CREATE INDEX idx_hotels_city ON hotels USING BTREE ((location->>'city'));
CREATE INDEX idx_hotels_state ON hotels USING BTREE ((location->>'state'));
CREATE INDEX idx_hotels_country ON hotels USING BTREE ((location->>'country'));
CREATE INDEX idx_hotels_amenities ON hotels USING GIN (amenities);
CREATE INDEX idx_hotels_search_text ON hotels USING GIN (to_tsvector('english', COALESCE(search_text, '')));

-- Vector search index for AI-powered search
CREATE INDEX idx_hotels_embedding ON hotels USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Alternative vector index for different distance metrics
-- CREATE INDEX idx_hotels_embedding_l2 ON hotels USING ivfflat (embedding vector_l2_ops) 
-- WITH (lists = 100);

-- Rooms indexes
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_active ON rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_rooms_price ON rooms(base_price);
CREATE INDEX idx_rooms_amenities ON rooms USING GIN (amenities);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- Room inventory indexes
CREATE INDEX idx_room_inventory_room_date ON room_inventory(room_id, date);
CREATE INDEX idx_room_inventory_date ON room_inventory(date);
CREATE INDEX idx_room_inventory_available ON room_inventory(available_rooms) WHERE available_rooms > 0;

-- Reviews indexes
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified) WHERE is_verified = true;

-- Search analytics indexes
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_date ON search_analytics(created_at);

-- =====================================================
-- STEP 5: CREATE FUNCTIONS FOR SEARCH
-- =====================================================

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_hotels_by_similarity(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_city text DEFAULT NULL,
    filter_star_rating int[] DEFAULT NULL,
    filter_amenities text[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    star_rating star_rating,
    location jsonb,
    amenities text[],
    images text[],
    similarity float,
    average_rating float,
    review_count bigint
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
        1 - (h.embedding <=> query_embedding) as similarity,
        COALESCE(AVG(r.rating), 0)::float as average_rating,
        COUNT(r.id) as review_count
    FROM hotels h
    LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_verified = true
    WHERE h.embedding IS NOT NULL
        AND h.is_active = true
        AND 1 - (h.embedding <=> query_embedding) > similarity_threshold
        AND (filter_city IS NULL OR h.location->>'city' ILIKE '%' || filter_city || '%')
        AND (filter_star_rating IS NULL OR h.star_rating::text::int = ANY(filter_star_rating))
        AND (filter_amenities IS NULL OR h.amenities && filter_amenities)
    GROUP BY h.id, h.name, h.description, h.star_rating, h.location, h.amenities, h.images, h.embedding
    ORDER BY h.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function for traditional hotel search with availability
CREATE OR REPLACE FUNCTION search_hotels_traditional(
    p_city text DEFAULT NULL,
    p_check_in date DEFAULT NULL,
    p_check_out date DEFAULT NULL,
    p_adults int DEFAULT 1,
    p_children int DEFAULT 0,
    p_rooms int DEFAULT 1,
    p_star_rating int[] DEFAULT NULL,
    p_amenities text[] DEFAULT NULL,
    p_min_price decimal DEFAULT NULL,
    p_max_price decimal DEFAULT NULL,
    p_sort_by text DEFAULT 'price',
    p_sort_order text DEFAULT 'asc',
    p_limit int DEFAULT 10,
    p_offset int DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    star_rating star_rating,
    location jsonb,
    amenities text[],
    images text[],
    min_price decimal,
    max_price decimal,
    average_rating float,
    review_count bigint,
    available_rooms bigint
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.description,
        h.star_rating,
        h.location,
        h.amenities,
        h.images,
        MIN(rm.base_price) as min_price,
        MAX(rm.base_price) as max_price,
        COALESCE(AVG(rv.rating), 0)::float as average_rating,
        COUNT(DISTINCT rv.id) as review_count,
        COUNT(DISTINCT rm.id) as available_rooms
    FROM hotels h
    INNER JOIN rooms rm ON h.id = rm.hotel_id 
        AND rm.is_active = true
        AND (rm.max_occupancy->>'adults')::int >= p_adults
        AND (rm.max_occupancy->>'adults')::int + (rm.max_occupancy->>'children')::int >= p_adults + p_children
    LEFT JOIN reviews rv ON h.id = rv.hotel_id AND rv.is_verified = true
    LEFT JOIN bookings b ON rm.id = b.room_id 
        AND b.status IN ('confirmed', 'pending')
        AND (p_check_in IS NULL OR p_check_out IS NULL OR 
             (b.check_in_date < p_check_out AND b.check_out_date > p_check_in))
    WHERE h.is_active = true
        AND (p_city IS NULL OR h.location->>'city' ILIKE '%' || p_city || '%')
        AND (p_star_rating IS NULL OR h.star_rating::text::int = ANY(p_star_rating))
        AND (p_amenities IS NULL OR h.amenities && p_amenities)
        AND (p_check_in IS NULL OR p_check_out IS NULL OR 
             (SELECT COUNT(*) FROM bookings b2 
              WHERE b2.room_id = rm.id 
                AND b2.status IN ('confirmed', 'pending')
                AND b2.check_in_date < p_check_out 
                AND b2.check_out_date > p_check_in
              GROUP BY b2.room_id
              HAVING SUM(b2.rooms_booked) >= rm.total_rooms) IS NULL)
    GROUP BY h.id, h.name, h.description, h.star_rating, h.location, h.amenities, h.images
    HAVING (p_min_price IS NULL OR MIN(rm.base_price) >= p_min_price)
        AND (p_max_price IS NULL OR MIN(rm.base_price) <= p_max_price)
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN MIN(rm.base_price)
            WHEN p_sort_by = 'rating' AND p_sort_order = 'desc' THEN -COALESCE(AVG(rv.rating), 0)
            WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN h.name
        END ASC,
        CASE 
            WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN MIN(rm.base_price)
            WHEN p_sort_by = 'rating' AND p_sort_order = 'asc' THEN COALESCE(AVG(rv.rating), 0)
            WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN h.name
        END DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
    p_hotel_id uuid,
    p_room_id uuid,
    p_check_in date,
    p_check_out date,
    p_rooms_requested int DEFAULT 1
)
RETURNS TABLE (
    is_available boolean,
    available_rooms int,
    base_price decimal,
    total_price decimal
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    room_record RECORD;
    booked_rooms int := 0;
    nights int;
BEGIN
    -- Get room information
    SELECT r.total_rooms, r.base_price INTO room_record
    FROM rooms r 
    WHERE r.id = p_room_id AND r.hotel_id = p_hotel_id AND r.is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 0::decimal, 0::decimal;
        RETURN;
    END IF;
    
    -- Calculate booked rooms for the date range
    SELECT COALESCE(SUM(b.rooms_booked), 0) INTO booked_rooms
    FROM bookings b
    WHERE b.room_id = p_room_id 
        AND b.status IN ('confirmed', 'pending')
        AND b.check_in_date < p_check_out 
        AND b.check_out_date > p_check_in;
    
    -- Calculate number of nights
    nights := p_check_out - p_check_in;
    
    -- Return availability information
    RETURN QUERY SELECT 
        (room_record.total_rooms - booked_rooms) >= p_rooms_requested as is_available,
        (room_record.total_rooms - booked_rooms) as available_rooms,
        room_record.base_price,
        (room_record.base_price * nights * p_rooms_requested) as total_price;
END;
$$;

-- Function to update room availability after booking
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- When a booking is confirmed, reduce available rooms
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
        SELECT 
            NEW.room_id,
            generate_series(NEW.check_in_date, NEW.check_out_date - INTERVAL '1 day', INTERVAL '1 day')::date,
            (SELECT total_rooms FROM rooms WHERE id = NEW.room_id),
            (SELECT total_rooms FROM rooms WHERE id = NEW.room_id) - NEW.rooms_booked
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search text for hotels
CREATE OR REPLACE FUNCTION update_hotel_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text = COALESCE(NEW.name, '') || ' ' || 
                      COALESCE(NEW.description, '') || ' ' || 
                      COALESCE(NEW.location->>'city', '') || ' ' || 
                      COALESCE(NEW.location->>'state', '') || ' ' || 
                      COALESCE(NEW.location->>'country', '') || ' ' ||
                      COALESCE(array_to_string(NEW.amenities, ' '), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: CREATE TRIGGERS
-- =====================================================

-- Triggers for room availability updates
CREATE TRIGGER trigger_update_room_availability
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_room_availability();

-- Trigger for updating hotel search text
CREATE TRIGGER update_hotel_search_text_trigger
    BEFORE INSERT OR UPDATE ON hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_search_text();

-- Triggers for updating timestamps
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

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for registration" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see and modify their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see and modify their own reviews
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own search analytics
CREATE POLICY "Users can view own search analytics" ON search_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for search analytics" ON search_analytics FOR INSERT WITH CHECK (true);

-- Public read access for hotels, rooms, and inventory
CREATE POLICY "Anyone can view hotels" ON hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view room inventory" ON room_inventory FOR SELECT USING (true);

-- =====================================================
-- STEP 8: SAMPLE DATA
-- =====================================================

-- Insert sample hotels
INSERT INTO hotels (name, description, star_rating, location, amenities, images) VALUES
(
    'Grand Palace Hotel',
    'Experience luxury in the heart of Manhattan with our 5-star accommodations. The Grand Palace Hotel offers stunning city views, world-class dining, and exceptional service. Perfect for business travelers and luxury seekers alike.',
    '5',
    '{"latitude": 40.7614, "longitude": -73.9776, "address": "123 5th Avenue", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10001"}',
    ARRAY['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'room_service', 'concierge', 'business_center'],
    ARRAY['https://example.com/grand-palace-1.jpg', 'https://example.com/grand-palace-2.jpg', 'https://example.com/grand-palace-3.jpg']
),
(
    'Coastal Resort & Spa',
    'Escape to paradise at our beachfront resort in Miami. Featuring pristine sandy beaches, multiple pools, world-class spa treatments, and family-friendly activities. The perfect destination for relaxation and recreation.',
    '4',
    '{"latitude": 25.7617, "longitude": -80.1918, "address": "456 Ocean Drive", "city": "Miami", "state": "FL", "country": "USA", "postalCode": "33139"}',
    ARRAY['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'beach_access', 'kids_club', 'water_sports'],
    ARRAY['https://example.com/coastal-resort-1.jpg', 'https://example.com/coastal-resort-2.jpg', 'https://example.com/coastal-resort-3.jpg']
),
(
    'Mountain View Lodge',
    'Discover the beauty of the Rocky Mountains at our charming mountain lodge. Featuring cozy accommodations, spectacular views, hiking trails, and authentic mountain hospitality. Perfect for nature lovers and adventure seekers.',
    '3',
    '{"latitude": 39.1612, "longitude": -106.7700, "address": "789 Mountain Road", "city": "Aspen", "state": "CO", "country": "USA", "postalCode": "81611"}',
    ARRAY['wifi', 'parking', 'restaurant', 'fireplace', 'hiking', 'ski_access', 'mountain_views'],
    ARRAY['https://example.com/mountain-lodge-1.jpg', 'https://example.com/mountain-lodge-2.jpg']
),
(
    'Business Central Hotel',
    'Located in the financial district, our modern business hotel offers convenient access to major corporations and attractions. Features include high-speed internet, meeting facilities, and express services for busy professionals.',
    '4',
    '{"latitude": 40.7074, "longitude": -74.0113, "address": "100 Wall Street", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10005"}',
    ARRAY['wifi', 'business_center', 'meeting_rooms', 'express_checkin', 'concierge', 'restaurant', 'gym'],
    ARRAY['https://example.com/business-central-1.jpg', 'https://example.com/business-central-2.jpg']
),
(
    'Sunset Beach Hotel',
    'Watch magnificent sunsets from our beachfront property in Santa Monica. This boutique hotel combines modern amenities with coastal charm, offering easy access to the beach, pier, and vibrant local dining scene.',
    '4',
    '{"latitude": 34.0195, "longitude": -118.4912, "address": "200 Santa Monica Pier", "city": "Santa Monica", "state": "CA", "country": "USA", "postalCode": "90401"}',
    ARRAY['wifi', 'parking', 'beach_access', 'restaurant', 'bar', 'fitness_center', 'ocean_views'],
    ARRAY['https://example.com/sunset-beach-1.jpg', 'https://example.com/sunset-beach-2.jpg']
);

-- Insert sample rooms for each hotel
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'deluxe',
    'Deluxe King Room',
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 'Elegant room with king bed and stunning city views'
        WHEN h.name = 'Coastal Resort & Spa' THEN 'Spacious room with king bed and ocean views'
        WHEN h.name = 'Mountain View Lodge' THEN 'Cozy room with king bed and mountain vistas'
        WHEN h.name = 'Business Central Hotel' THEN 'Modern room with king bed and business amenities'
        WHEN h.name = 'Sunset Beach Hotel' THEN 'Stylish room with king bed and beach views'
    END,
    '{"adults": 2, "children": 1}',
    '{"kingBeds": 1}',
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 45
        WHEN h.name = 'Coastal Resort & Spa' THEN 40
        WHEN h.name = 'Mountain View Lodge' THEN 35
        WHEN h.name = 'Business Central Hotel' THEN 38
        WHEN h.name = 'Sunset Beach Hotel' THEN 42
    END,
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'city_view', 'marble_bathroom']
        WHEN h.name = 'Coastal Resort & Spa' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'ocean_view', 'balcony']
        WHEN h.name = 'Mountain View Lodge' THEN ARRAY['wifi', 'tv', 'fireplace', 'mountain_view', 'rustic_decor']
        WHEN h.name = 'Business Central Hotel' THEN ARRAY['wifi', 'tv', 'desk', 'safe', 'city_view', 'business_amenities']
        WHEN h.name = 'Sunset Beach Hotel' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'beach_view', 'modern_decor']
    END,
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 450.00
        WHEN h.name = 'Coastal Resort & Spa' THEN 280.00
        WHEN h.name = 'Mountain View Lodge' THEN 180.00
        WHEN h.name = 'Business Central Hotel' THEN 320.00
        WHEN h.name = 'Sunset Beach Hotel' THEN 350.00
    END,
    15
FROM hotels h;

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'suite',
    'Executive Suite',
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 'Luxurious suite with separate living area and premium amenities'
        WHEN h.name = 'Coastal Resort & Spa' THEN 'Oceanfront suite with private balcony and spa access'
        WHEN h.name = 'Mountain View Lodge' THEN 'Mountain suite with fireplace and panoramic views'
        WHEN h.name = 'Business Central Hotel' THEN 'Business suite with meeting area and executive privileges'
        WHEN h.name = 'Sunset Beach Hotel' THEN 'Beach suite with living room and stunning sunset views'
    END,
    '{"adults": 4, "children": 2}',
    '{"kingBeds": 1, "sofaBeds": 1}',
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 75
        WHEN h.name = 'Coastal Resort & Spa' THEN 65
        WHEN h.name = 'Mountain View Lodge' THEN 55
        WHEN h.name = 'Business Central Hotel' THEN 60
        WHEN h.name = 'Sunset Beach Hotel' THEN 70
    END,
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'city_view', 'kitchenette', 'living_room', 'marble_bathroom']
        WHEN h.name = 'Coastal Resort & Spa' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'ocean_view', 'balcony', 'kitchenette', 'jacuzzi']
        WHEN h.name = 'Mountain View Lodge' THEN ARRAY['wifi', 'tv', 'fireplace', 'mountain_view', 'kitchenette', 'living_room', 'rustic_decor']
        WHEN h.name = 'Business Central Hotel' THEN ARRAY['wifi', 'tv', 'desk', 'safe', 'city_view', 'meeting_area', 'business_amenities']
        WHEN h.name = 'Sunset Beach Hotel' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'beach_view', 'living_room', 'kitchenette', 'modern_decor']
    END,
    CASE 
        WHEN h.name = 'Grand Palace Hotel' THEN 750.00
        WHEN h.name = 'Coastal Resort & Spa' THEN 480.00
        WHEN h.name = 'Mountain View Lodge' THEN 320.00
        WHEN h.name = 'Business Central Hotel' THEN 520.00
        WHEN h.name = 'Sunset Beach Hotel' THEN 580.00
    END,
    8
FROM hotels h;

-- Note: Sample reviews will be added after users are created through the application
-- You can manually add reviews later or create them via the API endpoints

-- =====================================================
-- STEP 9: UTILITY VIEWS
-- =====================================================

-- View for hotel search with aggregated data
CREATE VIEW hotel_search_view AS
SELECT 
    h.id,
    h.name,
    h.description,
    h.star_rating,
    h.location,
    h.amenities,
    h.images,
    h.search_text,
    to_tsvector('english', COALESCE(h.search_text, '')) as search_vector,
    h.embedding IS NOT NULL as has_embedding,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as review_count,
    MIN(rm.base_price) as min_price,
    MAX(rm.base_price) as max_price,
    COUNT(DISTINCT rm.id) as room_types_count,
    h.created_at,
    h.updated_at
FROM hotels h
LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_verified = true
LEFT JOIN rooms rm ON h.id = rm.hotel_id AND rm.is_active = true
WHERE h.is_active = true
GROUP BY h.id, h.name, h.description, h.star_rating, h.location, h.amenities, h.images, h.search_text, h.embedding, h.created_at, h.updated_at;

-- View for booking summary
CREATE VIEW booking_summary_view AS
SELECT 
    b.id,
    b.booking_reference,
    b.status,
    b.check_in_date,
    b.check_out_date,
    b.rooms_booked,
    b.pricing,
    b.payment_status,
    h.name as hotel_name,
    h.location,
    r.name as room_name,
    r.type as room_type,
    up.first_name || ' ' || up.last_name as guest_name,
    up.email as guest_email,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
JOIN rooms r ON b.room_id = r.id
JOIN user_profiles up ON b.user_id = up.id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Hotel Booking System database setup completed successfully!';
    RAISE NOTICE 'Created tables: user_profiles, hotels, rooms, bookings, room_inventory, reviews, search_analytics';
    RAISE NOTICE 'Created indexes for both traditional and vector search optimization';
    RAISE NOTICE 'Created functions: search_hotels_by_similarity, search_hotels_traditional, check_room_availability';
    RAISE NOTICE 'Enabled Row Level Security (RLS) for data protection';
    RAISE NOTICE 'Inserted sample data for testing';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure your application environment variables';
    RAISE NOTICE '2. Generate embeddings for hotels using OpenAI API';
    RAISE NOTICE '3. Test the search functions with your application';
END $$;
