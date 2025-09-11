-- =====================================================
-- HOTEL BOOKING SYSTEM - SAMPLE DATA SCRIPT
-- =====================================================
-- Run this script after the main supabase-setup.sql to populate with test data
-- This creates realistic sample data for testing and development

-- =====================================================
-- STEP 1: INSERT MORE DIVERSE HOTELS
-- =====================================================

-- Add more hotels in different cities and categories
INSERT INTO hotels (name, description, star_rating, location, amenities, images, contact_info, policies) VALUES

-- Luxury Hotels
(
    'The Royal Manhattan',
    'An iconic luxury hotel in the heart of Times Square. Experience unparalleled elegance with our world-renowned service, Michelin-starred dining, and breathtaking views of the city that never sleeps.',
    '5',
    '{"latitude": 40.7580, "longitude": -73.9855, "address": "1535 Broadway", "city": "New York", "state": "NY", "country": "USA", "postalCode": "10036"}',
    ARRAY['wifi', 'valet_parking', 'pool', 'spa', 'fitness_center', 'restaurant', 'bar', 'room_service', 'concierge', 'business_center', 'meeting_rooms', 'laundry'],
    ARRAY['https://example.com/royal-manhattan-lobby.jpg', 'https://example.com/royal-manhattan-suite.jpg', 'https://example.com/royal-manhattan-restaurant.jpg'],
    '{"phone": "+1-212-555-0101", "email": "reservations@royalmanhattan.com", "website": "https://royalmanhattan.com"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Pets allowed with $150 fee", "smokingPolicy": "Non-smoking property"}'
),

(
    'Beverly Hills Grand',
    'Legendary luxury resort in the heart of Beverly Hills. Home to celebrities and dignitaries, featuring world-class amenities, award-winning dining, and the famous Polo Lounge.',
    '5',
    '{"latitude": 34.0901, "longitude": -118.4065, "address": "9641 Sunset Boulevard", "city": "Beverly Hills", "state": "CA", "country": "USA", "postalCode": "90210"}',
    ARRAY['wifi', 'valet_parking', 'pool', 'spa', 'fitness_center', 'restaurant', 'bar', 'room_service', 'concierge', 'tennis_court', 'golf_course'],
    ARRAY['https://example.com/beverly-hills-exterior.jpg', 'https://example.com/beverly-hills-pool.jpg', 'https://example.com/beverly-hills-suite.jpg'],
    '{"phone": "+1-310-555-0202", "email": "info@beverlyhillsgrand.com", "website": "https://beverlyhillsgrand.com"}',
    '{"cancellationPolicy": "Free cancellation up to 48 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Designated smoking areas only"}'
),

-- Business Hotels
(
    'Downtown Executive Suites',
    'Modern business hotel in Chicago''s Loop district. Perfect for corporate travelers with state-of-the-art meeting facilities, high-speed internet, and proximity to major business centers.',
    '4',
    '{"latitude": 41.8781, "longitude": -87.6298, "address": "333 West Wacker Drive", "city": "Chicago", "state": "IL", "country": "USA", "postalCode": "60606"}',
    ARRAY['wifi', 'parking', 'fitness_center', 'business_center', 'meeting_rooms', 'restaurant', 'express_checkin', 'laundry', 'airport_shuttle'],
    ARRAY['https://example.com/chicago-executive-lobby.jpg', 'https://example.com/chicago-executive-room.jpg'],
    '{"phone": "+1-312-555-0303", "email": "bookings@downtownexecutive.com", "website": "https://downtownexecutive.com"}',
    '{"cancellationPolicy": "Free cancellation up to 6 hours before check-in", "petPolicy": "Service animals only", "smokingPolicy": "Non-smoking property"}'
),

-- Boutique Hotels
(
    'The Artist''s Loft Portland',
    'Trendy boutique hotel in Portland''s Pearl District. Each room is uniquely designed by local artists, featuring eco-friendly amenities and farm-to-table dining.',
    '4',
    '{"latitude": 45.5152, "longitude": -122.6784, "address": "1234 NW Marshall Street", "city": "Portland", "state": "OR", "country": "USA", "postalCode": "97209"}',
    ARRAY['wifi', 'bike_rental', 'restaurant', 'bar', 'fitness_center', 'pet_friendly', 'eco_friendly', 'local_art'],
    ARRAY['https://example.com/portland-loft-exterior.jpg', 'https://example.com/portland-loft-room.jpg', 'https://example.com/portland-loft-art.jpg'],
    '{"phone": "+1-503-555-0404", "email": "hello@artistsloftpdx.com", "website": "https://artistsloftpdx.com"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Pets welcome with $75 fee", "smokingPolicy": "Non-smoking property"}'
),

