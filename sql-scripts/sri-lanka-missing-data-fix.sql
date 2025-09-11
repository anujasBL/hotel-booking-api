-- =====================================================
-- SRI LANKA HOTELS - MISSING DATA FIX SCRIPT
-- =====================================================
-- This script adds missing rooms and inventory for Sri Lankan hotels
-- Run this AFTER the sri-lanka-hotels-extended.sql script

-- =====================================================
-- STEP 1: CHECK CURRENT STATUS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== CHECKING CURRENT STATUS ===';
    RAISE NOTICE 'Sri Lankan hotels found: %', (SELECT COUNT(*) FROM hotels WHERE location->>'country' = 'Sri Lanka');
    RAISE NOTICE 'Sri Lankan hotels with rooms: %', (SELECT COUNT(DISTINCT h.id) FROM hotels h JOIN rooms r ON h.id = r.hotel_id WHERE h.location->>'country' = 'Sri Lanka');
    RAISE NOTICE 'Sri Lankan hotels without rooms: %', (SELECT COUNT(*) FROM hotels h WHERE h.location->>'country' = 'Sri Lanka' AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id));
    RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 2: ADD DELUXE ROOMS FOR ALL SRI LANKAN HOTELS
-- =====================================================

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'deluxe',
    CASE 
        WHEN h.location->>'city' = 'Kandy' THEN 'Deluxe Lake View Room'
        WHEN h.location->>'city' = 'Colombo' THEN 'Deluxe Ocean View Room'
        WHEN h.location->>'city' = 'Galle' THEN 'Deluxe Fort View Room'
        WHEN h.location->>'city' = 'Ella' THEN 'Deluxe Mountain View Room'
        WHEN h.location->>'city' = 'Nuwara Eliya' THEN 'Deluxe Garden View Room'
        WHEN h.location->>'city' = 'Sigiriya' THEN 'Deluxe Rock View Room'
        ELSE 'Deluxe Room'
    END,
    CASE 
        WHEN h.location->>'city' = 'Kandy' THEN 'Spacious room with panoramic views of Kandy Lake and surrounding mountains. Features traditional Sri Lankan design with modern amenities.'
        WHEN h.location->>'city' = 'Colombo' THEN 'Modern room with stunning Indian Ocean views and city skyline. Perfect for business and leisure travelers.'
        WHEN h.location->>'city' = 'Galle' THEN 'Historic room within fort walls with ocean and rampart views. Colonial charm meets modern comfort.'
        WHEN h.location->>'city' = 'Ella' THEN 'Cozy room with spectacular mountain and tea plantation views. Cool climate and fresh mountain air.'
        WHEN h.location->>'city' = 'Nuwara Eliya' THEN 'Colonial-style room with garden views and cool mountain air. Perfect for tea country exploration.'
        WHEN h.location->>'city' = 'Sigiriya' THEN 'Luxury room with views of the ancient rock fortress. Cultural heritage meets modern luxury.'
        ELSE 'Comfortable room with local charm and beautiful views'
    END,
    '{"adults": 2, "children": 1}'::jsonb,
    CASE 
        WHEN random() > 0.5 THEN '{"kingBeds": 1}'::jsonb
        ELSE '{"queenBeds": 1}'::jsonb
    END,
    30 + floor(random() * 25)::int,
    CASE 
        WHEN h.star_rating = '5' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'balcony', 'premium_linens', 'air_conditioning', 'room_service']
        WHEN h.star_rating = '4' THEN ARRAY['wifi', 'tv', 'safe', 'balcony', 'air_conditioning', 'coffee_maker', 'work_desk']
        WHEN h.star_rating = '3' THEN ARRAY['wifi', 'tv', 'air_conditioning', 'balcony']
        ELSE ARRAY['wifi', 'tv', 'fan', 'balcony']
    END,
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 150 + floor(random() * 100)::int
        WHEN h.star_rating = '5' THEN 120 + floor(random() * 130)::int
        WHEN h.star_rating = '4' THEN 80 + floor(random() * 90)::int
        WHEN h.star_rating = '3' THEN 50 + floor(random() * 60)::int
        ELSE 30 + floor(random() * 40)::int
    END,
    15 + floor(random() * 20)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka'
