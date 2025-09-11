-- DEBUG: Check hotel and room data structure
-- Run this to understand what data is being returned

-- Check if Kandy hotels exist
SELECT 
    name,
    location->>'city' as city,
    star_rating,
    COUNT(r.id) as room_count
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.location->>'city' = 'Kandy'
GROUP BY h.id, h.name, h.location->>'city', h.star_rating
ORDER BY h.name;

-- Check room structure for Kandy hotels
SELECT 
    h.name as hotel_name,
    r.id as room_id,
    r.type,
    r.name as room_name,
    r.max_occupancy,
    r.bed_configuration,
    r.base_price,
    r.total_rooms
FROM hotels h
JOIN rooms r ON h.id = r.hotel_id
WHERE h.location->>'city' = 'Kandy'
LIMIT 5;

-- Check room inventory for Kandy hotels
SELECT 
    h.name as hotel_name,
    r.name as room_name,
    COUNT(ri.id) as inventory_count,
    MIN(ri.date) as earliest_date,
    MAX(ri.date) as latest_date,
    AVG(ri.available_rooms) as avg_available
FROM hotels h
JOIN rooms r ON h.id = r.hotel_id
LEFT JOIN room_inventory ri ON r.id = ri.room_id
WHERE h.location->>'city' = 'Kandy'
GROUP BY h.id, h.name, r.id, r.name
LIMIT 5;

-- Simple test: What would the basic Supabase query return?
SELECT 
    h.*,
    json_agg(r.*) as rooms
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.location->>'city' ILIKE '%Kandy%'
GROUP BY h.id
LIMIT 1;