-- Family Resorts
(
    'Sunshine Family Resort Orlando',
    'The ultimate family destination near Disney World. Features multiple pools, kids'' clubs, character dining, and spacious family suites. Creating magical memories for families.',
    '4',
    '{"latitude": 28.3852, "longitude": -81.5639, "address": "7777 Fantasy Way", "city": "Orlando", "state": "FL", "country": "USA", "postalCode": "32821"}',
    ARRAY['wifi', 'parking', 'pool', 'kids_club', 'water_park', 'restaurant', 'bar', 'fitness_center', 'game_room', 'playground', 'shuttle_service'],
    ARRAY['https://example.com/orlando-family-pool.jpg', 'https://example.com/orlando-family-suite.jpg', 'https://example.com/orlando-family-dining.jpg'],
    '{"phone": "+1-407-555-0505", "email": "reservations@sunshinefamily.com", "website": "https://sunshinefamilyresort.com"}',
    '{"cancellationPolicy": "Free cancellation up to 72 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Non-smoking property"}'
),

-- Budget Hotels
(
    'City Budget Inn',
    'Clean, comfortable, and affordable accommodations in downtown Seattle. Perfect for budget-conscious travelers who want to stay in the heart of the city.',
    '2',
    '{"latitude": 47.6062, "longitude": -122.3321, "address": "456 Pine Street", "city": "Seattle", "state": "WA", "country": "USA", "postalCode": "98101"}',
    ARRAY['wifi', 'parking', 'breakfast', 'laundry'],
    ARRAY['https://example.com/seattle-budget-exterior.jpg', 'https://example.com/seattle-budget-room.jpg'],
    '{"phone": "+1-206-555-0606", "email": "info@citybudgetinn.com", "website": "https://citybudgetinn.com"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Designated smoking rooms available"}'
),

-- Historic Hotels
(
    'The Historic Charleston Inn',
    'Step back in time at this beautifully restored 18th-century inn in Charleston''s Historic District. Featuring period furnishings, southern hospitality, and award-winning cuisine.',
    '4',
    '{"latitude": 32.7767, "longitude": -79.9311, "address": "789 King Street", "city": "Charleston", "state": "SC", "country": "USA", "postalCode": "29401"}',
    ARRAY['wifi', 'parking', 'restaurant', 'bar', 'fitness_center', 'historic_charm', 'garden_courtyard'],
    ARRAY['https://example.com/charleston-historic-exterior.jpg', 'https://example.com/charleston-historic-room.jpg', 'https://example.com/charleston-historic-courtyard.jpg'],
    '{"phone": "+1-843-555-0707", "email": "reservations@historiccharlestoninn.com", "website": "https://historiccharlestoninn.com"}',
    '{"cancellationPolicy": "Free cancellation up to 48 hours before check-in", "petPolicy": "Small pets allowed with $100 fee", "smokingPolicy": "Non-smoking property"}'
),

-- Desert Resort
(
    'Desert Oasis Resort Scottsdale',
    'Luxury desert resort featuring championship golf courses, world-class spa treatments, and stunning Sonoran Desert views. Perfect for golf enthusiasts and spa lovers.',
    '5',
    '{"latitude": 33.4942, "longitude": -111.9261, "address": "10000 E Happy Valley Road", "city": "Scottsdale", "state": "AZ", "country": "USA", "postalCode": "85255"}',
    ARRAY['wifi', 'valet_parking', 'pool', 'spa', 'golf_course', 'tennis_court', 'restaurant', 'bar', 'fitness_center', 'desert_views'],
    ARRAY['https://example.com/scottsdale-desert-resort.jpg', 'https://example.com/scottsdale-golf.jpg', 'https://example.com/scottsdale-spa.jpg'],
    '{"phone": "+1-480-555-0808", "email": "info@desertoasisresort.com", "website": "https://desertoasisresort.com"}',
    '{"cancellationPolicy": "Free cancellation up to 72 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Non-smoking property"}'
),

