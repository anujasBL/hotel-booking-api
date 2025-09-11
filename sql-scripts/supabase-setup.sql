-- =====================================================
-- HOTEL BOOKING SYSTEM - SUPABASE DATABASE SETUP (CONSOLIDATED)
-- =====================================================
-- This script sets up the complete database schema for the hotel booking system
-- with support for traditional search and AI-powered vector search
-- Includes all fixes for Google Gemini integration and vector search

-- =====================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for AI similarity search
CREATE EXTENSION IF NOT EXISTS "vector";

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

-- Hotel amenity enumeration
CREATE TYPE hotel_amenity AS ENUM (
    'wifi',
    'parking',
    'pool',
    'gym',
    'spa',
    'restaurant',
    'bar',
    'room_service',
    'concierge',
    'business_center',
    'meeting_rooms',
    'airport_shuttle',
    'pet_friendly',
    'smoking_allowed',
    'non_smoking',
    'air_conditioning',
    'heating',
    'elevator',
    'laundry_service',
    'dry_cleaning',
    'luggage_storage',
    'tour_desk',
    'currency_exchange',
    'atm',
    'gift_shop',
    'library',
    'game_room',
    'playground',
    'babysitting',
    'wheelchair_accessible',
    'beach_access',
    'mountain_view',
    'city_view',
    'garden_view',
    'balcony',
    'terrace',
    'fireplace',
    'kitchenette',
    'minibar',
    'safe',
    'tv',
    'phone',
    'hairdryer',
    'iron',
    'coffee_maker',
    'microwave',
    'refrigerator'
);

