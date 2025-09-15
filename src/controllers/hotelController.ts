import { Request, Response } from 'express';
import { logger } from '../config/logger';
import hotelService from '../services/hotelService';
import ragSearchService from '../services/ragSearchService';
import { ApiResponse } from '../types';
import { HotelSearchInput, ChatSearchInput } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel search and management endpoints
 */

/**
 * @swagger
 * /api/v1/hotels/search:
 *   get:
 *     summary: Search hotels with traditional filters
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City to search in
 *       - in: query
 *         name: checkIn
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-in date
 *       - in: query
 *         name: checkOut
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-out date
 *       - in: query
 *         name: adults
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of adults
 *       - in: query
 *         name: children
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of children
 *       - in: query
 *         name: rooms
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of rooms
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Successful hotel search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     hotels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Hotel'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 */
export const searchHotels = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as unknown as HotelSearchInput;
  
  logger.info('Hotel search request:', { 
    filters: { 
      city: filters.city, 
      checkIn: filters.checkIn, 
      checkOut: filters.checkOut 
    } 
  });

  const result = await hotelService.searchHotels(filters);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Found ${result.hotels.length} hotels`,
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/hotels/chat-search:
 *   post:
 *     summary: AI-powered semantic hotel search
 *     tags: [Hotels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language search query
 *                 example: "I need a luxury hotel in New York with a spa and pool for my anniversary"
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *                 description: Check-in date
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *                 description: Check-out date
 *               guests:
 *                 type: object
 *                 properties:
 *                   adults:
 *                     type: integer
 *                     minimum: 1
 *                   children:
 *                     type: integer
 *                     minimum: 0
 *                   rooms:
 *                     type: integer
 *                     minimum: 1
 *               filters:
 *                 type: object
 *                 properties:
 *                   maxPrice:
 *                     type: number
 *                   starRating:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                   amenities:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successful semantic search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ChatSearchResult'
 */
export const chatSearch = asyncHandler(async (req: Request, res: Response) => {
  const searchQuery = req.body as ChatSearchInput;
  
  logger.info('Chat search request:', { query: searchQuery.query });

  const result = await ragSearchService.searchHotels(searchQuery);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Found ${result.totalResults} hotels matching your query`,
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/hotels/{id}:
 *   get:
 *     summary: Get hotel details by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hotel ID
 *       - in: query
 *         name: checkIn
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-in date for availability
 *       - in: query
 *         name: checkOut
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Check-out date for availability
 *       - in: query
 *         name: adults
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of adults
 *       - in: query
 *         name: children
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of children
 *       - in: query
 *         name: rooms
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of rooms
 *     responses:
 *       200:
 *         description: Hotel details retrieved successfully
 *       404:
 *         description: Hotel not found
 */
export const getHotelById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filters = req.query as any;
  
  logger.info('Get hotel by ID request:', { hotelId: id });

  const hotel = await hotelService.getHotelById(id, filters);

  const response: ApiResponse = {
    success: true,
    data: hotel,
    message: 'Hotel retrieved successfully',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/hotels:
 *   get:
 *     summary: Get all hotels (admin endpoint)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Hotels retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getAllHotels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  logger.info('Get all hotels request:', { page, limit });

  const result = await hotelService.getAllHotels(page, limit);

  const response: ApiResponse = {
    success: true,
    data: result,
    message: `Retrieved ${result.hotels.length} hotels`,
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/hotels/embeddings/generate:
 *   post:
 *     summary: Generate embeddings for hotels (admin endpoint)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelId:
 *                 type: string
 *                 format: uuid
 *                 description: Specific hotel ID (optional, if not provided, generates for all)
 *     responses:
 *       200:
 *         description: Embeddings generated successfully
 *       401:
 *         description: Unauthorized
 */
export const generateEmbeddings = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.body;
  
  logger.info('Generate embeddings request:', { hotelId });

  await ragSearchService.generateHotelEmbeddings(hotelId);

  const response: ApiResponse = {
    success: true,
    message: hotelId 
      ? `Embeddings generated for hotel ${hotelId}` 
      : 'Embeddings generated for all hotels',
  };

  res.json(response);
});

/**
 * @swagger
 * /api/v1/hotels/{id}/rooms:
 *   get:
 *     summary: Get rooms for a specific hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 */
export const getHotelRooms = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  logger.info('Get hotel rooms request:', { hotelId: id });

  const rooms = await hotelService.getRoomsByHotelId(id);

  const response: ApiResponse = {
    success: true,
    data: rooms,
    message: `Retrieved ${rooms.length} rooms`,
  };

  res.json(response);
});

export default {
  searchHotels,
  chatSearch,
  getHotelById,
  getAllHotels,
  generateEmbeddings,
  getHotelRooms,
};
