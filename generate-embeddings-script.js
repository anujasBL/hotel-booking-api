// =====================================================
// GENERATE EMBEDDINGS FOR ALL HOTELS
// =====================================================
// This script generates embeddings for all hotels using Google Gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMBEDDING_CONFIG = {
  model: 'text-embedding-004',
  dimensions: 768,
  taskType: 'RETRIEVAL_DOCUMENT',
};

/**
 * Generate embedding for text using Google Gemini
 */
async function generateEmbedding(text) {
  try {
    const model = gemini.getGenerativeModel({ model: EMBEDDING_CONFIG.model });
    const result = await model.embedContent({
      content: { parts: [{ text: text.slice(0, 8000) }] },
      taskType: EMBEDDING_CONFIG.taskType,
    });
    
    if (!result.embedding?.values || result.embedding.values.length === 0) {
      throw new Error('Invalid embedding response from Google Gemini');
    }
    
    return result.embedding.values;
  } catch (error) {
    console.error('Failed to generate embedding:', error.message);
    throw error;
  }
}

/**
 * Create text for embedding from hotel data
 */
function createEmbeddingText(hotel) {
  const parts = [
    hotel.name,
    hotel.description,
    `Located in ${hotel.location?.city}, ${hotel.location?.state}, ${hotel.location?.country}`,
    `Address: ${hotel.location?.address}`,
  ];

  if (hotel.amenities && hotel.amenities.length > 0) {
    parts.push(`Amenities: ${hotel.amenities.join(', ')}`);
  }

  return parts.filter(Boolean).join('. ');
}

/**
 * Generate embeddings for all hotels
 */
async function generateAllEmbeddings() {
  try {
    console.log('🚀 Starting embedding generation...');

    // Get all hotels
    const { data: hotels, error: fetchError } = await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true);

    if (fetchError) {
      throw new Error(`Failed to fetch hotels: ${fetchError.message}`);
    }

    console.log(`📊 Found ${hotels.length} hotels to process`);

    let successCount = 0;
    let errorCount = 0;

    // Process hotels in batches
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      
      try {
        console.log(`Processing hotel ${i + 1}/${hotels.length}: ${hotel.name}`);
        
        // Create embedding text
        const embeddingText = createEmbeddingText(hotel);
        
        // Generate embedding
        const embedding = await generateEmbedding(embeddingText);
        
        // Update hotel with embedding
        const { error: updateError } = await supabase
          .from('hotels')
          .update({ search_vector: `[${embedding.join(',')}]` })
          .eq('id', hotel.id);

        if (updateError) {
          throw new Error(`Failed to update hotel: ${updateError.message}`);
        }

        successCount++;
        console.log(`✅ Successfully processed: ${hotel.name}`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to process ${hotel.name}:`, error.message);
      }
    }

    console.log('\n🎉 Embedding generation completed!');
    console.log(`✅ Successfully processed: ${successCount} hotels`);
    console.log(`❌ Failed to process: ${errorCount} hotels`);

    // Check final stats
    const { data: stats } = await supabase
      .rpc('check_embedding_stats')
      .single();
    
    console.log('\n📊 Final Statistics:');
    console.log(`Total hotels: ${stats.total_hotels}`);
    console.log(`Hotels with embeddings: ${stats.hotels_with_embeddings}`);
    console.log(`Hotels without embeddings: ${stats.hotels_without_embeddings}`);
    console.log(`Embedding percentage: ${stats.embedding_percentage}%`);

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateAllEmbeddings()
    .then(() => {
      console.log('✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateAllEmbeddings };
