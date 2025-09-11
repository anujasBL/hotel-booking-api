// Test script to verify Google Gemini API connection
// Run this with: node test-gemini-connection.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiConnection() {
  console.log('🔍 Testing Google Gemini API Connection...\n');
  
  // Check if API key is set
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyDejjqwM0EJn05KZD2p9XUjmDwaVPlMe8s';
  console.log('API Key configured:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with AIza:', apiKey?.startsWith('AIza') || false);
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY environment variable is not set!');
    console.log('Please add GOOGLE_GEMINI_API_KEY=your_api_key to your .env file');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('\n🧪 Testing embeddings API...');
    
    // Test embedding generation
    const embeddingModel = genAI.getGenerativeModel({ 
      model: 'text-embedding-004' 
    });

    const embeddingResult = await embeddingModel.embedContent({
      content: {
        parts: [{ text: 'Test hotel search query for embedding' }],
      },
      taskType: 'RETRIEVAL_DOCUMENT',
    });
    
    console.log('✅ Embedding Success! Generated embedding');
    console.log('Embedding dimensions:', embeddingResult.embedding.values.length);
    console.log('First few values:', embeddingResult.embedding.values.slice(0, 5));
    
    console.log('\n🧪 Testing chat completions API...');
    
    // Test chat generation
    const chatModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 50,
      },
    });

    const chatResult = await chatModel.generateContent('Say "Gemini API test successful"');
    const response = chatResult.response.text();
    
    console.log('✅ Chat API Success!');
    console.log('Response:', response);
    
    console.log('\n🎉 All tests passed! Google Gemini is ready to use.');
    
  } catch (error) {
    console.error('❌ Google Gemini API Error:', {
      message: error.message,
      status: error.status,
      code: error.code
    });
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key')) {
      console.log('\n💡 Solution: Your Google Gemini API key is invalid.');
      console.log('1. Check your .env file');
      console.log('2. Verify the key at https://aistudio.google.com/app/apikey');
      console.log('3. Make sure the key starts with "AIza"');
    } else if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      console.log('\n💡 Solution: Your Google Gemini account has exceeded its quota.');
      console.log('1. Check usage at https://aistudio.google.com/app/apikey');
      console.log('2. Check if billing is enabled');
    } else if (error.message?.includes('permission') || error.message?.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Solution: API key lacks required permissions.');
      console.log('1. Enable the Generative Language API');
      console.log('2. Make sure the API key has proper permissions');
    }
  }
}

testGeminiConnection();
