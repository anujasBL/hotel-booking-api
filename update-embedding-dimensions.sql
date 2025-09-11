-- =====================================================
-- UPDATE EMBEDDING DIMENSIONS FOR GOOGLE GEMINI
-- =====================================================
-- Google Gemini text-embedding-004 produces 768-dimensional embeddings
-- while OpenAI ada-002 produces 1536-dimensional embeddings

-- Update the vector search function to use 768 dimensions
CREATE OR REPLACE FUNCTION search_hotels_by_similarity(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_city text DEFAULT NULL,
    filter_star_rating int[] DEFAULT NULL,
    filter_amenities text[] DEFAULT NULL,
    filter_price_min numeric DEFAULT NULL,
    filter_price_max numeric DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    star_rating star_rating,
    location jsonb,
    amenities hotel_amenity[],
    images text[],
    contact_info jsonb,
    policies jsonb,
    search_vector vector(768),
    similarity float
)
LANGUAGE plpgsql
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
        h.contact_info,
        h.policies,
        h.search_vector,
        (h.search_vector <=> query_embedding) * -1 + 1 AS similarity
    FROM hotels h
    WHERE 
        h.search_vector IS NOT NULL
        AND (1 - (h.search_vector <=> query_embedding)) >= similarity_threshold
        AND (filter_city IS NULL OR h.location->>'city' ILIKE '%' || filter_city || '%')
        AND (filter_star_rating IS NULL OR h.star_rating::text::int = ANY(filter_star_rating))
        AND (filter_amenities IS NULL OR h.amenities && filter_amenities::hotel_amenity[])
        AND h.is_active = true
    ORDER BY h.search_vector <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update hotels table to use vector(768) instead of vector(1536)
-- First, drop the existing column if it exists
ALTER TABLE hotels DROP COLUMN IF EXISTS search_vector CASCADE;

-- Add the new column with correct dimensions
ALTER TABLE hotels ADD COLUMN search_vector vector(768);

-- Create index for the new vector column
CREATE INDEX IF NOT EXISTS idx_hotels_search_vector_768 
ON hotels USING ivfflat (search_vector vector_cosine_ops) 
WITH (lists = 100);

-- Update the hotel search view to include the new vector column
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== EMBEDDING DIMENSIONS UPDATED FOR GOOGLE GEMINI ===';
    RAISE NOTICE 'Updated vector dimensions from 1536 to 768';
    RAISE NOTICE 'Updated search_hotels_by_similarity function';
    RAISE NOTICE 'Updated hotels.search_vector column';
    RAISE NOTICE 'Created new vector index';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env file with GOOGLE_GEMINI_API_KEY';
    RAISE NOTICE '2. Test the connection: node test-gemini-connection.js';
    RAISE NOTICE '3. Generate new embeddings for existing hotels';
END $$;
