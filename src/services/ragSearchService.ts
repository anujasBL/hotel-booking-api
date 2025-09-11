import { gemini, EMBEDDING_CONFIG, CHAT_CONFIG } from '../config/gemini';
import { supabase } from '../config/database';
import { logger } from '../config/logger';
import { config } from '../config/env';
import { HotelWithAvailability } from '../models/Hotel';
import { ChatSearchQuery, ChatSearchResult } from '../types';
import { AppError } from '../middleware/errorHandler';
import hotelService from './hotelService';

export class RagSearchService {
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly MAX_RESULTS = 10;

  /**
   * Perform semantic search for hotels using natural language query
   */
  async searchHotels(searchQuery: ChatSearchQuery): Promise<ChatSearchResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting RAG search:', { query: searchQuery.query });

      // Step 1: Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(searchQuery.query);

      // Step 2: Perform vector similarity search
      const similarHotels = await this.performVectorSearch(queryEmbedding, searchQuery);

      // Step 3: Enhance results with availability and pricing
      const hotelsWithAvailability = await this.enhanceWithAvailability(similarHotels, searchQuery);

      // Step 4: Apply additional filters
      const filteredHotels = this.applyFilters(hotelsWithAvailability, searchQuery);

      const processingTime = Date.now() - startTime;

      logger.info('RAG search completed:', {
        query: searchQuery.query,
        resultsFound: filteredHotels.length,
        processingTime: `${processingTime}ms`,
      });

