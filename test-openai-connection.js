// Test script to verify OpenAI API connection
// Run this with: node test-openai-connection.js

const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAIConnection() {
  console.log('🔍 Testing OpenAI API Connection...\n');
  
  // Check if API key is set
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key configured:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with sk-:', apiKey?.startsWith('sk-') || false);
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is not set!');
    console.log('Please add OPENAI_API_KEY=your_api_key to your .env file');
    return;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log('\n🧪 Testing embeddings API...');
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'Test hotel search query',
    });
    
    console.log('✅ Success! Embedding generated');
    console.log('Embedding length:', response.data[0].embedding.length);
    console.log('First few values:', response.data[0].embedding.slice(0, 5));
    
    console.log('\n🧪 Testing chat completions API...');
    
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "API test successful"' }
      ],
      max_tokens: 10,
    });
    
    console.log('✅ Chat API Success!');
    console.log('Response:', chatResponse.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
    
    if (error.code === 'invalid_api_key') {
      console.log('\n💡 Solution: Your OpenAI API key is invalid.');
      console.log('1. Check your .env file');
      console.log('2. Verify the key at https://platform.openai.com/api-keys');
      console.log('3. Make sure the key starts with "sk-"');
    } else if (error.code === 'insufficient_quota') {
      console.log('\n💡 Solution: Your OpenAI account has exceeded its quota.');
      console.log('1. Check billing at https://platform.openai.com/account/billing');
      console.log('2. Add payment method if needed');
      console.log('3. Check usage limits');
    }
  }
}

testOpenAIConnection();