-- Urban Boutique
(
    'The Local Austin',
    'Hip urban hotel in Austin''s trendy East Side. Features locally-sourced dining, live music venues, and easy access to the city''s famous food trucks and music scene.',
    '3',
    '{"latitude": 30.2672, "longitude": -97.7431, "address": "1010 East 6th Street", "city": "Austin", "state": "TX", "country": "USA", "postalCode": "78702"}',
    ARRAY['wifi', 'parking', 'restaurant', 'bar', 'fitness_center', 'live_music', 'bike_rental', 'local_culture'],
    ARRAY['https://example.com/austin-local-exterior.jpg', 'https://example.com/austin-local-room.jpg', 'https://example.com/austin-local-music.jpg'],
    '{"phone": "+1-512-555-0909", "email": "howdy@thelocalaustin.com", "website": "https://thelocalaustin.com"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Pets welcome with $50 fee", "smokingPolicy": "Non-smoking property"}'
),

-- Ski Resort
(
    'Alpine Peak Lodge Vail',
    'Premier ski-in/ski-out resort in Vail Village. Offering luxury accommodations, world-class skiing, mountain dining, and après-ski entertainment.',
    '5',
    '{"latitude": 39.6403, "longitude": -106.3742, "address": "123 Gore Creek Drive", "city": "Vail", "state": "CO", "country": "USA", "postalCode": "81657"}',
    ARRAY['wifi', 'valet_parking', 'ski_storage', 'spa', 'restaurant', 'bar', 'fitness_center', 'fireplace', 'mountain_views', 'ski_access'],
    ARRAY['https://example.com/vail-alpine-exterior.jpg', 'https://example.com/vail-alpine-suite.jpg', 'https://example.com/vail-alpine-slopes.jpg'],
    '{"phone": "+1-970-555-1010", "email": "reservations@alpinepeaklodge.com", "website": "https://alpinepeaklodge.com"}',
    '{"cancellationPolicy": "Free cancellation up to 7 days before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Non-smoking property"}'
);

-- =====================================================
-- STEP 2: INSERT DIVERSE ROOM TYPES
-- =====================================================

-- Standard rooms for all hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'standard',
    'Standard Room',
    CASE 
        WHEN h.star_rating = '5' THEN 'Elegantly appointed standard room with premium amenities'
        WHEN h.star_rating = '4' THEN 'Comfortable standard room with modern amenities'
        WHEN h.star_rating = '3' THEN 'Well-appointed standard room with essential amenities'
        ELSE 'Clean and comfortable standard room'
    END,
    '{"adults": 2, "children": 1}'::jsonb,
    CASE 
        WHEN random() > 0.5 THEN '{"queenBeds": 1}'::jsonb
        ELSE '{"kingBeds": 1}'::jsonb
    END,
    CASE 
        WHEN h.star_rating = '5' THEN 35 + floor(random() * 15)::int
        WHEN h.star_rating = '4' THEN 25 + floor(random() * 15)::int
        ELSE 20 + floor(random() * 10)::int
    END,
    CASE 
        WHEN h.star_rating = '5' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'premium_linens', 'marble_bathroom']
        WHEN h.star_rating = '4' THEN ARRAY['wifi', 'tv', 'safe', 'coffee_maker', 'work_desk']
        WHEN h.star_rating = '3' THEN ARRAY['wifi', 'tv', 'coffee_maker']
        ELSE ARRAY['wifi', 'tv']
    END,
    CASE 
        WHEN h.name LIKE '%Manhattan%' OR h.name LIKE '%Beverly Hills%' THEN 300 + floor(random() * 200)::int
        WHEN h.star_rating = '5' THEN 200 + floor(random() * 300)::int
        WHEN h.star_rating = '4' THEN 120 + floor(random() * 180)::int
        WHEN h.star_rating = '3' THEN 80 + floor(random() * 120)::int
        ELSE 50 + floor(random() * 80)::int
    END,
    20 + floor(random() * 30)::int
FROM hotels h 
WHERE h.name NOT IN ('Grand Palace Hotel', 'Coastal Resort & Spa', 'Mountain View Lodge', 'Business Central Hotel', 'Sunset Beach Hotel');

-- Family rooms for family-friendly hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'family',
    'Family Room',
    'Spacious family room perfect for families with children, featuring separate sleeping areas and kid-friendly amenities',
    '{"adults": 4, "children": 4}'::jsonb,
    '{"queenBeds": 1, "twinBeds": 2}'::jsonb,
    45 + floor(random() * 20)::int,
    h.amenities || ARRAY['kids_amenities', 'extra_space', 'family_friendly'],
    CASE 
        WHEN h.star_rating = '5' THEN 250 + floor(random() * 150)::int
        WHEN h.star_rating = '4' THEN 180 + floor(random() * 120)::int
        ELSE 120 + floor(random() * 80)::int
    END,
    8 + floor(random() * 12)::int