-- =====================================================
-- STEP 3: CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels table with vector search support
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    star_rating star_rating NOT NULL,
    location JSONB NOT NULL, -- {address, city, state, country, coordinates: {lat, lng}}
    amenities hotel_amenity[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    contact_info JSONB NOT NULL, -- {phone, email, website}
    policies JSONB DEFAULT '{}', -- {check_in, check_out, cancellation, pet_policy}
    search_text TEXT GENERATED ALWAYS AS (
        name || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE(location->>'city', '') || ' ' ||
        COALESCE(location->>'state', '') || ' ' ||
        COALESCE(location->>'country', '') || ' ' ||
        COALESCE(array_to_string(amenities, ' '), '')
    ) STORED,
    search_vector vector(768), -- Google Gemini embeddings (768 dimensions)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    type room_type NOT NULL,
    description TEXT,
    max_occupancy JSONB NOT NULL, -- {adults: number, children: number}
    bed_configuration JSONB NOT NULL, -- {beds: [{type, count}]}
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- Room inventory table
CREATE TABLE IF NOT EXISTS room_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_rooms INTEGER NOT NULL DEFAULT 0,
    price_modifier DECIMAL(5,2) DEFAULT 1.0, -- Multiplier for base price
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests JSONB NOT NULL, -- {adults: number, children: number, rooms: number}
    total_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

-- Hotels indexes
CREATE INDEX IF NOT EXISTS idx_hotels_location_city ON hotels USING btree ((location->>'city'));
CREATE INDEX IF NOT EXISTS idx_hotels_location_country ON hotels USING btree ((location->>'country'));
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON hotels USING btree (star_rating);
CREATE INDEX IF NOT EXISTS idx_hotels_amenities ON hotels USING gin (amenities);
CREATE INDEX IF NOT EXISTS idx_hotels_search_text ON hotels USING gin (to_tsvector('english', COALESCE(search_text, '')));
CREATE INDEX IF NOT EXISTS idx_hotels_search_vector ON hotels USING ivfflat (search_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON hotels USING btree (is_active);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms USING btree (hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms USING btree (type);
CREATE INDEX IF NOT EXISTS idx_rooms_base_price ON rooms USING btree (base_price);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms USING btree (is_active);

-- Room inventory indexes
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_id ON room_inventory USING btree (room_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_date ON room_inventory USING btree (date);
CREATE INDEX IF NOT EXISTS idx_room_inventory_available ON room_inventory USING btree (is_available);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings USING btree (hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings USING btree (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings USING btree (check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings USING btree (check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings USING btree (status);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_id ON reviews USING btree (hotel_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews USING btree (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews USING btree (created_at);

-- =====================================================
-- STEP 5: CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate search text for hotels
CREATE OR REPLACE FUNCTION generate_hotel_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := 
        NEW.name || ' ' || 
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.location->>'city', '') || ' ' ||
        COALESCE(NEW.location->>'state', '') || ' ' ||
        COALESCE(NEW.location->>'country', '') || ' ' ||
        COALESCE(array_to_string(NEW.amenities, ' '), '');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Vector search function for hotels (Google Gemini compatible)
CREATE OR REPLACE FUNCTION search_hotels_by_similarity_generic(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    star_rating text,
    location jsonb,
    amenities text[],
    images text[],
    contact_info jsonb,
    policies jsonb,
    search_vector vector(768),
    similarity float
)
LANGUAGE sql
AS $$
    SELECT 
        h.id,
        h.name::text,
        h.description,
        h.star_rating::text,
        h.location,
        h.amenities,
        h.images,
        h.contact_info,
        h.policies,
        h.search_vector,
        (1 - (h.search_vector <=> query_embedding)) AS similarity
    FROM hotels h
    WHERE 
        h.search_vector IS NOT NULL
        AND (1 - (h.search_vector <=> query_embedding)) >= similarity_threshold
        AND h.is_active = true
    ORDER BY h.search_vector <=> query_embedding
    LIMIT match_count;
$$;

-- Function to check embedding statistics
CREATE OR REPLACE FUNCTION check_embedding_stats()
RETURNS TABLE (
    total_hotels INTEGER,
    hotels_with_embeddings INTEGER,
    hotels_without_embeddings INTEGER,
    embedding_percentage NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_hotels,
        COUNT(search_vector)::INTEGER as hotels_with_embeddings,
        (COUNT(*) - COUNT(search_vector))::INTEGER as hotels_without_embeddings,
        ROUND((COUNT(search_vector)::NUMERIC / COUNT(*) * 100), 2) as embedding_percentage
    FROM hotels 
    WHERE location->>'country' = 'Sri Lanka';
END;
$$;

-- =====================================================
-- STEP 6: CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_inventory_updated_at BEFORE UPDATE ON room_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate search text for hotels
CREATE TRIGGER generate_hotel_search_text_trigger 
    BEFORE INSERT OR UPDATE ON hotels 
    FOR EACH ROW EXECUTE FUNCTION generate_hotel_search_text();

-- =====================================================
-- STEP 7: CREATE VIEWS
-- =====================================================

-- Hotel search view with aggregated data
CREATE OR REPLACE VIEW hotel_search_view AS
SELECT 
    h.id,
    h.name,
    h.description,
    h.star_rating,
    h.location,
    h.amenities,
    h.images,
    h.contact_info,
    h.policies,
    h.search_text,
    h.search_vector,
    h.is_active,
    h.created_at,
    h.updated_at,
    COUNT(r.id) as room_count,
    MIN(r.base_price) as min_price,
    MAX(r.base_price) as max_price,
    AVG(r.base_price)::decimal(10,2) as avg_price
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = true
WHERE h.is_active = true
GROUP BY h.id, h.name, h.description, h.star_rating, h.location, h.amenities, 
         h.images, h.contact_info, h.policies, h.search_text, h.search_vector, 
         h.is_active, h.created_at, h.updated_at;

-- =====================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - customize as needed)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Hotels are publicly readable
CREATE POLICY "Hotels are publicly readable" ON hotels FOR SELECT USING (true);

-- Rooms are publicly readable
CREATE POLICY "Rooms are publicly readable" ON rooms FOR SELECT USING (true);

-- Room inventory is publicly readable
CREATE POLICY "Room inventory is publicly readable" ON room_inventory FOR SELECT USING (true);

-- Bookings are private to users
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews are publicly readable, users can create/update their own
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== HOTEL BOOKING SYSTEM DATABASE SETUP COMPLETE ===';
    RAISE NOTICE '✅ Extensions enabled (uuid-ossp, vector)';
    RAISE NOTICE '✅ Custom types created';
    RAISE NOTICE '✅ Tables created with proper relationships';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ Functions created (vector search, embedding stats)';
    RAISE NOTICE '✅ Triggers created for automation';
    RAISE NOTICE '✅ Views created for easy querying';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run sample-data.sql to populate with test data';
    RAISE NOTICE '2. Run sri-lanka-hotels-extended.sql for Sri Lankan hotels';
    RAISE NOTICE '3. Run generate-embeddings-script.js to create embeddings';
    RAISE NOTICE '4. Test your API endpoints';
END $$;