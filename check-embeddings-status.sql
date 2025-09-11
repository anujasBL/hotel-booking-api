-- Check current embedding status
SELECT 
    COUNT(*) as total_hotels,
    COUNT(search_vector) as hotels_with_embeddings,
    COUNT(*) - COUNT(search_vector) as hotels_without_embeddings,
    COUNT(search_vector)::float / COUNT(*) * 100 as embedding_percentage
FROM hotels 
WHERE location->>'country' = 'Sri Lanka';

-- Check specific Kandy hotels
SELECT 
    name,
    location->>'city' as city,
    CASE 
        WHEN search_vector IS NOT NULL THEN 'Has Embedding'
        ELSE 'Missing Embedding'
    END as embedding_status
FROM hotels 
WHERE location->>'city' = 'Kandy'
ORDER BY name;

-- Check if the vector search function exists with correct dimensions
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'search_hotels_by_similarity';