AND NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.type = 'deluxe'
);

-- =====================================================
-- STEP 3: ADD STANDARD ROOMS FOR ALL SRI LANKAN HOTELS
-- =====================================================

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'standard',
    'Standard Room',
    CONCAT(
        'Comfortable standard room with essential amenities and beautiful ',
        CASE 
            WHEN h.location->>'city' IN ('Kandy', 'Ella', 'Nuwara Eliya', 'Sigiriya') THEN 'mountain views'
            WHEN h.location->>'city' IN ('Colombo', 'Galle') THEN 'ocean views'
            ELSE 'local views'
        END,
        '. Perfect for budget-conscious travelers seeking comfort.'
    ),
    '{"adults": 2, "children": 1}'::jsonb,
    CASE 
        WHEN random() > 0.6 THEN '{"queenBeds": 1}'::jsonb
        WHEN random() > 0.3 THEN '{"twinBeds": 2}'::jsonb
        ELSE '{"kingBeds": 1}'::jsonb
    END,
    20 + floor(random() * 15)::int,
    CASE 
        WHEN h.star_rating = '5' THEN ARRAY['wifi', 'tv', 'safe', 'air_conditioning', 'coffee_maker']
        WHEN h.star_rating = '4' THEN ARRAY['wifi', 'tv', 'air_conditioning', 'coffee_maker']
        WHEN h.star_rating = '3' THEN ARRAY['wifi', 'tv', 'air_conditioning']
        ELSE ARRAY['wifi', 'tv', 'fan']
    END,
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 100 + floor(random() * 50)::int
        WHEN h.star_rating = '5' THEN 80 + floor(random() * 70)::int
        WHEN h.star_rating = '4' THEN 50 + floor(random() * 60)::int
        WHEN h.star_rating = '3' THEN 35 + floor(random() * 40)::int
        ELSE 25 + floor(random() * 30)::int
    END,
    20 + floor(random() * 30)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka'
AND NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.type = 'standard'
);

-- =====================================================
-- STEP 4: ADD SUITE ROOMS FOR 4-5 STAR HOTELS
-- =====================================================

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'suite',
    CASE 
        WHEN h.location->>'city' = 'Kandy' THEN 'Royal Lake Suite'
        WHEN h.location->>'city' = 'Colombo' THEN 'Presidential Ocean Suite'
        WHEN h.location->>'city' = 'Galle' THEN 'Heritage Fort Suite'
        WHEN h.location->>'city' = 'Ella' THEN 'Mountain Vista Suite'
        WHEN h.location->>'city' = 'Nuwara Eliya' THEN 'Colonial Garden Suite'
        WHEN h.location->>'city' = 'Sigiriya' THEN 'Royal Rock Suite'
        ELSE 'Executive Suite'
    END,
    CONCAT(
        'Luxurious suite with separate living area, premium amenities, and breathtaking views of ', 
        h.location->>'city', 
        '. Perfect for special occasions, honeymoons, and VIP guests seeking ultimate comfort and privacy.'
    ),
    '{"adults": 4, "children": 2}'::jsonb,
    '{"kingBeds": 1, "sofaBeds": 1}'::jsonb,
    60 + floor(random() * 40)::int,
    h.amenities || ARRAY['living_room', 'premium_amenities', 'butler_service', 'private_balcony', 'separate_dining', 'luxury_bathroom'],
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 300 + floor(random() * 200)::int
        WHEN h.star_rating = '5' THEN 250 + floor(random() * 250)::int
        ELSE 180 + floor(random() * 150)::int
    END,
    3 + floor(random() * 5)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka' 
AND h.star_rating IN ('4', '5')
AND NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.type = 'suite'
);