FROM hotels h 
WHERE 'kids_club' = ANY(h.amenities) OR h.name LIKE '%Family%';

-- Accessible rooms for all hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'accessible',
    'Accessible Room',
    'ADA-compliant room designed for guests with mobility needs, featuring roll-in shower and accessible amenities',
    '{"adults": 2, "children": 1}'::jsonb,
    '{"queenBeds": 1}'::jsonb,
    30 + floor(random() * 15)::int,
    h.amenities || ARRAY['ada_compliant', 'roll_in_shower', 'accessible_bathroom'],
    CASE 
        WHEN h.star_rating = '5' THEN 280 + floor(random() * 170)::int
        WHEN h.star_rating = '4' THEN 150 + floor(random() * 130)::int
        WHEN h.star_rating = '3' THEN 100 + floor(random() * 100)::int
        ELSE 70 + floor(random() * 60)::int
    END,
    2 + floor(random() * 4)::int
FROM hotels h;

-- Presidential suites for 5-star hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'presidential',
    'Presidential Suite',
    'The ultimate luxury experience with expansive living areas, premium amenities, and personalized service',
    '{"adults": 6, "children": 4}'::jsonb,
    '{"kingBeds": 2, "sofaBeds": 1}'::jsonb,
    120 + floor(random() * 80)::int,
    h.amenities || ARRAY['butler_service', 'private_balcony', 'luxury_amenities', 'separate_dining', 'multiple_bedrooms'],
    800 + floor(random() * 700)::int,
    1 + floor(random() * 2)::int
FROM hotels h 
WHERE h.star_rating = '5';

-- =====================================================
-- STEP 3: CREATE SAMPLE USER PROFILES
-- =====================================================
-- Note: These will be created when users register through the app
-- But we can prepare some data for testing

-- =====================================================
-- STEP 4: CREATE ROOM INVENTORY DATA
-- =====================================================

-- Generate room inventory for the next 90 days
INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
SELECT 
    r.id,
    current_date + generate_series(0, 89) as date,
    r.total_rooms,
    r.total_rooms - floor(random() * (r.total_rooms * 0.3))::int as available_rooms
FROM rooms r;

-- =====================================================
-- STEP 5: CREATE SAMPLE ANALYTICS DATA
-- =====================================================

-- Insert sample search analytics (for the past 30 days)
INSERT INTO search_analytics (search_type, search_query, search_filters, results_count, search_duration_ms, created_at)
VALUES
('traditional', NULL, '{"city": "New York", "star_rating": [4,5]}', 15, 245, current_timestamp - interval '1 day'),
('traditional', NULL, '{"city": "Los Angeles", "amenities": ["pool", "spa"]}', 8, 189, current_timestamp - interval '2 days'),
('semantic', 'luxury hotel with spa in Manhattan', '{"max_price": 500}', 12, 456, current_timestamp - interval '3 days'),
('semantic', 'family friendly resort with kids club', '{"star_rating": [4,5]}', 6, 378, current_timestamp - interval '5 days'),
('traditional', NULL, '{"city": "Miami", "check_in": "2024-12-01"}', 22, 167, current_timestamp - interval '7 days'),
('semantic', 'business hotel near financial district', '{"amenities": ["business_center"]}', 18, 523, current_timestamp - interval '10 days'),
('semantic', 'romantic getaway with ocean views', '{"amenities": ["ocean_view", "spa"]}', 9, 445, current_timestamp - interval '12 days'),
('traditional', NULL, '{"city": "Chicago", "price_range": [100, 300]}', 31, 198, current_timestamp - interval '15 days'),
('semantic', 'ski resort with mountain views', '{"amenities": ["ski_access"]}', 4, 367, current_timestamp - interval '18 days'),
('traditional', NULL, '{"amenities": ["pet_friendly"], "city": "Portland"}', 7, 234, current_timestamp - interval '20 days');

-- =====================================================
-- STEP 6: USEFUL SAMPLE DATA QUERIES
-- =====================================================

-- Create a view to see all sample data
CREATE OR REPLACE VIEW sample_data_summary AS
SELECT 
    'Hotels' as data_type,
    COUNT(*)::text as count,
    'Total hotels in the system' as description
