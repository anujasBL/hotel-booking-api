-- Check the actual data types in the hotels table
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotels' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what enum types exist
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%amenity%' OR t.typname LIKE '%hotel%'
ORDER BY t.typname, e.enumsortorder;

-- Check the actual structure of hotels table
\d hotels;