      return {
        hotels: filteredHotels.slice(0, this.MAX_RESULTS),
        query: searchQuery.query,
        processingTime,
        totalResults: filteredHotels.length,
        searchMetadata: {
          embedding: queryEmbedding,
          similarityThreshold: this.SIMILARITY_THRESHOLD,
        },
      };
    } catch (error) {
      logger.error('RAG search failed:', { query: searchQuery.query, error });
      throw error instanceof AppError ? error : new AppError('Semantic search failed', 500);
    }
  }

  /**
   * Generate embeddings for hotel descriptions and store them
   */
  async generateHotelEmbeddings(hotelId?: string): Promise<void> {
    try {
      logger.info('Generating hotel embeddings:', { hotelId });

      let query = supabase.from('hotels').select('id, name, description, amenities, location');
      
      if (hotelId) {
        query = query.eq('id', hotelId);
      }

      const { data: hotels, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch hotels for embedding generation', 500);
      }

      for (const hotel of hotels || []) {
        const embeddingText = this.createEmbeddingText(hotel);
        const embedding = await this.generateEmbedding(embeddingText);

        // Store embedding in database
        const { error: updateError } = await supabase
          .from('hotels')
          .update({ embedding })
          .eq('id', hotel.id);

        if (updateError) {
          logger.error('Failed to store embedding for hotel:', { hotelId: hotel.id, error: updateError });
        } else {
          logger.debug('Embedding stored for hotel:', { hotelId: hotel.id });
        }
      }

      logger.info('Hotel embeddings generation completed');
    } catch (error) {
      logger.error('Hotel embeddings generation failed:', error);
      throw error instanceof AppError ? error : new AppError('Failed to generate embeddings', 500);
    }
  }

  /**
   * Generate embedding using OpenAI API
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.debug('Generating embedding for text:', { textLength: text.length, model: EMBEDDING_CONFIG.model });
      
      // Get the embedding model
      const model = gemini.getGenerativeModel({ 
        model: EMBEDDING_CONFIG.model 
      });

      // Generate embedding using Google Gemini
      const result = await model.embedContent({
        content: {
          parts: [{ text: text.slice(0, 8000) }], // Limit input length
        },
        taskType: EMBEDDING_CONFIG.taskType,
      });

      if (!result.embedding?.values || result.embedding.values.length === 0) {
        logger.error('Invalid embedding response from Google Gemini:', result);
        throw new AppError('Invalid embedding response from Google Gemini', 500);
      }

      logger.debug('Successfully generated embedding:', { embeddingLength: result.embedding.values.length });
      return result.embedding.values;
    } catch (error: any) {
      logger.error('Failed to generate embedding:', {
        error: error.message,
        code: error.code,
        status: error.status,
        apiKeyConfigured: !!config.gemini.apiKey,
        apiKeyLength: config.gemini.apiKey?.length || 0
      });
      
      // Provide more specific error messages for Google Gemini
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key')) {
        throw new AppError('Google Gemini API key is invalid. Please check your GOOGLE_GEMINI_API_KEY environment variable.', 500);
      } else if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('quota')) {
        throw new AppError('Google Gemini API quota exceeded. Please check your billing and quota limits.', 500);
      } else if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.message?.includes('rate limit')) {
        throw new AppError('Google Gemini API rate limit exceeded. Please try again later.', 429);
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        throw new AppError('Network error connecting to Google Gemini API. Please check your internet connection.', 500);
      }
      
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to generate text embedding: ${error.message}`, 500);
    }
  }

  /**
   * Create text for embedding from hotel data
   */
  private createEmbeddingText(hotel: any): string {
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
   * Perform vector similarity search in Supabase
   */
  private async performVectorSearch(
    queryEmbedding: number[], 
    searchQuery: ChatSearchQuery
  ): Promise<any[]> {
    try {
      // Use Supabase's vector similarity search with pgvector
      const { data: hotels, error } = await supabase.rpc('search_hotels_by_similarity_flexible', {
        query_embedding: queryEmbedding,
        similarity_threshold: this.SIMILARITY_THRESHOLD,
        match_count: this.MAX_RESULTS * 2, // Get more results for filtering
      });

      if (error) {
        logger.error('Vector search failed:', error);
        throw new AppError('Vector similarity search failed', 500);
      }

      return hotels || [];
    } catch (error) {
      logger.error('Vector search error:', error);
      throw error instanceof AppError ? error : new AppError('Vector search failed', 500);
    }
  }

  /**
   * Enhance search results with availability and pricing
   */
  private async enhanceWithAvailability(
    hotels: any[], 
    searchQuery: ChatSearchQuery
  ): Promise<HotelWithAvailability[]> {
    const enhancedHotels: HotelWithAvailability[] = [];

    for (const hotel of hotels) {
      try {
        const filters = {
          checkIn: searchQuery.checkIn,
          checkOut: searchQuery.checkOut,
          adults: searchQuery.guests?.adults || 1,
          children: searchQuery.guests?.children || 0,
          rooms: searchQuery.guests?.rooms || 1,
        };

        const hotelWithAvailability = await hotelService.getHotelById(hotel.id, filters);
        
        // Only include hotels that have available rooms (if dates are specified)
        if (!searchQuery.checkIn || hotelWithAvailability.availableRooms.length > 0) {
          enhancedHotels.push({
            ...hotelWithAvailability,
            similarity: hotel.similarity, // Add similarity score from vector search
          } as any);
        }
      } catch (error) {
        logger.warn('Failed to enhance hotel with availability:', { hotelId: hotel.id, error });
        // Continue with other hotels even if one fails
      }
    }

    return enhancedHotels;
  }

  /**
   * Apply additional filters from the search query
   */
  private applyFilters(
    hotels: HotelWithAvailability[], 
    searchQuery: ChatSearchQuery
  ): HotelWithAvailability[] {
    let filteredHotels = [...hotels];

    if (searchQuery.filters) {
      // Apply price filter
      if (searchQuery.filters.maxPrice !== undefined) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.minPrice <= searchQuery.filters!.maxPrice!
        );
      }

      // Apply star rating filter
      if (searchQuery.filters.starRating && searchQuery.filters.starRating.length > 0) {
        filteredHotels = filteredHotels.filter(hotel => 
          searchQuery.filters!.starRating!.includes(hotel.starRating)
        );
      }

      // Apply amenities filter
      if (searchQuery.filters.amenities && searchQuery.filters.amenities.length > 0) {
        filteredHotels = filteredHotels.filter(hotel => 
          searchQuery.filters!.amenities!.some(amenity => 
            hotel.amenities.includes(amenity as any)
          )
        );
      }
    }

    // Sort by similarity score (highest first)
    return filteredHotels.sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0));
  }

  /**
   * Extract search intent and entities from natural language query
   */
  async extractSearchIntent(query: string): Promise<{
    intent: string;
    entities: {
      location?: string;
      dateRange?: { checkIn?: Date; checkOut?: Date };
      guests?: { adults?: number; children?: number; rooms?: number };
      amenities?: string[];
      budget?: { min?: number; max?: number };
      preferences?: string[];
    };
  }> {
    try {
      // Use Google Gemini to extract structured information from natural language
      const systemPrompt = `
        You are a travel assistant that extracts structured information from hotel search queries.
        Analyze the user query and extract relevant information in JSON format.
        
        Extract the following if mentioned:
        - location: city, state, country
        - dateRange: check-in and check-out dates
        - guests: number of adults, children, rooms
        - amenities: pool, gym, wifi, parking, etc.
        - budget: price range
        - preferences: luxury, budget, family-friendly, business, etc.
        
        Return only valid JSON.
        
        User query: ${query}
      `;

      const model = gemini.getGenerativeModel({ 
        model: CHAT_CONFIG.model,
        generationConfig: {
          temperature: CHAT_CONFIG.temperature,
          maxOutputTokens: CHAT_CONFIG.maxOutputTokens,
        },
      });

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();

      const extractedInfo = JSON.parse(responseText || '{}');

      return {
        intent: 'hotel_search',
        entities: extractedInfo,
      };
    } catch (error) {
      logger.warn('Failed to extract search intent:', { query, error });
      return {
        intent: 'hotel_search',
        entities: {},
      };
    }
  }
}

export default new RagSearchService();
