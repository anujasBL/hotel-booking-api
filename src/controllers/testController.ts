import { Request, Response } from 'express';
import { logger } from '../config/logger';
import ragSearchService from '../services/ragSearchService';
import { supabase } from '../config/database';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Test endpoint to generate embeddings for all hotels
 */
export const generateAllEmbeddings = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Starting embedding generation for all hotels');
  
  try {
    await ragSearchService.generateHotelEmbeddings();
    
    // Check how many hotels now have embeddings
    const { data: stats } = await supabase
      .rpc('check_embedding_stats')
      .single();
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Embeddings generated successfully',
        stats
      },
      message: 'Hotel embeddings generated successfully',
    };

    res.json(response);
  } catch (error) {
    logger.error('Failed to generate embeddings:', error);
    throw error;
  }
});

/**
 * Test endpoint to check embedding status
 */
export const checkEmbeddingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { data: hotels } = await supabase
    .from('hotels')
    .select(`
      id,
      name,
      location,
      search_vector
    `)
    .eq('location->>country', 'Sri Lanka')
    .limit(10);

  const stats = {
    totalHotels: hotels?.length || 0,
    hotelsWithEmbeddings: hotels?.filter(h => h.search_vector).length || 0,
    sampleHotels: hotels?.map(h => ({
      name: h.name,
      city: h.location?.city,
      hasEmbedding: !!h.search_vector
    }))
  };

  const response: ApiResponse = {
    success: true,
    data: stats,
    message: 'Embedding status retrieved successfully',
  };

  res.json(response);
});

/**
 * Test RAG search with simple query
 */
export const testRagSearch = asyncHandler(async (req: Request, res: Response) => {
  const query = req.body.query || 'hotel in Kandy';
  
  logger.info('Testing RAG search with query:', query);
  
  const result = await ragSearchService.searchHotels({
    query,
    checkIn: new Date('2025-09-12'),
    checkOut: new Date('2025-09-13'),
    guests: {
      adults: 2,
      children: 0,
      rooms: 1
    }
  });

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `RAG search completed. Found ${result.totalResults} results`,
  };

  res.json(response);
});
