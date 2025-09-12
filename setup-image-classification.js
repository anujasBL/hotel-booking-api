#!/usr/bin/env node

/**
 * Setup Script for Image Classification
 * This script sets up the environment for intelligent image classification
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Setting up Image Classification System');
console.log('========================================\n');

// Check if sharp is installed
function checkSharpInstallation() {
  try {
    require('sharp');
    console.log('✅ Sharp is already installed');
    return true;
  } catch (error) {
    console.log('❌ Sharp is not installed');
    return false;
  }
}

// Install sharp
function installSharp() {
  console.log('📦 Installing Sharp (image processing library)...');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
    console.log('✅ Sharp installed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to install Sharp:', error.message);
    return false;
  }
}

// Create sample images directory structure
function createSampleStructure() {
  console.log('📁 Creating sample directory structure...');
  
  const directories = [
    'images',
    'images/luxury',
    'images/business',
    'images/budget',
    'images/eco',
    'images/heritage',
    'images/beach',
    'images/mountain'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory exists: ${dir}`);
    }
  });
  
  // Create README for images directory
  const readmeContent = `# Hotel Images Directory

This directory contains hotel images that will be automatically classified and uploaded to Supabase.

## Directory Structure

- \`luxury/\` - Luxury hotel images (5-star, palaces, resorts)
- \`business/\` - Business hotel images (4-5 star, corporate)
- \`budget/\` - Budget hotel images (2-3 star, inns, rest houses)
- \`eco/\` - Eco-friendly hotel images (nature, sustainable)
- \`heritage/\` - Heritage hotel images (colonial, historic, traditional)
- \`beach/\` - Beach/coastal hotel images (ocean views, water sports)
- \`mountain/\` - Mountain/hill hotel images (scenic views, hiking)

## Image Requirements

- **Formats**: JPEG, PNG, WebP, GIF
- **Size**: Maximum 5MB per image
- **Recommended**: 800x600 pixels for optimal web display
- **Naming**: Use descriptive names (e.g., \`hotel-exterior.jpg\`, \`hotel-lobby.jpg\`)

## Usage

1. Place your hotel images in the appropriate subdirectories
2. Run: \`npm run classify-images ./images\`
3. The system will automatically:
   - Analyze each image
   - Classify it based on visual characteristics
   - Find the best matching hotels
   - Upload to Supabase Storage
   - Update hotel records with image URLs

## Classification Rules

The system uses the following criteria to classify images:

### Luxury Hotels
- Keywords: palace, grand, imperial, royal, luxury, resort, suite
- Visual cues: marble, gold, chandelier, elegant, opulent
- Star rating: 5 stars
- Amenities: spa, concierge, butler service, valet parking

### Business Hotels
- Keywords: business, executive, central, corporate, commercial
- Visual cues: modern, glass, steel, office, meeting, conference
- Star rating: 4-5 stars
- Amenities: business center, meeting rooms, airport shuttle

### Budget Hotels
- Keywords: budget, inn, rest house, economy, affordable
- Visual cues: simple, basic, clean, minimal, functional
- Star rating: 2-3 stars
- Amenities: wifi, parking

### Eco Hotels
- Keywords: eco, forest, nature, sustainable, green, organic
- Visual cues: wood, plants, natural, outdoor, garden, trees
- Star rating: 3-4 stars
- Amenities: eco friendly, solar power, organic food

### Heritage Hotels
- Keywords: heritage, colonial, historic, mansion, traditional
- Visual cues: antique, wooden, colonial, traditional, historic
- Star rating: 3-5 stars
- Amenities: heritage architecture, antique furniture

### Beach Hotels
- Keywords: beach, ocean, coastal, seaside, marina
- Visual cues: water, beach, ocean, waves, sand, palm
- Star rating: 3-5 stars
- Amenities: beach access, ocean view, water sports

### Mountain Hotels
- Keywords: mountain, hill, alpine, highland, peak
- Visual cues: mountain, hills, elevation, scenic, panoramic
- Star rating: 3-5 stars
- Amenities: mountain view, hiking trails, scenic views
`;

  fs.writeFileSync('images/README.md', readmeContent);
  console.log('✅ Created images/README.md with instructions\n');
}

// Test image classification system
function testClassificationSystem() {
  console.log('🧪 Testing image classification system...');
  
  try {
    // Test if the classification script can be loaded
    const classificationScript = require('./classify-and-upload-images');
    console.log('✅ Classification script loaded successfully');
    
    // Test if required functions are available
    const requiredFunctions = ['classifyAndUploadImages', 'analyzeImage', 'classifyImage'];
    requiredFunctions.forEach(func => {
      if (typeof classificationScript[func] === 'function') {
        console.log(`✅ Function ${func} is available`);
      } else {
        console.log(`❌ Function ${func} is missing`);
      }
    });
    
    console.log('✅ Image classification system is ready\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to test classification system:', error.message);
    return false;
  }
}

// Main setup function
async function setup() {
  let success = true;
  
  // Check and install Sharp
  if (!checkSharpInstallation()) {
    success = installSharp() && success;
  }
  
  // Create directory structure
  createSampleStructure();
  
  // Test the system
  success = testClassificationSystem() && success;
  
  if (success) {
    console.log('🎉 Image Classification Setup Complete!');
    console.log('=====================================\n');
    console.log('Next steps:');
    console.log('1. Add your hotel images to the images/ directory');
    console.log('2. Organize them by category (luxury, business, budget, etc.)');
    console.log('3. Run: npm run classify-images ./images');
    console.log('4. The system will automatically classify and upload images\n');
    console.log('Example usage:');
    console.log('  npm run classify-images ./images');
    console.log('  npm run classify-images ./my-hotel-photos');
    console.log('  npm run classify-images /path/to/your/images\n');
    console.log('For help:');
    console.log('  npm run classify-images --help');
  } else {
    console.log('❌ Setup failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setup();
}

module.exports = { setup };