FROM hotels
UNION ALL
SELECT 
    'Rooms' as data_type,
    COUNT(*)::text as count,
    'Total rooms across all hotels' as description
FROM rooms
UNION ALL
SELECT 
    'Room Types' as data_type,
    COUNT(DISTINCT type)::text as count,
    'Different room types available' as description
FROM rooms
UNION ALL
SELECT 
    'Cities' as data_type,
    COUNT(DISTINCT location->>'city')::text as count,
    'Cities with hotels' as description
FROM hotels
UNION ALL
SELECT 
    'Star Ratings' as data_type,
    string_agg(DISTINCT star_rating::text, ', ' ORDER BY star_rating::text) as count,
    'Available star ratings' as description
FROM hotels
UNION ALL
SELECT 
    'Inventory Records' as data_type,
    COUNT(*)::text as count,
    'Room inventory records (90 days)' as description
FROM room_inventory
UNION ALL
SELECT 
    'Search Analytics' as data_type,
    COUNT(*)::text as count,
    'Sample search analytics records' as description
FROM search_analytics;

-- =====================================================
-- COMPLETION MESSAGE AND VERIFICATION QUERIES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== SAMPLE DATA SETUP COMPLETED ===';
    RAISE NOTICE 'Sample data has been successfully inserted!';
    RAISE NOTICE '';
    RAISE NOTICE 'Data Summary:';
    RAISE NOTICE '- Hotels: % total', (SELECT COUNT(*) FROM hotels);
    RAISE NOTICE '- Rooms: % total', (SELECT COUNT(*) FROM rooms);
    RAISE NOTICE '- Cities: % unique', (SELECT COUNT(DISTINCT location->>'city') FROM hotels);
    RAISE NOTICE '- Room Types: % types', (SELECT COUNT(DISTINCT type) FROM rooms);
    RAISE NOTICE '- Inventory Records: % records', (SELECT COUNT(*) FROM room_inventory);
    RAISE NOTICE '';
    RAISE NOTICE 'Verification Queries:';
    RAISE NOTICE '1. SELECT * FROM sample_data_summary;';
    RAISE NOTICE '2. SELECT name, location->>''city'' as city, star_rating FROM hotels ORDER BY star_rating DESC;';
    RAISE NOTICE '3. SELECT type, COUNT(*) as count, AVG(base_price)::decimal(10,2) as avg_price FROM rooms GROUP BY type;';
    RAISE NOTICE '4. SELECT COUNT(*) as available_dates FROM room_inventory WHERE available_rooms > 0;';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test hotel search: SELECT * FROM search_hotels_traditional(p_city => ''New York'', p_limit => 5);';
    RAISE NOTICE '2. Generate embeddings for semantic search using your API';
    RAISE NOTICE '3. Create test user accounts and bookings through your application';
END $$;

-- Test queries you can run after this script:

-- 1. View all sample data summary
-- SELECT * FROM sample_data_summary;

-- 2. See hotels by city and star rating
-- SELECT name, location->>'city' as city, star_rating, amenities 
-- FROM hotels 
-- ORDER BY star_rating DESC, location->>'city';

-- 3. Room types and pricing analysis
-- SELECT 
--     h.location->>'city' as city,
--     r.type,
--     COUNT(*) as room_count,
--     MIN(r.base_price) as min_price,
--     MAX(r.base_price) as max_price,
--     AVG(r.base_price)::decimal(10,2) as avg_price
-- FROM hotels h
-- JOIN rooms r ON h.id = r.hotel_id
-- GROUP BY h.location->>'city', r.type
-- ORDER BY city, avg_price DESC;

-- 4. Availability overview
-- SELECT 
--     COUNT(*) as total_inventory_records,
--     COUNT(*) FILTER (WHERE available_rooms > 0) as available_records,
--     AVG(available_rooms)::decimal(10,2) as avg_available_rooms
-- FROM room_inventory;

-- 5. Test traditional search
-- SELECT * FROM search_hotels_traditional(
--     p_city => 'New York',
--     p_star_rating => ARRAY[4,5],
--     p_limit => 5
-- );

-- 6. Search analytics overview
-- SELECT 
--     search_type,
--     COUNT(*) as search_count,
--     AVG(results_count) as avg_results,
--     AVG(search_duration_ms) as avg_duration_ms
-- FROM search_analytics
-- GROUP BY search_type;
