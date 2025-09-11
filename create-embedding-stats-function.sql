-- Create helper function to check embedding statistics
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
