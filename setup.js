#!/usr/bin/env node

/**
 * Hotel Booking API Setup Script
 * This script helps verify the setup process
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function checkSetup() {
  console.log('🔍 Checking Hotel Booking API Setup...\n');

  // Check 1: Environment Variables
  console.log('1. Checking environment variables...');
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_GEMINI_API_KEY',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('   Please check your .env file\n');
    return false;
  }
  console.log('✅ All environment variables configured\n');

  // Check 2: Database Connection
  console.log('2. Testing database connection...');
  try {
    const { data, error } = await supabase.from('hotels').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('   Please run sql-scripts/supabase-setup.sql in Supabase SQL Editor\n');
    return false;
  }

  // Check 3: Hotel Data
  console.log('3. Checking hotel data...');
  try {
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('id, name, location')
      .eq('location->country', 'Sri Lanka')
      .limit(5);

    if (error) throw error;
    
    if (hotels.length === 0) {
      console.log('❌ No Sri Lankan hotels found');
      console.log('   Please run sql-scripts/sri-lanka-hotels-extended.sql in Supabase SQL Editor\n');
      return false;
    }
    
    console.log(`✅ Found ${hotels.length} Sri Lankan hotels`);
    console.log(`   Sample: ${hotels[0].name} in ${hotels[0].location.city}\n`);
  } catch (error) {
    console.log('❌ Error checking hotel data:', error.message);
    return false;
  }

  // Check 4: Embeddings
  console.log('4. Checking embeddings...');
  try {
    const { data: stats, error } = await supabase
      .rpc('check_embedding_stats')
      .single();

    if (error) throw error;

    if (stats.hotels_with_embeddings === 0) {
      console.log('❌ No hotels have embeddings');
      console.log('   Please run: node generate-embeddings-script.js\n');
      return false;
    }

    console.log(`✅ Embeddings: ${stats.hotels_with_embeddings}/${stats.total_hotels} hotels (${stats.embedding_percentage}%)\n`);
  } catch (error) {
    console.log('❌ Error checking embeddings:', error.message);
    console.log('   Please run: node generate-embeddings-script.js\n');
    return false;
  }

  // Check 5: Google Gemini API
  console.log('5. Testing Google Gemini API...');
  try {
    const model = gemini.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent({
      content: { parts: [{ text: 'test' }] },
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    if (!result.embedding?.values || result.embedding.values.length === 0) {
      throw new Error('Invalid embedding response');
    }

    console.log(`✅ Google Gemini API working (${result.embedding.values.length} dimensions)\n`);
  } catch (error) {
    console.log('❌ Google Gemini API error:', error.message);
    console.log('   Please check your GOOGLE_GEMINI_API_KEY\n');
    return false;
  }

  // Check 6: Vector Search Function
  console.log('6. Testing vector search function...');
  try {
    const testVector = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
    const { data, error } = await supabase
      .rpc('search_hotels_by_similarity_generic', {
        query_embedding: testVector,
        similarity_threshold: 0.1,
        match_count: 1
      });

    if (error) throw error;
    console.log('✅ Vector search function working\n');
  } catch (error) {
    console.log('❌ Vector search function error:', error.message);
    console.log('   Please re-run sql-scripts/supabase-setup.sql\n');
    return false;
  }

  console.log('🎉 Setup verification complete!');
  console.log('✅ Your Hotel Booking API is ready to use!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test the API: http://localhost:3000/api/v1/health');
  console.log('3. View docs: http://localhost:3000/docs');
  console.log('4. Test search: http://localhost:3000/api/v1/hotels/search?city=Kandy');

  return true;
}

// Run the setup check
if (require.main === module) {
  checkSetup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Setup check failed:', error.message);
      process.exit(1);
    });
}

module.exports = { checkSetup };
