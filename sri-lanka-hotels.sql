-- =====================================================
-- SRI LANKA HOTELS - ADDITIONAL SAMPLE DATA
-- =====================================================
-- Add Sri Lankan hotels including Kandy for testing

INSERT INTO hotels (name, description, star_rating, location, amenities, images, contact_info, policies) VALUES

-- Kandy Hotels
(
    'Kandy Lake Resort',
    'Luxurious lakefront resort overlooking the sacred Kandy Lake and Temple of the Tooth. Experience Sri Lankan hospitality with modern amenities, traditional cuisine, and stunning mountain views.',
    '5',
    '{"latitude": 7.2906, "longitude": 80.6337, "address": "123 Lake View Road", "city": "Kandy", "state": "Central Province", "country": "Sri Lanka", "postalCode": "20000"}',
    ARRAY['wifi', 'parking', 'pool', 'spa', 'restaurant', 'bar', 'fitness_center', 'lake_view', 'cultural_tours', 'traditional_spa'],
    ARRAY['https://example.com/kandy-lake-resort-1.jpg', 'https://example.com/kandy-lake-resort-2.jpg', 'https://example.com/kandy-lake-resort-3.jpg'],
    '{"phone": "+94-81-555-0101", "email": "reservations@kandylakeresort.lk", "website": "https://kandylakeresort.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Small pets allowed with prior arrangement", "smokingPolicy": "Non-smoking property"}'
),

(
    'Temple View Heritage Hotel',
    'Boutique heritage hotel with panoramic views of the Temple of the Tooth. Blend of colonial architecture and modern comfort, featuring authentic Sri Lankan cuisine and cultural experiences.',
    '4',
    '{"latitude": 7.2935, "longitude": 80.6378, "address": "456 Temple Street", "city": "Kandy", "state": "Central Province", "country": "Sri Lanka", "postalCode": "20000"}',
    ARRAY['wifi', 'parking', 'restaurant', 'bar', 'cultural_tours', 'temple_view', 'heritage_architecture', 'traditional_cuisine'],
    ARRAY['https://example.com/temple-view-hotel-1.jpg', 'https://example.com/temple-view-hotel-2.jpg'],
    '{"phone": "+94-81-555-0102", "email": "info@templeviewhotel.lk", "website": "https://templeviewhotel.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 48 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Designated smoking areas"}'
),

(
    'Royal Botanical Garden Lodge',
    'Peaceful retreat near the famous Peradeniya Botanical Gardens. Perfect for nature lovers with lush garden views, bird watching, and easy access to Kandy''s attractions.',
    '3',
    '{"latitude": 7.2693, "longitude": 80.5967, "address": "789 Botanical Garden Road", "city": "Kandy", "state": "Central Province", "country": "Sri Lanka", "postalCode": "20400"}',
    ARRAY['wifi', 'parking', 'restaurant', 'garden_view', 'nature_tours', 'bird_watching', 'botanical_garden_access'],
    ARRAY['https://example.com/botanical-lodge-1.jpg', 'https://example.com/botanical-lodge-2.jpg'],
    '{"phone": "+94-81-555-0103", "email": "bookings@botanicallodge.lk", "website": "https://botanicallodge.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Pets welcome with advance notice", "smokingPolicy": "Non-smoking property"}'
),

-- Colombo Hotels
(
    'Colombo Grand Hotel',
    'Iconic luxury hotel in the heart of Colombo''s business district. Features world-class amenities, multiple dining options, and stunning views of the Indian Ocean.',
    '5',
    '{"latitude": 6.9271, "longitude": 79.8612, "address": "100 Galle Face Green", "city": "Colombo", "state": "Western Province", "country": "Sri Lanka", "postalCode": "00100"}',
    ARRAY['wifi', 'valet_parking', 'pool', 'spa', 'fitness_center', 'restaurant', 'bar', 'business_center', 'ocean_view', 'shopping_access'],
    ARRAY['https://example.com/colombo-grand-1.jpg', 'https://example.com/colombo-grand-2.jpg', 'https://example.com/colombo-grand-3.jpg'],
    '{"phone": "+94-11-555-0201", "email": "reservations@colombogrand.lk", "website": "https://colombogrand.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 48 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Non-smoking property"}'
),

