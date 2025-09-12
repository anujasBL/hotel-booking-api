#!/usr/bin/env node

/**
 * Intelligent Hotel Image Classification and Upload Script
 * This script analyzes images and automatically assigns them to hotels
 * based on visual characteristics and hotel properties
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const BUCKET_NAME = 'hotel-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Image classification rules based on visual characteristics
const imageClassificationRules = {
  // Luxury indicators
  luxury: {
    keywords: ['palace', 'grand', 'imperial', 'royal', 'luxury', 'resort', 'suite'],
    visualCues: ['marble', 'gold', 'chandelier', 'elegant', 'opulent', 'sophisticated'],
    starRating: ['5'],
    amenities: ['spa', 'concierge', 'butler_service', 'valet_parking']
  },
  
  // Business indicators
  business: {
    keywords: ['business', 'executive', 'central', 'corporate', 'commercial'],
    visualCues: ['modern', 'glass', 'steel', 'office', 'meeting', 'conference'],
    starRating: ['4', '5'],
    amenities: ['business_center', 'meeting_rooms', 'airport_shuttle']
  },
  
  // Budget indicators
  budget: {
    keywords: ['budget', 'inn', 'rest house', 'economy', 'affordable'],
    visualCues: ['simple', 'basic', 'clean', 'minimal', 'functional'],
    starRating: ['2', '3'],
    amenities: ['wifi', 'parking']
  },
  
  // Eco indicators
  eco: {
    keywords: ['eco', 'forest', 'nature', 'sustainable', 'green', 'organic'],
    visualCues: ['wood', 'plants', 'natural', 'outdoor', 'garden', 'trees'],
    starRating: ['3', '4'],
    amenities: ['eco_friendly', 'solar_power', 'organic_food']
  },
  
  // Heritage indicators
  heritage: {
    keywords: ['heritage', 'colonial', 'historic', 'mansion', 'traditional'],
    visualCues: ['antique', 'wooden', 'colonial', 'traditional', 'historic'],
    starRating: ['3', '4', '5'],
    amenities: ['heritage_architecture', 'antique_furniture']
  },
  
  // Beach/Coastal indicators
  beach: {
    keywords: ['beach', 'ocean', 'coastal', 'seaside', 'marina'],
    visualCues: ['water', 'beach', 'ocean', 'waves', 'sand', 'palm'],
    starRating: ['3', '4', '5'],
    amenities: ['beach_access', 'ocean_view', 'water_sports']
  },
  
  // Mountain/Hill indicators
  mountain: {
    keywords: ['mountain', 'hill', 'alpine', 'highland', 'peak'],
    visualCues: ['mountain', 'hills', 'elevation', 'scenic', 'panoramic'],
    starRating: ['3', '4', '5'],
    amenities: ['mountain_view', 'hiking_trails', 'scenic_views']
  }
};

// Function to analyze image characteristics
async function analyzeImage(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await sharp(imagePath).stats();
    
    // Basic image analysis
    const analysis = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fs.statSync(imagePath).size,
      dominantColors: await getDominantColors(imagePath),
      brightness: calculateBrightness(stats),
      contrast: calculateContrast(stats),
      hasWater: await detectWaterElements(imagePath),
      hasNature: await detectNatureElements(imagePath),
      hasArchitecture: await detectArchitectureElements(imagePath)
    };
    
    return analysis;
  } catch (error) {
    console.error(`Error analyzing image ${imagePath}:`, error.message);
    return null;
  }
}

// Function to get dominant colors
async function getDominantColors(imagePath) {
  try {
    const { data, info } = await sharp(imagePath)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const colors = {};
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Categorize colors
      if (r > 200 && g > 200 && b > 200) colors.white = (colors.white || 0) + 1;
      else if (r > 150 && g < 100 && b < 100) colors.red = (colors.red || 0) + 1;
      else if (r < 100 && g > 150 && b < 100) colors.green = (colors.green || 0) + 1;
      else if (r < 100 && g < 100 && b > 150) colors.blue = (colors.blue || 0) + 1;
      else if (r > 150 && g > 150 && b < 100) colors.yellow = (colors.yellow || 0) + 1;
      else if (r > 100 && g < 100 && b > 100) colors.purple = (colors.purple || 0) + 1;
      else colors.other = (colors.other || 0) + 1;
    }
    
    return colors;
  } catch (error) {
    return {};
  }
}

// Function to calculate brightness
function calculateBrightness(stats) {
  const channels = stats.channels;
  if (!channels || channels.length === 0) return 0;
  
  const avgBrightness = channels.reduce((sum, channel) => sum + channel.mean, 0) / channels.length;
  return avgBrightness / 255; // Normalize to 0-1
}

// Function to calculate contrast
function calculateContrast(stats) {
  const channels = stats.channels;
  if (!channels || channels.length === 0) return 0;
  
  const avgStdDev = channels.reduce((sum, channel) => sum + channel.stdev, 0) / channels.length;
  return avgStdDev / 255; // Normalize to 0-1
}

// Function to detect water elements (simplified)
async function detectWaterElements(imagePath) {
  try {
    const colors = await getDominantColors(imagePath);
    // High blue content might indicate water
    return (colors.blue || 0) > (colors.green || 0) && (colors.blue || 0) > 1000;
  } catch (error) {
    return false;
  }
}

// Function to detect nature elements (simplified)
async function detectNatureElements(imagePath) {
  try {
    const colors = await getDominantColors(imagePath);
    // High green content might indicate nature
    return (colors.green || 0) > 1000;
  } catch (error) {
    return false;
  }
}

// Function to detect architecture elements (simplified)
async function detectArchitectureElements(imagePath) {
  try {
    const colors = await getDominantColors(imagePath);
    // High contrast and structured colors might indicate architecture
    return (colors.white || 0) > 500 && (colors.other || 0) > 500;
  } catch (error) {
    return false;
  }
}

// Function to classify image based on analysis
function classifyImage(imageAnalysis, fileName, folderCategory = null) {
  const scores = {};
  
  // Analyze filename
  const fileNameLower = fileName.toLowerCase();
  
  // Give bonus points for folder category match
  if (folderCategory && imageClassificationRules[folderCategory]) {
    scores[folderCategory] = (scores[folderCategory] || 0) + 5;
  }
  
  // Score based on visual characteristics
  if (imageAnalysis.hasWater) scores.beach = (scores.beach || 0) + 3;
  if (imageAnalysis.hasNature) scores.eco = (scores.eco || 0) + 2;
  if (imageAnalysis.hasArchitecture) scores.heritage = (scores.heritage || 0) + 1;
  
  // Score based on brightness and contrast
  if (imageAnalysis.brightness > 0.7) scores.luxury = (scores.luxury || 0) + 1;
  if (imageAnalysis.contrast > 0.5) scores.business = (scores.business || 0) + 1;
  
  // Score based on filename keywords
  Object.keys(imageClassificationRules).forEach(category => {
    const rules = imageClassificationRules[category];
    rules.keywords.forEach(keyword => {
      if (fileNameLower.includes(keyword)) {
        scores[category] = (scores[category] || 0) + 2;
      }
    });
  });
  
  // Return the category with highest score
  const bestMatch = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b, folderCategory || 'business');
  return {
    category: bestMatch,
    confidence: scores[bestMatch] || 0,
    scores: scores
  };
}

// Function to find best matching hotels for an image
async function findMatchingHotels(imageClassification, imageAnalysis) {
  try {
    // Use the most basic query possible to avoid JSON parsing issues
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('id, name, star_rating')
      .eq('is_active', true);
    
    if (error) throw error;
    
    const matches = [];
    
    hotels.forEach(hotel => {
      let score = 0;
      const category = imageClassification.category;
      const rules = imageClassificationRules[category];
      
      // Score based on star rating
      if (rules.starRating.includes(hotel.star_rating)) {
        score += 3;
      }
      
      // Skip amenities scoring for now to avoid JSON parsing issues
      // We'll rely on star rating, name keywords, and location for matching
      
      // Score based on hotel name keywords
      const hotelNameLower = hotel.name.toLowerCase();
      rules.keywords.forEach(keyword => {
        if (hotelNameLower.includes(keyword)) {
          score += 3;
        }
      });
      
      // Score based on location (simplified - using hotel name hints)
      if (category === 'beach' && (hotelNameLower.includes('colombo') || hotelNameLower.includes('galle') || hotelNameLower.includes('negombo'))) {
        score += 2;
      }
      if (category === 'mountain' && (hotelNameLower.includes('kandy') || hotelNameLower.includes('nuwara') || hotelNameLower.includes('ella'))) {
        score += 2;
      }
      
      if (score > 0) {
        matches.push({
          hotel,
          score,
          category,
          confidence: imageClassification.confidence
        });
      }
    });
    
    // Sort by score and return top matches
    return matches.sort((a, b) => b.score - a.score).slice(0, 5);
    
  } catch (error) {
    console.error('Error finding matching hotels:', error.message);
    return [];
  }
}

// Function to upload image to Supabase Storage
async function uploadImageToStorage(hotelId, imagePath, imageIndex) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const filePath = `hotels/${hotelId}/image_${imageIndex}_${Date.now()}${path.extname(fileName)}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: getContentType(fileName),
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Upload failed for ${imagePath}:`, error.message);
    throw error;
  }
}

// Function to get content type
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

// Function to update hotel with new image
async function updateHotelImage(hotelId, imageUrl) {
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

// Main classification and upload function
async function classifyAndUploadImages(imagesFolder) {
  console.log('🤖 Starting Intelligent Image Classification and Upload');
  console.log('====================================================\n');
  
  try {
    // Check if images folder exists
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
      classifications: {}
    };
    
    // Process each image
    for (const imageFile of imageFiles) {
      const { fileName, fullPath, relativePath, category } = imageFile;
      
      try {
        console.log(`🔍 Analyzing: ${relativePath} (Category: ${category})`);
        
        // Analyze image
        const imageAnalysis = await analyzeImage(fullPath);
        if (!imageAnalysis) {
          console.log(`❌ Failed to analyze ${fileName}`);
          results.failed++;
          continue;
        }
        
        // Classify image (use folder category as hint)
        const classification = classifyImage(imageAnalysis, fileName, category);
        console.log(`📊 Classification: ${classification.category} (confidence: ${classification.confidence})`);
        
        // Find matching hotels
        const matches = await findMatchingHotels(classification, imageAnalysis);
        
        if (matches.length === 0) {
          console.log(`⚠️  No matching hotels found for ${fileName}`);
          results.failed++;
          continue;
        }
        
        // Show top matches
        console.log(`🏨 Top matches:`);
        matches.slice(0, 3).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.hotel.name} (${match.hotel.star_rating} stars) - Score: ${match.score}`);
        });
        
        // Upload to best match
        const bestMatch = matches[0];
        console.log(`📤 Uploading to: ${bestMatch.hotel.name}`);
        
        const imageUrl = await uploadImageToStorage(bestMatch.hotel.id, fullPath, 1);
        const updateSuccess = await updateHotelImage(bestMatch.hotel.id, imageUrl);
        
        if (updateSuccess) {
          console.log(`✅ Successfully uploaded and assigned to ${bestMatch.hotel.name}`);
          console.log(`🔗 URL: ${imageUrl}\n`);
          results.uploaded++;
        } else {
          console.log(`❌ Failed to update hotel record\n`);
          results.failed++;
        }
        
        // Track classifications
        results.classifications[classification.category] = (results.classifications[classification.category] || 0) + 1;
        results.processed++;
        
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
        results.failed++;
      }
    }
    
    // Summary
    console.log('📈 Classification and Upload Summary');
    console.log('===================================');
    console.log(`✅ Processed: ${results.processed} images`);
    console.log(`📤 Uploaded: ${results.uploaded} images`);
    console.log(`❌ Failed: ${results.failed} images`);
    console.log('\n📊 Classifications:');
    Object.entries(results.classifications).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} images`);
    });
    
  } catch (error) {
    console.error('💥 Classification failed:', error.message);
    process.exit(1);
  }
}

// Function to show help
function showHelp() {
  console.log('🤖 Intelligent Hotel Image Classification and Upload');
  console.log('===================================================\n');
  console.log('Usage:');
  console.log('  node classify-and-upload-images.js <images-folder-path>\n');
  console.log('Examples:');
  console.log('  node classify-and-upload-images.js ./images');
  console.log('  node classify-and-upload-images.js ./hotel-photos');
  console.log('  node classify-and-upload-images.js /path/to/your/images\n');
  console.log('Features:');
  console.log('  • Automatic image analysis and classification');
  console.log('  • Smart hotel matching based on characteristics');
  console.log('  • Direct upload to Supabase Storage');
  console.log('  • Automatic database updates');
  console.log('  • Support for JPEG, PNG, WebP, GIF formats\n');
  console.log('Prerequisites:');
  console.log('  1. Run sql-scripts/setup-supabase-storage.sql in Supabase SQL Editor');
  console.log('  2. Ensure your .env file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.log('  3. Install sharp: npm install sharp');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const imagesFolder = args[0];
  await classifyAndUploadImages(imagesFolder);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  classifyAndUploadImages,
  analyzeImage,
  classifyImage,
  findMatchingHotels
};
