#!/usr/bin/env node

/**
 * Example: Intelligent Image Classification
 * This example demonstrates how the classification system works
 */

const { classifyAndUploadImages, analyzeImage, classifyImage, findMatchingHotels } = require('../classify-and-upload-images');

async function demonstrateClassification() {
  console.log('🤖 Image Classification Demo');
  console.log('============================\n');

  // Example image analysis (simulated)
  const exampleAnalysis = {
    width: 1920,
    height: 1080,
    format: 'jpeg',
    size: 2048000,
    dominantColors: {
      blue: 5000,
      white: 3000,
      green: 2000
    },
    brightness: 0.8,
    contrast: 0.6,
    hasWater: true,
    hasNature: false,
    hasArchitecture: true
  };

  console.log('📊 Example Image Analysis:');
  console.log(`   Dimensions: ${exampleAnalysis.width}x${exampleAnalysis.height}`);
  console.log(`   Format: ${exampleAnalysis.format}`);
  console.log(`   Size: ${(exampleAnalysis.size / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Brightness: ${(exampleAnalysis.brightness * 100).toFixed(1)}%`);
  console.log(`   Contrast: ${(exampleAnalysis.contrast * 100).toFixed(1)}%`);
  console.log(`   Has Water Elements: ${exampleAnalysis.hasWater ? 'Yes' : 'No'}`);
  console.log(`   Has Nature Elements: ${exampleAnalysis.hasNature ? 'Yes' : 'No'}`);
  console.log(`   Has Architecture: ${exampleAnalysis.hasArchitecture ? 'Yes' : 'No'}\n`);

  // Example classification
  const classification = classifyImage(exampleAnalysis, 'luxury-beach-resort.jpg');
  console.log('🏷️  Image Classification:');
  console.log(`   Category: ${classification.category}`);
  console.log(`   Confidence: ${classification.confidence}/10`);
  console.log(`   All Scores:`, classification.scores);
  console.log('');

  // Example hotel matching
  console.log('🏨 Finding Matching Hotels...');
  try {
    const matches = await findMatchingHotels(classification, exampleAnalysis);
    
    if (matches.length > 0) {
      console.log(`   Found ${matches.length} potential matches:`);
      matches.slice(0, 3).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.hotel.name} (${match.hotel.location.city})`);
        console.log(`      Star Rating: ${match.hotel.star_rating} stars`);
        console.log(`      Match Score: ${match.score}`);
        console.log(`      Category: ${match.category}`);
        console.log('');
      });
    } else {
      console.log('   No matching hotels found');
    }
  } catch (error) {
    console.log('   Error finding matches:', error.message);
  }

  console.log('💡 How to Use the Classification System:');
  console.log('========================================');
  console.log('1. Setup the system:');
  console.log('   npm run setup-images');
  console.log('');
  console.log('2. Place your images in a folder:');
  console.log('   ./images/');
  console.log('   ├── luxury-hotel-1.jpg');
  console.log('   ├── business-hotel-2.jpg');
  console.log('   └── beach-resort-3.jpg');
  console.log('');
  console.log('3. Run classification:');
  console.log('   npm run classify-images ./images');
  console.log('');
  console.log('4. The system will automatically:');
  console.log('   • Analyze each image');
  console.log('   • Classify by type');
  console.log('   • Find best matching hotels');
  console.log('   • Upload to Supabase Storage');
  console.log('   • Update hotel records');
  console.log('');
  console.log('🎯 Classification Categories:');
  console.log('• Luxury: 5-star hotels, palaces, resorts');
  console.log('• Business: 4-5 star hotels with business amenities');
  console.log('• Budget: 2-3 star hotels, inns, rest houses');
  console.log('• Eco: Nature-focused, sustainable hotels');
  console.log('• Heritage: Colonial, historic, traditional');
  console.log('• Beach: Coastal hotels with ocean views');
  console.log('• Mountain: Hill country hotels with scenic views');
}

// Run the demo
if (require.main === module) {
  demonstrateClassification().catch(error => {
    console.error('Demo failed:', error.message);
  });
}

module.exports = { demonstrateClassification };
