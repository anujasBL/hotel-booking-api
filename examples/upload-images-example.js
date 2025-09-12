#!/usr/bin/env node

/**
 * Example: Upload Hotel Images to Supabase Storage
 * This example shows how to upload images for a specific hotel
 */

const { uploadHotelImages, getHotelByName } = require('../upload-hotel-images');

async function exampleUpload() {
  console.log('📸 Example: Uploading Hotel Images');
  console.log('==================================\n');

  try {
    // Example 1: Upload images for "Royal Palace Kandy"
    const hotelName = 'Royal Palace Kandy';
    
    console.log(`🏨 Finding hotel: ${hotelName}`);
    const hotel = await getHotelByName(hotelName);
    console.log(`✅ Found: ${hotel.name} (${hotel.location.city})`);
    console.log(`📊 Current images: ${hotel.images?.length || 0}\n`);

    // Example image paths (replace with your actual image files)
    const exampleImages = [
      './examples/sample-images/hotel1.jpg',
      './examples/sample-images/hotel2.jpg',
      './examples/sample-images/hotel3.jpg'
    ];

    console.log('📤 Uploading example images...');
    console.log('Note: Replace the example image paths with your actual image files\n');

    // Uncomment the following lines to actually upload images:
    /*
    const uploadedUrls = await uploadHotelImages(hotel.id, exampleImages);
    console.log(`✅ Successfully uploaded ${uploadedUrls.length} images`);
    console.log('📋 Uploaded URLs:');
    uploadedUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
    */

    console.log('💡 To upload real images:');
    console.log('1. Create a directory with your hotel images');
    console.log('2. Run: npm run upload-images upload "Royal Palace Kandy" ./your-images/');
    console.log('3. Or upload individual files: npm run upload-images upload "Royal Palace Kandy" ./image1.jpg ./image2.jpg');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Run example
if (require.main === module) {
  exampleUpload();
}
