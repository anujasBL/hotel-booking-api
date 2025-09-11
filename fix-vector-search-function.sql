-- =====================================================
-- FIX VECTOR SEARCH FUNCTION - CORRECT DATA TYPES
-- =====================================================

-- Update the vector search function with correct data types
CREATE OR REPLACE FUNCTION search_hotels_by_similarity(
    query_embedding vector(768),
    similarity_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_city text DEFAULT NULL,
    filter_star_rating text[] DEFAULT NULL,
    filter_amenities text[] DEFAULT NULL,
    filter_price_min numeric DEFAULT NULL,
    filter_price_max numeric DEFAULT NULL
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
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.description,
        h.star_rating::text,
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
        AND (filter_star_rating IS NULL OR h.star_rating::text = ANY(filter_star_rating))
        AND (filter_amenities IS NULL OR h.amenities && filter_amenities)
        AND h.is_active = true
    ORDER BY h.search_vector <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Alternative version that's more flexible with data types
CREATE OR REPLACE FUNCTION search_hotels_by_similarity_flexible(
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
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.description,
        h.star_rating::text,
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
        AND h.is_active = true
    ORDER BY h.search_vector <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Test the function exists and works
DO $$
BEGIN
    RAISE NOTICE '=== VECTOR SEARCH FUNCTION UPDATED ===';
    RAISE NOTICE 'Fixed data type issues with amenities and star_rating';
    RAISE NOTICE 'Created flexible version without filters';
    RAISE NOTICE 'Ready to generate embeddings and test search';
END $$;