-- =====================================================
-- STEP 5: ADD FAMILY ROOMS FOR SELECTED HOTELS
-- =====================================================

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'family',
    'Family Room',
    CONCAT(
        'Spacious family room perfect for families with children. Features separate sleeping areas, extra space for luggage, and kid-friendly amenities. Located in ', 
        h.location->>'city', 
        ' with easy access to family attractions.'
    ),
    '{"adults": 4, "children": 4}'::jsonb,
    '{"queenBeds": 1, "twinBeds": 2}'::jsonb,
    45 + floor(random() * 20)::int,
    h.amenities || ARRAY['extra_space', 'family_friendly', 'kids_amenities', 'connecting_rooms'],
    CASE 
        WHEN h.star_rating = '5' THEN 200 + floor(random() * 100)::int
        WHEN h.star_rating = '4' THEN 140 + floor(random() * 80)::int
        ELSE 100 + floor(random() * 60)::int
    END,
    5 + floor(random() * 8)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka'
AND (
    'kids_club' = ANY(h.amenities) OR 
    'family_friendly' = ANY(h.amenities) OR 
    'playground' = ANY(h.amenities) OR
    h.location->>'city' IN ('Kandy', 'Colombo', 'Ella')
)
AND NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.type = 'family'
);

-- =====================================================
-- STEP 6: GENERATE ROOM INVENTORY FOR 90 DAYS
-- =====================================================

INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
SELECT 
    r.id,
    current_date + generate_series(0, 89) as date,
    r.total_rooms,
    GREATEST(
        1, -- Always keep at least 1 room available
        r.total_rooms - floor(random() * (r.total_rooms * 0.25))::int
    ) as available_rooms
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
WHERE h.location->>'country' = 'Sri Lanka'
AND NOT EXISTS (
    SELECT 1 FROM room_inventory ri 
    WHERE ri.room_id = r.id 
    AND ri.date = current_date
);

-- =====================================================
-- STEP 7: ADD ACCESSIBLE ROOMS FOR ALL HOTELS
-- =====================================================

INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'accessible',
    'Accessible Room',
    CONCAT(
        'ADA-compliant room designed for guests with mobility needs. Features roll-in shower, accessible bathroom fixtures, and barrier-free access. Located in ', 
        h.location->>'city', 
        ' with full accessibility features.'
    ),
    '{"adults": 2, "children": 1}'::jsonb,
    '{"queenBeds": 1}'::jsonb,
    25 + floor(random() * 10)::int,
    h.amenities || ARRAY['ada_compliant', 'roll_in_shower', 'accessible_bathroom', 'grab_bars', 'wheelchair_accessible'],
    CASE 
        WHEN h.star_rating = '5' THEN 120 + floor(random() * 80)::int
        WHEN h.star_rating = '4' THEN 80 + floor(random() * 60)::int
        WHEN h.star_rating = '3' THEN 55 + floor(random() * 45)::int
        ELSE 35 + floor(random() * 30)::int
    END,
    2 + floor(random() * 3)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka'
AND NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.type = 'accessible'
);

-- =====================================================
-- STEP 8: ADD INVENTORY FOR NEW ACCESSIBLE ROOMS
-- =====================================================

INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
SELECT 
    r.id,
    current_date + generate_series(0, 89) as date,
    r.total_rooms,
    GREATEST(
        1, 
        r.total_rooms - floor(random() * (r.total_rooms * 0.15))::int
    ) as available_rooms
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
WHERE h.location->>'country' = 'Sri Lanka'
AND r.type = 'accessible'
AND NOT EXISTS (
    SELECT 1 FROM room_inventory ri 
    WHERE ri.room_id = r.id 
    AND ri.date = current_date
);

