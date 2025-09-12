#!/usr/bin/env node

/**
 * Hotel Images Update Script
 * This script updates hotel images with real URLs from Unsplash
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Image URL templates for different hotel types
const imageCategories = {
  luxury: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
  ],
  business: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
  ],
  budget: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
  ],
  eco: [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
  ],
  heritage: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
  ]
};

// Function to determine image category based on hotel name and amenities
function getImageCategory(hotel) {
  const name = hotel.name.toLowerCase();
  const amenities = hotel.amenities || [];
  
  // Luxury indicators
  if (hotel.star_rating === '5' || 
      name.includes('palace') || 
      name.includes('grand') || 
      name.includes('luxury') ||
      name.includes('imperial') ||
      name.includes('resort')) {
    return 'luxury';
  }
  
  // Business indicators
  if (name.includes('business') || 
      name.includes('executive') || 
      name.includes('central') ||
      amenities.includes('business_center')) {
    return 'business';
  }
  
  // Eco indicators
  if (name.includes('eco') || 
      name.includes('forest') || 
      name.includes('nature') ||
      name.includes('sustainable')) {
    return 'eco';
  }
  
  // Heritage indicators
  if (name.includes('heritage') || 
      name.includes('colonial') || 
      name.includes('historic') ||
      name.includes('mansion')) {
    return 'heritage';
  }
  
  // Budget indicators
  if (hotel.star_rating === '2' || 
      name.includes('budget') || 
      name.includes('inn') ||
      name.includes('rest house')) {
    return 'budget';
  }
  
  // Default to business for 3-4 star hotels
  return 'business';
}

// Function to update hotel images
async function updateHotelImages() {
  console.log('🖼️  Starting hotel images update...\n');

  try {
    // Get all Sri Lankan hotels
    const { data: hotels, error: fetchError } = await supabase
      .from('hotels')
      .select('id, name, star_rating, amenities')
      .eq('location->country', 'Sri Lanka');

    if (fetchError) {
      throw new Error(`Failed to fetch hotels: ${fetchError.message}`);
    }

    console.log(`📊 Found ${hotels.length} Sri Lankan hotels to update\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update each hotel
    for (const hotel of hotels) {
      try {
        const category = getImageCategory(hotel);
        const images = imageCategories[category];
        
        const { error: updateError } = await supabase
          .from('hotels')
          .update({ images })
          .eq('id', hotel.id);

        if (updateError) {
          console.log(`❌ Failed to update ${hotel.name}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Updated ${hotel.name} (${category} category, ${images.length} images)`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ Error updating ${hotel.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} hotels`);
    console.log(`❌ Failed updates: ${errorCount} hotels`);
    console.log(`📊 Total processed: ${hotels.length} hotels`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: verification, error: verifyError } = await supabase
      .from('hotels')
      .select('name, images')
      .eq('location->country', 'Sri Lanka')
      .limit(5);

    if (verifyError) {
      console.log(`❌ Verification failed: ${verifyError.message}`);
    } else {
      console.log('✅ Sample updated hotels:');
      verification.forEach(hotel => {
        console.log(`   • ${hotel.name}: ${hotel.images?.length || 0} images`);
      });
    }

  } catch (error) {
    console.error('💥 Update failed:', error.message);
    process.exit(1);
  }
}

// Function to add custom images for specific hotels
async function addCustomImages() {
  console.log('\n🎨 Adding custom images for specific hotels...\n');

  const customUpdates = [
    {
      name: 'Royal Palace Kandy',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
      ]
    },
    {
      name: 'Colombo Grand Imperial',
      images: [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
      ]
    }
  ];

  for (const update of customUpdates) {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ images: update.images })
        .eq('name', update.name);

      if (error) {
        console.log(`❌ Failed to update ${update.name}: ${error.message}`);
      } else {
        console.log(`✅ Custom images added for ${update.name}`);
      }
    } catch (error) {
      console.log(`❌ Error updating ${update.name}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log('🏨 Hotel Images Update Script');
  console.log('============================\n');

  // Check if we should run custom updates
  const args = process.argv.slice(2);
  const runCustom = args.includes('--custom');

  if (runCustom) {
    await addCustomImages();
  } else {
    await updateHotelImages();
  }

  console.log('\n🎉 Image update process completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Test your API to see the new images');
  console.log('2. Check a sample hotel: SELECT name, images FROM hotels WHERE location->>\'city\' = \'Kandy\' LIMIT 1;');
  console.log('3. Verify images are loading correctly in your frontend');
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { updateHotelImages, addCustomImages };
