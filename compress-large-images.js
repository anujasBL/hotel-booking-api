#!/usr/bin/env node

/**
 * Simple Image Compression Script
 * Compresses images larger than 5MB to fit within the limit
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSED_FOLDER = 'images-compressed';

// Function to get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Function to compress a single image
async function compressImage(inputPath, outputPath) {
  try {
    const originalSize = getFileSizeMB(inputPath);
    console.log(`📸 Compressing: ${path.basename(inputPath)} (${originalSize}MB)`);
    
    // Try different quality levels
    let quality = 85;
    let success = false;
    
    while (quality > 10 && !success) {
      await sharp(inputPath)
        .jpeg({ quality: quality })
        .toFile(outputPath);
      
      const compressedSize = getFileSizeMB(outputPath);
      
      if (parseFloat(compressedSize) <= 4.8) { // Leave some margin
        console.log(`✅ Compressed to: ${compressedSize}MB (quality: ${quality}%)`);
        success = true;
      } else {
        quality -= 10;
      }
    }
    
    if (!success) {
      // If still too large, reduce dimensions
      const metadata = await sharp(inputPath).metadata();
      const newWidth = Math.floor(metadata.width * 0.7);
      const newHeight = Math.floor(metadata.height * 0.7);
      
      await sharp(inputPath)
        .resize(newWidth, newHeight)
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      
      const finalSize = getFileSizeMB(outputPath);
      console.log(`✅ Compressed to: ${finalSize}MB (resized to ${newWidth}x${newHeight})`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to compress ${inputPath}:`, error.message);
    return false;
  }
}

// Function to process all images
async function compressAllImages(inputDir) {
  console.log('🗜️  Compressing Large Images');
  console.log('============================\n');
  
  // Create output directory
  if (!fs.existsSync(COMPRESSED_FOLDER)) {
    fs.mkdirSync(COMPRESSED_FOLDER, { recursive: true });
  }
  
  // Get all image files recursively
  function getAllImageFiles(dir, basePath = '') {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Create subdirectory in output
        const outputSubDir = path.join(COMPRESSED_FOLDER, item);
        if (!fs.existsSync(outputSubDir)) {
          fs.mkdirSync(outputSubDir, { recursive: true });
        }
        
        // Recursively process subdirectory
        files.push(...getAllImageFiles(fullPath, relativePath));
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
          files.push({
            fileName: item,
            fullPath: fullPath,
            relativePath: relativePath,
            outputPath: path.join(COMPRESSED_FOLDER, relativePath)
          });
        }
      }
    }
    
    return files;
  }
  
  const imageFiles = getAllImageFiles(inputDir);
  
  if (imageFiles.length === 0) {
    console.log('❌ No image files found');
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} images to process\n`);
  
  const results = {
    processed: 0,
    compressed: 0,
    skipped: 0,
    failed: 0
  };
  
  // Process each image
  for (const imageFile of imageFiles) {
    const { fileName, fullPath, outputPath } = imageFile;
    
    try {
      const originalSize = getFileSizeMB(fullPath);
      
      if (parseFloat(originalSize) <= 5.0) {
        // File is already small enough, just copy it
        fs.copyFileSync(fullPath, outputPath);
        console.log(`📋 Copied: ${fileName} (${originalSize}MB - already small enough)`);
        results.skipped++;
      } else {
        // File needs compression
        const success = await compressImage(fullPath, outputPath);
        if (success) {
          results.compressed++;
        } else {
          results.failed++;
        }
      }
      
      results.processed++;
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n📈 Compression Summary');
  console.log('=====================');
  console.log(`✅ Processed: ${results.processed} images`);
  console.log(`🗜️  Compressed: ${results.compressed} images`);
  console.log(`📋 Skipped: ${results.skipped} images (already small)`);
  console.log(`❌ Failed: ${results.failed} images`);
  console.log(`\n📁 Compressed images saved to: ${COMPRESSED_FOLDER}`);
  console.log(`\n🚀 Next step: npm run upload-classified ./${COMPRESSED_FOLDER}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🗜️  Image Compression Script');
    console.log('============================\n');
    console.log('Usage:');
    console.log('  node compress-large-images.js <input-directory>\n');
    console.log('Example:');
    console.log('  node compress-large-images.js ./images');
    console.log('\nThis script will:');
    console.log('• Compress images larger than 5MB');
    console.log('• Maintain folder structure');
    console.log('• Save compressed images to ./images-compressed/');
    return;
  }
  
  const inputDir = args[0];
  
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }
  
  await compressAllImages(inputDir);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Compression failed:', error.message);
    process.exit(1);
  });
}

module.exports = { compressImage, compressAllImages };