-- Galle Hotels
(
    'Galle Fort Heritage Hotel',
    'Historic boutique hotel within the UNESCO World Heritage Galle Fort. Experience 400 years of history with modern luxury, overlooking the Indian Ocean.',
    '4',
    '{"latitude": 6.0329, "longitude": 80.2168, "address": "25 Church Street, Galle Fort", "city": "Galle", "state": "Southern Province", "country": "Sri Lanka", "postalCode": "80000"}',
    ARRAY['wifi', 'parking', 'restaurant', 'bar', 'heritage_architecture', 'fort_view', 'ocean_view', 'cultural_tours', 'historic_charm'],
    ARRAY['https://example.com/galle-fort-1.jpg', 'https://example.com/galle-fort-2.jpg'],
    '{"phone": "+94-91-555-0301", "email": "info@galleforthotel.lk", "website": "https://galleforthotel.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Small pets allowed with fee", "smokingPolicy": "Non-smoking property"}'
),

-- Ella Hotels  
(
    'Ella Mountain View Resort',
    'Spectacular mountain resort with breathtaking views of Ella Rock and Little Adam''s Peak. Perfect base for hiking, tea plantation visits, and Nine Arch Bridge photography.',
    '4',
    '{"latitude": 6.8704, "longitude": 81.0463, "address": "Hill Top Road", "city": "Ella", "state": "Uva Province", "country": "Sri Lanka", "postalCode": "90090"}',
    ARRAY['wifi', 'parking', 'restaurant', 'mountain_view', 'hiking_tours', 'tea_plantation_tours', 'photography_spots', 'nature_activities'],
    ARRAY['https://example.com/ella-mountain-1.jpg', 'https://example.com/ella-mountain-2.jpg'],
    '{"phone": "+94-57-555-0401", "email": "bookings@ellamountainview.lk", "website": "https://ellamountainview.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 24 hours before check-in", "petPolicy": "Pets welcome", "smokingPolicy": "Designated smoking areas"}'
),

-- Nuwara Eliya Hotels
(
    'Hill Country Grand Hotel',
    'Colonial-era grand hotel in Sri Lanka''s hill capital. Experience cool climate, tea country charm, and British colonial heritage with modern luxury amenities.',
    '4',
    '{"latitude": 6.9497, "longitude": 80.7891, "address": "Grand Hotel Road", "city": "Nuwara Eliya", "state": "Central Province", "country": "Sri Lanka", "postalCode": "22200"}',
    ARRAY['wifi', 'parking', 'restaurant', 'bar', 'golf_course', 'colonial_architecture', 'tea_plantation_tours', 'cool_climate', 'heritage_charm'],
    ARRAY['https://example.com/nuwara-eliya-grand-1.jpg', 'https://example.com/nuwara-eliya-grand-2.jpg'],
    '{"phone": "+94-52-555-0501", "email": "reservations@hillcountrygrand.lk", "website": "https://hillcountrygrand.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 48 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Smoking rooms available"}'
),

-- Sigiriya Hotels
(
    'Sigiriya Rock Resort',
    'Luxury eco-resort with stunning views of the ancient Sigiriya Rock Fortress. Combining modern comfort with authentic Sri Lankan culture and wildlife experiences.',
    '5',
    '{"latitude": 7.9568, "longitude": 80.7592, "address": "Ancient City Road", "city": "Sigiriya", "state": "Central Province", "country": "Sri Lanka", "postalCode": "21120"}',
    ARRAY['wifi', 'parking', 'pool', 'spa', 'restaurant', 'bar', 'rock_fortress_view', 'wildlife_safari', 'cultural_tours', 'eco_friendly'],
    ARRAY['https://example.com/sigiriya-rock-1.jpg', 'https://example.com/sigiriya-rock-2.jpg', 'https://example.com/sigiriya-rock-3.jpg'],
    '{"phone": "+94-66-555-0601", "email": "info@sigiriyarock.lk", "website": "https://sigiriyarock.lk"}',
    '{"cancellationPolicy": "Free cancellation up to 72 hours before check-in", "petPolicy": "No pets allowed", "smokingPolicy": "Non-smoking property"}'
);

