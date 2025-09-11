import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './env';

// Initialize Google Gemini client
export const gemini = new GoogleGenerativeAI(config.gemini.apiKey);

// Configuration for embeddings
export const EMBEDDING_CONFIG = {
  model: 'text-embedding-004', // Latest Gemini embedding model
  dimensions: 768, // Gemini text-embedding-004 produces 768-dimensional embeddings
  taskType: 'RETRIEVAL_DOCUMENT', // For document retrieval
} as const;

export const CHAT_CONFIG = {
  model: 'gemini-1.5-flash', // For chat completions
  temperature: 0,
  maxOutputTokens: 500,
} as const;

export default gemini;