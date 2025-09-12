#!/usr/bin/env node

/**
 * Update Hotel Images Array Script
 * Updates the images array in the hotels table with newly uploaded image URLs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'hotel-images';

// Function to get all hotels with their current images
async function getAllHotels() {
  try {
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('id, name, star_rating, images')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return hotels;
  } catch (error) {
    console.error('❌ Error fetching hotels:', error.message);
    throw error;
  }
}

// Function to get all uploaded images from storage
async function getAllUploadedImages() {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('hotels', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) throw error;
    return files || [];
  } catch (error) {
    console.error('❌ Error fetching uploaded images:', error.message);
    throw error;
  }
}

// Function to get images for a specific hotel from storage
async function getHotelImagesFromStorage(hotelId) {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`hotels/${hotelId}`, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      // If directory doesn't exist, return empty array
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return [];
      }
      throw error;
    }
    
    return files || [];
  } catch (error) {
    console.error(`❌ Error fetching images for hotel ${hotelId}:`, error.message);
    return [];
  }
}

// Function to generate public URL for a storage file
function generatePublicUrl(filePath) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
}

// Function to update hotel images array
async function updateHotelImages(hotelId, imageUrls) {
  try {
    const { error } = await supabase
      .from('hotels')
      .update({ 
        images: imageUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', hotelId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`❌ Failed to update hotel ${hotelId}:`, error.message);
    return false;
  }
}

// Function to sync all hotel images
async function syncAllHotelImages() {
  console.log('🔄 Syncing Hotel Images with Storage');
  console.log('====================================\n');
  
  try {
    // Get all hotels
    console.log('📋 Fetching hotels...');
    const hotels = await getAllHotels();
    console.log(`✅ Found ${hotels.length} hotels\n`);
    
    const results = {
      processed: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      totalImages: 0
    };
    
    // Process each hotel
    for (const hotel of hotels) {
      try {
        console.log(`🏨 Processing: ${hotel.name} (${hotel.star_rating} stars)`);
        
        // Get images from storage
        const storageFiles = await getHotelImagesFromStorage(hotel.id);
        
        if (storageFiles.length === 0) {
          console.log(`   ⚠️  No images found in storage for this hotel`);
          results.skipped++;
          continue;
        }
        
        // Generate public URLs for all images
        const imageUrls = storageFiles.map(file => 
          generatePublicUrl(`hotels/${hotel.id}/${file.name}`)
        );
        
        // Check if images need updating
        const currentImages = hotel.images || [];
        const needsUpdate = JSON.stringify(currentImages.sort()) !== JSON.stringify(imageUrls.sort());
        
        if (!needsUpdate) {
          console.log(`   ✅ Images already up to date (${imageUrls.length} images)`);
          results.skipped++;
          continue;
        }
        
        // Update hotel with new image URLs
        const success = await updateHotelImages(hotel.id, imageUrls);
        
        if (success) {
          console.log(`   ✅ Updated with ${imageUrls.length} images`);
          results.updated++;
          results.totalImages += imageUrls.length;
          
          // Show image URLs
          imageUrls.forEach((url, index) => {
            console.log(`      ${index + 1}. ${url}`);
          });
        } else {
          console.log(`   ❌ Failed to update images`);
          results.failed++;
        }
        
        results.processed++;
        console.log(''); // Empty line for readability
        
      } catch (error) {
        console.error(`❌ Error processing hotel ${hotel.name}:`, error.message);
        results.failed++;
        results.processed++;
      }
    }
    
    // Summary
    console.log('📈 Sync Summary');
    console.log('===============');
    console.log(`✅ Processed: ${results.processed} hotels`);
    console.log(`🔄 Updated: ${results.updated} hotels`);
    console.log(`⏭️  Skipped: ${results.skipped} hotels (no changes needed)`);
    console.log(`❌ Failed: ${results.failed} hotels`);
    console.log(`📸 Total images: ${results.totalImages}`);
    
    return results;
    
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    throw error;
  }
}

// Function to sync specific hotel images
async function syncHotelImages(hotelId) {
  console.log(`🔄 Syncing Images for Hotel: ${hotelId}`);
  console.log('=====================================\n');
  
  try {
    // Get hotel details
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, star_rating, images')
      .eq('id', hotelId)
      .single();
    
    if (hotelError) throw hotelError;
    
    console.log(`🏨 Hotel: ${hotel.name} (${hotel.star_rating} stars)`);
    
    // Get images from storage
    const storageFiles = await getHotelImagesFromStorage(hotelId);
    
    if (storageFiles.length === 0) {
      console.log('⚠️  No images found in storage for this hotel');
      return;
    }
    
    // Generate public URLs
    const imageUrls = storageFiles.map(file => 
      generatePublicUrl(`hotels/${hotel.id}/${file.name}`)
    );
    
    console.log(`📸 Found ${imageUrls.length} images in storage:`);
    imageUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
    
    // Update hotel
    const success = await updateHotelImages(hotelId, imageUrls);
    
    if (success) {
      console.log(`\n✅ Successfully updated hotel with ${imageUrls.length} images`);
    } else {
      console.log(`\n❌ Failed to update hotel images`);
    }
    
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    throw error;
  }
}

// Function to show current image status
async function showImageStatus() {
  console.log('📊 Hotel Images Status');
  console.log('======================\n');
  
  try {
    const hotels = await getAllHotels();
    
    let totalHotels = 0;
    let hotelsWithImages = 0;
    let totalImages = 0;
    
    console.log('Hotel Images Summary:');
    console.log('--------------------');
    
    for (const hotel of hotels) {
      totalHotels++;
      const currentImages = hotel.images || [];
      const storageFiles = await getHotelImagesFromStorage(hotel.id);
      
      if (currentImages.length > 0 || storageFiles.length > 0) {
        hotelsWithImages++;
        totalImages += Math.max(currentImages.length, storageFiles.length);
        
        const status = currentImages.length === storageFiles.length ? '✅' : '⚠️';
        console.log(`${status} ${hotel.name}: ${currentImages.length} in DB, ${storageFiles.length} in storage`);
      } else {
        console.log(`❌ ${hotel.name}: No images`);
      }
    }
    
    console.log('\nOverall Statistics:');
    console.log('------------------');
    console.log(`Total hotels: ${totalHotels}`);
    console.log(`Hotels with images: ${hotelsWithImages}`);
    console.log(`Hotels without images: ${totalHotels - hotelsWithImages}`);
    console.log(`Total images: ${totalImages}`);
    
  } catch (error) {
    console.error('💥 Status check failed:', error.message);
    throw error;
  }
}

// Function to clear all hotel images
async function clearAllHotelImages() {
  console.log('🗑️  Clearing All Hotel Images');
  console.log('=============================\n');
  
  try {
    const hotels = await getAllHotels();
    
    let cleared = 0;
    let failed = 0;
    
    for (const hotel of hotels) {
      const success = await updateHotelImages(hotel.id, []);
      if (success) {
        console.log(`✅ Cleared images for: ${hotel.name}`);
        cleared++;
      } else {
        console.log(`❌ Failed to clear images for: ${hotel.name}`);
        failed++;
      }
    }
    
    console.log(`\n📈 Clear Summary:`);
    console.log(`✅ Cleared: ${cleared} hotels`);
    console.log(`❌ Failed: ${failed} hotels`);
    
  } catch (error) {
    console.error('💥 Clear operation failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🖼️  Hotel Images Array Update Script');
  console.log('====================================\n');
  
  try {
    switch (command) {
      case 'sync':
        await syncAllHotelImages();
        break;
        
      case 'sync-hotel':
        const hotelId = args[1];
        if (!hotelId) {
          console.error('❌ Please provide hotel ID');
          console.log('Usage: node update-hotel-images-array.js sync-hotel <hotel-id>');
          process.exit(1);
        }
        await syncHotelImages(hotelId);
        break;
        
      case 'status':
        await showImageStatus();
        break;
        
      case 'clear':
        console.log('⚠️  This will clear ALL hotel images from the database!');
        console.log('Type "yes" to confirm:');
        
        // For automated scripts, you might want to add a --force flag
        if (args[1] === '--force') {
          await clearAllHotelImages();
        } else {
          console.log('Use --force flag to skip confirmation');
        }
        break;
        
      default:
        console.log('Usage:');
        console.log('  node update-hotel-images-array.js <command> [options]\n');
        console.log('Commands:');
        console.log('  sync              - Sync all hotel images with storage');
        console.log('  sync-hotel <id>   - Sync images for specific hotel');
        console.log('  status            - Show current image status');
        console.log('  clear --force     - Clear all hotel images (use with caution)');
        console.log('\nExamples:');
        console.log('  node update-hotel-images-array.js sync');
        console.log('  node update-hotel-images-array.js sync-hotel 123e4567-e89b-12d3-a456-426614174000');
        console.log('  node update-hotel-images-array.js status');
        break;
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  syncAllHotelImages,
  syncHotelImages,
  showImageStatus,
  clearAllHotelImages,
  updateHotelImages
};