-- Add rooms for Sri Lankan hotels
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
        WHEN h.location->>'city' = 'Kandy' THEN 'Spacious room with panoramic views of Kandy Lake and surrounding mountains'
        WHEN h.location->>'city' = 'Colombo' THEN 'Modern room with stunning Indian Ocean views and city skyline'
        WHEN h.location->>'city' = 'Galle' THEN 'Historic room within fort walls with ocean and rampart views'
        WHEN h.location->>'city' = 'Ella' THEN 'Cozy room with spectacular mountain and tea plantation views'
        WHEN h.location->>'city' = 'Nuwara Eliya' THEN 'Colonial-style room with garden views and cool mountain air'
        WHEN h.location->>'city' = 'Sigiriya' THEN 'Luxury room with views of the ancient rock fortress'
        ELSE 'Comfortable room with local charm'
    END,
    '{"adults": 2, "children": 1}'::jsonb,
    CASE 
        WHEN random() > 0.5 THEN '{"kingBeds": 1}'::jsonb
        ELSE '{"queenBeds": 1}'::jsonb
    END,
    30 + floor(random() * 25)::int,
    CASE 
        WHEN h.star_rating = '5' THEN ARRAY['wifi', 'tv', 'mini_bar', 'safe', 'balcony', 'premium_linens', 'air_conditioning']
        WHEN h.star_rating = '4' THEN ARRAY['wifi', 'tv', 'safe', 'balcony', 'air_conditioning', 'coffee_maker']
        ELSE ARRAY['wifi', 'tv', 'fan', 'balcony']
    END,
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 120 + floor(random() * 80)::int
        WHEN h.star_rating = '5' THEN 80 + floor(random() * 120)::int
        WHEN h.star_rating = '4' THEN 50 + floor(random() * 80)::int
        ELSE 25 + floor(random() * 50)::int
    END,
    15 + floor(random() * 20)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka';

-- Add standard rooms as well
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'standard',
    'Standard Room',
    'Comfortable standard room with essential amenities and local charm',
    '{"adults": 2, "children": 1}'::jsonb,
    CASE 
        WHEN random() > 0.5 THEN '{"queenBeds": 1}'::jsonb
        ELSE '{"twinBeds": 2}'::jsonb
    END,
    20 + floor(random() * 15)::int,
    CASE 
        WHEN h.star_rating = '5' THEN ARRAY['wifi', 'tv', 'safe', 'air_conditioning']
        WHEN h.star_rating = '4' THEN ARRAY['wifi', 'tv', 'air_conditioning']
        ELSE ARRAY['wifi', 'tv', 'fan']
    END,
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 80 + floor(random() * 40)::int
        WHEN h.star_rating = '5' THEN 60 + floor(random() * 60)::int
        WHEN h.star_rating = '4' THEN 35 + floor(random() * 45)::int
        ELSE 20 + floor(random() * 30)::int
    END,
    20 + floor(random() * 25)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka';

-- Add suite rooms for luxury hotels
INSERT INTO rooms (hotel_id, type, name, description, max_occupancy, bed_configuration, size, amenities, base_price, total_rooms)
SELECT 
    h.id,
    'suite',
    CASE 
        WHEN h.location->>'city' = 'Kandy' THEN 'Royal Lake Suite'
        WHEN h.location->>'city' = 'Colombo' THEN 'Presidential Ocean Suite'
        WHEN h.location->>'city' = 'Sigiriya' THEN 'Royal Rock Suite'
        ELSE 'Executive Suite'
    END,
    'Luxurious suite with separate living area, premium amenities, and breathtaking views',
    '{"adults": 4, "children": 2}'::jsonb,
    '{"kingBeds": 1, "sofaBeds": 1}'::jsonb,
    60 + floor(random() * 40)::int,
    h.amenities || ARRAY['living_room', 'premium_amenities', 'butler_service', 'private_balcony'],
    CASE 
        WHEN h.location->>'city' = 'Colombo' THEN 200 + floor(random() * 150)::int
        WHEN h.star_rating = '5' THEN 150 + floor(random() * 200)::int
        ELSE 100 + floor(random() * 100)::int
    END,
    5 + floor(random() * 8)::int
FROM hotels h 
WHERE h.location->>'country' = 'Sri Lanka' AND h.star_rating IN ('4', '5');

-- Generate room inventory for Sri Lankan hotels
INSERT INTO room_inventory (room_id, date, total_rooms, available_rooms)
SELECT 
    r.id,
    current_date + generate_series(0, 89) as date,
    r.total_rooms,
    r.total_rooms - floor(random() * (r.total_rooms * 0.2))::int as available_rooms
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
WHERE h.location->>'country' = 'Sri Lanka';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== SRI LANKA HOTELS ADDED SUCCESSFULLY ===';
    RAISE NOTICE 'Added hotels in: Kandy, Colombo, Galle, Ella, Nuwara Eliya, Sigiriya';
    RAISE NOTICE 'Total Sri Lankan hotels: %', (SELECT COUNT(*) FROM hotels WHERE location->>'country' = 'Sri Lanka');
    RAISE NOTICE 'Total rooms added: %', (SELECT COUNT(*) FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE h.location->>'country' = 'Sri Lanka');
    RAISE NOTICE '';
    RAISE NOTICE 'Test Kandy search: http://localhost:3000/api/v1/hotels/search?city=Kandy&checkIn=2025-09-11&checkOut=2025-09-12&adults=2';
END $$;
