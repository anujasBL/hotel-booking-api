#!/usr/bin/env node

/**
 * Hotel Images Upload Script
 * This script helps upload images to Supabase Storage and update hotel records
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const BUCKET_NAME = 'hotel-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Function to validate file
function validateFile(filePath) {
  const stats = fs.statSync(filePath);
  
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${stats.size} bytes (max: ${MAX_FILE_SIZE})`);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  
  if (!allowedExts.includes(ext)) {
    throw new Error(`Invalid file type: ${ext} (allowed: ${allowedExts.join(', ')})`);
  }
  
  return true;
}

// Function to generate file path
function generateFilePath(hotelId, imageIndex, originalName) {
  const ext = path.extname(originalName);
  return `hotels/${hotelId}/image_${imageIndex}${ext}`;
}

// Function to upload single image
async function uploadImage(hotelId, imagePath, imageIndex) {
  try {
    console.log(`📤 Uploading image ${imageIndex} for hotel ${hotelId}...`);
    
    // Validate file
    validateFile(imagePath);
    
    // Read file
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const filePath = generateFilePath(hotelId, imageIndex, fileName);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: getContentType(fileName),
        upsert: true // Overwrite if exists
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log(`✅ Uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error(`❌ Upload failed for ${imagePath}: ${error.message}`);
    throw error;
  }
}

// Function to get content type from file extension
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return types[ext] || 'image/jpeg';
}

// Function to upload multiple images for a hotel
async function uploadHotelImages(hotelId, imagePaths) {
  console.log(`🏨 Uploading ${imagePaths.length} images for hotel ${hotelId}...`);
  
  const uploadedUrls = [];
  
  for (let i = 0; i < imagePaths.length; i++) {
    try {
      const url = await uploadImage(hotelId, imagePaths[i], i + 1);
      uploadedUrls.push(url);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}: ${error.message}`);
      // Continue with other images
    }
  }
  
  if (uploadedUrls.length > 0) {
    // Update hotel record with new image URLs
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ images: uploadedUrls })
      .eq('id', hotelId);
    
    if (updateError) {
      console.error(`❌ Failed to update hotel record: ${updateError.message}`);
    } else {
      console.log(`✅ Updated hotel record with ${uploadedUrls.length} images`);
    }
  }
  
  return uploadedUrls;
}

// Function to upload images from directory
async function uploadFromDirectory(hotelId, directoryPath) {
  console.log(`📁 Uploading images from directory: ${directoryPath}`);
  
  try {
    const files = fs.readdirSync(directoryPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log('❌ No image files found in directory');
      return [];
    }
    
    console.log(`📸 Found ${imageFiles.length} image files`);
    
    const imagePaths = imageFiles.map(file => path.join(directoryPath, file));
    return await uploadHotelImages(hotelId, imagePaths);
    
  } catch (error) {
    console.error(`❌ Error reading directory: ${error.message}`);
    throw error;
  }
}

// Function to list hotels
async function listHotels() {
  const { data: hotels, error } = await supabase
    .from('hotels')
    .select('id, name, star_rating')
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    throw new Error(`Failed to fetch hotels: ${error.message}`);
  }
  
  return hotels;
}

// Function to get hotel by name
async function getHotelByName(hotelName) {
  const { data: hotel, error } = await supabase
    .from('hotels')
    .select('id, name, star_rating, images')
    .eq('name', hotelName)
    .eq('is_active', true)
    .single();
  
  if (error) {
    throw new Error(`Failed to find hotel: ${error.message}`);
  }
  
  return hotel;
}

// Function to delete hotel images
async function deleteHotelImages(hotelId) {
  console.log(`🗑️  Deleting images for hotel ${hotelId}...`);
  
  try {
    // List files in hotel directory
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`hotels/${hotelId}`);
    
    if (listError) {
      console.log('No images found or error listing files');
      return;
    }
    
    // Delete each file
    for (const file of files) {
      const filePath = `hotels/${hotelId}/${file.name}`;
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      if (deleteError) {
        console.error(`❌ Failed to delete ${filePath}: ${deleteError.message}`);
      } else {
        console.log(`✅ Deleted: ${filePath}`);
      }
    }
    
    // Clear images from hotel record
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ images: [] })
      .eq('id', hotelId);
    
    if (updateError) {
      console.error(`❌ Failed to clear hotel images: ${updateError.message}`);
    } else {
      console.log(`✅ Cleared images from hotel record`);
    }
    
  } catch (error) {
    console.error(`❌ Error deleting images: ${error.message}`);
  }
}

// Function to upload images from classified folder structure
async function uploadClassifiedImages(imagesFolder) {
  console.log(`🤖 Uploading classified images from: ${imagesFolder}`);
  
  if (!fs.existsSync(imagesFolder)) {
    throw new Error(`Images folder not found: ${imagesFolder}`);
  }
  
  // Get all image files (including subdirectories)
  function getAllImageFiles(dir, basePath = '') {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        files.push(...getAllImageFiles(fullPath, relativePath));
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
          files.push({
            fileName: item,
            fullPath: fullPath,
            relativePath: relativePath,
            category: basePath.split(path.sep)[0] || 'unknown'
          });
        }
      }
    }
    
    return files;
  }
  
  const imageFiles = getAllImageFiles(imagesFolder);
  
  if (imageFiles.length === 0) {
    console.log('❌ No image files found in the specified folder');
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} images to process\n`);
  
  const results = {
    processed: 0,
    uploaded: 0,
    failed: 0,
    categories: {}
  };
  
  // Process each image
  for (const imageFile of imageFiles) {
    const { fileName, fullPath, relativePath, category } = imageFile;
    
    try {
      console.log(`🔍 Processing: ${relativePath} (Category: ${category})`);
      
      // Find matching hotels based on category
      const matchingHotels = await findHotelsByCategory(category);
      
      if (matchingHotels.length === 0) {
        console.log(`⚠️  No matching hotels found for category: ${category}`);
        results.failed++;
        continue;
      }
      
      // Upload to the first matching hotel
      const targetHotel = matchingHotels[0];
      console.log(`📤 Uploading to: ${targetHotel.name} (${targetHotel.star_rating} stars)`);
      
      const imageUrl = await uploadImage(targetHotel.id, fullPath, 1);
      const updateSuccess = await updateHotelWithImage(targetHotel.id, imageUrl);
      
      if (updateSuccess) {
        console.log(`✅ Successfully uploaded and assigned to ${targetHotel.name}`);
        console.log(`🔗 URL: ${imageUrl}\n`);
        results.uploaded++;
      } else {
        console.log(`❌ Failed to update hotel record\n`);
        results.failed++;
      }
      
      // Track categories
      results.categories[category] = (results.categories[category] || 0) + 1;
      results.processed++;
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      results.failed++;
    }
  }
  
  // Summary
  console.log('📈 Upload Summary');
  console.log('================');
  console.log(`✅ Processed: ${results.processed} images`);
  console.log(`📤 Uploaded: ${results.uploaded} images`);
  console.log(`❌ Failed: ${results.failed} images`);
  console.log('\n📊 Categories:');
  Object.entries(results.categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} images`);
  });
}

// Function to find hotels by category
async function findHotelsByCategory(category) {
  const categoryKeywords = {
    luxury: ['palace', 'grand', 'imperial', 'royal', 'luxury', 'resort', 'suite'],
    business: ['business', 'executive', 'central', 'corporate', 'commercial'],
    budget: ['budget', 'inn', 'rest house', 'economy', 'affordable'],
    eco: ['eco', 'forest', 'nature', 'sustainable', 'green', 'organic'],
    heritage: ['heritage', 'colonial', 'historic', 'mansion', 'traditional'],
    beach: ['beach', 'ocean', 'coastal', 'seaside', 'marina'],
    mountain: ['mountain', 'hill', 'alpine', 'highland', 'peak']
  };
  
  const keywords = categoryKeywords[category] || [];
  const starRatings = {
    luxury: ['5'],
    business: ['4', '5'],
    budget: ['2', '3'],
    eco: ['3', '4'],
    heritage: ['3', '4', '5'],
    beach: ['3', '4', '5'],
    mountain: ['3', '4', '5']
  };
  
  const targetStars = starRatings[category] || ['3', '4', '5'];
  
  const { data: hotels, error } = await supabase
    .from('hotels')
    .select('id, name, star_rating')
    .eq('is_active', true)
    .in('star_rating', targetStars);
  
  if (error) {
    console.error('Error finding hotels:', error.message);
    return [];
  }
  
  // Score hotels based on name keywords
  const scoredHotels = hotels.map(hotel => {
    let score = 0;
    const hotelNameLower = hotel.name.toLowerCase();
    
    keywords.forEach(keyword => {
      if (hotelNameLower.includes(keyword)) {
        score += 3;
      }
    });
    
    return { ...hotel, score };
  });
  
  // Return top matches
  return scoredHotels
    .filter(hotel => hotel.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// Function to update hotel with new image
async function updateHotelWithImage(hotelId, imageUrl) {
  try {
    // Get current images
    const { data: hotel, error: fetchError } = await supabase
      .from('hotels')
      .select('images')
      .eq('id', hotelId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Add new image to array
    const currentImages = hotel.images || [];
    const newImages = [...currentImages, imageUrl];
    
    // Update hotel
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ images: newImages })
      .eq('id', hotelId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error(`Failed to update hotel ${hotelId}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🖼️  Hotel Images Upload Script');
  console.log('==============================\n');
  
  try {
    switch (command) {
      case 'list':
        console.log('📋 Available hotels:');
        const hotels = await listHotels();
        hotels.forEach((hotel, index) => {
          console.log(`${index + 1}. ${hotel.name} (${hotel.star_rating} stars) - ID: ${hotel.id}`);
        });
        break;
        
      case 'upload':
        if (args.length < 3) {
          console.log('Usage: node upload-hotel-images.js upload <hotel-name> <image-path-1> [image-path-2] ...');
          console.log('   or: node upload-hotel-images.js upload <hotel-name> <directory-path>');
          process.exit(1);
        }
        
        const hotelName = args[1];
        const imagePath = args[2];
        
        // Get hotel
        const hotel = await getHotelByName(hotelName);
        console.log(`🏨 Found hotel: ${hotel.name} (${hotel.star_rating} stars)`);
        
        // Check if path is directory
        if (fs.statSync(imagePath).isDirectory()) {
          await uploadFromDirectory(hotel.id, imagePath);
        } else {
          // Single file or multiple files
          const imagePaths = args.slice(2);
          await uploadHotelImages(hotel.id, imagePaths);
        }
        break;
        
      case 'delete':
        if (args.length < 2) {
          console.log('Usage: node upload-hotel-images.js delete <hotel-name>');
          process.exit(1);
        }
        
        const deleteHotelName = args[1];
        const deleteHotel = await getHotelByName(deleteHotelName);
        await deleteHotelImages(deleteHotel.id);
        break;
        
      case 'setup':
        console.log('🔧 Setting up Supabase Storage...');
        console.log('Please run sql-scripts/setup-supabase-storage.sql in Supabase SQL Editor first');
        break;
        
      case 'classify-upload':
        if (args.length < 2) {
          console.log('Usage: node upload-hotel-images.js classify-upload <images-folder-path>');
          console.log('Example: node upload-hotel-images.js classify-upload ./images');
          process.exit(1);
        }
        
        const imagesFolder = args[1];
        await uploadClassifiedImages(imagesFolder);
        break;
        
      default:
        console.log('Available commands:');
        console.log('  list                           - List all hotels');
        console.log('  upload <hotel> <path>          - Upload images for a hotel');
        console.log('  classify-upload <folder>       - Upload classified images from folder structure');
        console.log('  delete <hotel>                 - Delete all images for a hotel');
        console.log('  setup                          - Show setup instructions');
        console.log('');
        console.log('Examples:');
        console.log('  node upload-hotel-images.js list');
        console.log('  node upload-hotel-images.js upload "Royal Palace Kandy" ./images/hotel1.jpg');
        console.log('  node upload-hotel-images.js upload "Royal Palace Kandy" ./images/');
        console.log('  node upload-hotel-images.js classify-upload ./images');
        console.log('  node upload-hotel-images.js delete "Royal Palace Kandy"');
        break;
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  uploadImage,
  uploadHotelImages,
  uploadFromDirectory,
  uploadClassifiedImages,
  deleteHotelImages,
  listHotels,
  getHotelByName,
  findHotelsByCategory,
  updateHotelWithImage
};
