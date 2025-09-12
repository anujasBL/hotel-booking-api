-- =====================================================
-- SUPABASE STORAGE SETUP FOR HOTEL IMAGES
-- =====================================================
-- This script sets up Supabase Storage for hotel images
-- Run this in Supabase SQL Editor to create storage buckets and policies

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKETS
-- =====================================================

-- Create bucket for hotel images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hotel-images',
    'hotel-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create bucket for room images (optional)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'room-images',
    'room-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- =====================================================
-- STEP 2: CREATE STORAGE POLICIES
-- =====================================================

-- Allow public read access to hotel images
CREATE POLICY "Public can view hotel images" ON storage.objects
FOR SELECT USING (bucket_id = 'hotel-images');

-- Allow authenticated users to upload hotel images
CREATE POLICY "Authenticated users can upload hotel images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'hotel-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update hotel images
CREATE POLICY "Authenticated users can update hotel images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'hotel-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete hotel images
CREATE POLICY "Authenticated users can delete hotel images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'hotel-images' 
    AND auth.role() = 'authenticated'
);

-- Similar policies for room images
CREATE POLICY "Public can view room images" ON storage.objects
FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Authenticated users can upload room images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'room-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update room images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'room-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete room images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'room-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 3: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique file path for hotel images
CREATE OR REPLACE FUNCTION generate_hotel_image_path(hotel_id uuid, image_index int, file_extension text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT CONCAT(
        'hotels/',
        hotel_id::text,
        '/',
        'image_',
        image_index,
        '.',
        file_extension
    );
$$;

-- =====================================================
-- STEP 4: CREATE IMAGE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to add image to hotel
CREATE OR REPLACE FUNCTION add_hotel_image(
    p_hotel_id uuid,
    p_image_url text,
    p_image_index int DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    current_images text[];
    new_images text[];
BEGIN
    -- Get current images
    SELECT images INTO current_images FROM hotels WHERE id = p_hotel_id;
    
    -- If no index specified, append to end
    IF p_image_index IS NULL THEN
        new_images := current_images || ARRAY[p_image_url];
    ELSE
        -- Insert at specific index (1-based)
        new_images := array_insert(current_images, p_image_index, p_image_url);
    END IF;
    
    -- Update hotel with new images
    UPDATE hotels SET images = new_images WHERE id = p_hotel_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Function to remove image from hotel
CREATE OR REPLACE FUNCTION remove_hotel_image(
    p_hotel_id uuid,
    p_image_index int
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    current_images text[];
    new_images text[];
BEGIN
    -- Get current images
    SELECT images INTO current_images FROM hotels WHERE id = p_hotel_id;
    
    -- Remove image at index (1-based)
    new_images := array_remove_at(current_images, p_image_index);
    
    -- Update hotel with new images
    UPDATE hotels SET images = new_images WHERE id = p_hotel_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== SUPABASE STORAGE SETUP COMPLETE ===';
    RAISE NOTICE '✅ Created storage buckets: hotel-images, room-images';
    RAISE NOTICE '✅ Set up public read access policies';
    RAISE NOTICE '✅ Set up authenticated user upload/update/delete policies';
    RAISE NOTICE '✅ Created helper functions for image management';
    RAISE NOTICE '';
    RAISE NOTICE 'Storage buckets created:';
    RAISE NOTICE '• hotel-images: For hotel photos (public read, authenticated write)';
    RAISE NOTICE '• room-images: For room photos (public read, authenticated write)';
    RAISE NOTICE '';
    RAISE NOTICE 'File limits:';
    RAISE NOTICE '• Max file size: 5MB';
    RAISE NOTICE '• Allowed types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Upload images using Supabase Dashboard or API';
    RAISE NOTICE '2. Use the helper functions to manage image URLs';
    RAISE NOTICE '3. Test image uploads and retrieval';
END $$;