-- =====================================================
-- STEP 9: VERIFICATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
    hotel_count INTEGER;
    room_count INTEGER;
    inventory_count INTEGER;
    kandy_hotels INTEGER;
    cities_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO hotel_count FROM hotels WHERE location->>'country' = 'Sri Lanka';
    SELECT COUNT(*) INTO room_count FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE h.location->>'country' = 'Sri Lanka';
    SELECT COUNT(*) INTO inventory_count FROM room_inventory ri JOIN rooms r ON ri.room_id = r.id JOIN hotels h ON r.hotel_id = h.id WHERE h.location->>'country' = 'Sri Lanka';
    SELECT COUNT(*) INTO kandy_hotels FROM hotels WHERE location->>'city' = 'Kandy';
    SELECT COUNT(DISTINCT location->>'city') INTO cities_count FROM hotels WHERE location->>'country' = 'Sri Lanka';
    
    RAISE NOTICE '=== SRI LANKA HOTELS - MISSING DATA FIX COMPLETED ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 FINAL STATISTICS:';
    RAISE NOTICE '🏨 Total Sri Lankan Hotels: %', hotel_count;
    RAISE NOTICE '🛏️  Total Rooms Created: %', room_count;
    RAISE NOTICE '📅 Total Inventory Records: %', inventory_count;
    RAISE NOTICE '🌸 Kandy Hotels: %', kandy_hotels;
    RAISE NOTICE '🌍 Cities Covered: %', cities_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ READY TO TEST:';
    RAISE NOTICE 'Use port 3000 (not 3001) for your API calls:';
    RAISE NOTICE 'http://localhost:3000/api/v1/hotels/search?city=Kandy&checkIn=2025-09-11&checkOut=2025-09-12&adults=2&children=0&rooms=1';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 OTHER TEST CITIES:';
    RAISE NOTICE '• Colombo: http://localhost:3000/api/v1/hotels/search?city=Colombo&checkIn=2025-09-11&checkOut=2025-09-12&adults=2';
    RAISE NOTICE '• Galle: http://localhost:3000/api/v1/hotels/search?city=Galle&checkIn=2025-09-11&checkOut=2025-09-12&adults=2';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- STEP 10: DETAILED BREAKDOWN BY CITY AND HOTEL
-- =====================================================

-- Show summary by city
SELECT 
    location->>'city' as city,
    COUNT(*) as hotel_count,
    MIN(star_rating::text::int) as min_stars,
    MAX(star_rating::text::int) as max_stars,
    ROUND(AVG(star_rating::text::int), 1) as avg_stars,
    string_agg(DISTINCT star_rating::text, ', ' ORDER BY star_rating::text) as star_ratings
FROM hotels 
WHERE location->>'country' = 'Sri Lanka'
GROUP BY location->>'city'
ORDER BY hotel_count DESC, city;

-- Show Kandy hotels details
SELECT 
    h.name,
    h.star_rating,
    COUNT(DISTINCT r.id) as room_count,
    COUNT(DISTINCT r.type) as room_types,
    string_agg(DISTINCT r.type::text, ', ' ORDER BY r.type::text) as available_room_types,
    COUNT(ri.id) as inventory_records,
    MIN(r.base_price) as min_price,
    MAX(r.base_price) as max_price
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
LEFT JOIN room_inventory ri ON r.id = ri.room_id
WHERE h.location->>'city' = 'Kandy'
GROUP BY h.id, h.name, h.star_rating
ORDER BY h.star_rating DESC, h.name;

-- Show room type distribution
SELECT 
    r.type,
    COUNT(*) as room_count,
    ROUND(AVG(r.base_price), 2) as avg_price,
    MIN(r.base_price) as min_price,
    MAX(r.base_price) as max_price,
    COUNT(DISTINCT h.location->>'city') as cities_available
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
WHERE h.location->>'country' = 'Sri Lanka'
GROUP BY r.type
ORDER BY avg_price DESC;

-- Final success message
SELECT 
    '🎉 SUCCESS: Sri Lankan hotels are now ready with rooms and inventory!' as status,
    'Use port 3000 for API calls' as important_note,
    'Test with Kandy, Colombo, or other Sri Lankan cities' as next_step;
