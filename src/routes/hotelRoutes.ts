import { Router } from 'express';
import hotelController from '../controllers/hotelController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  hotelSearchSchema, 
  chatSearchSchema, 
  uuidParamSchema,
  paginationSchema 
} from '../utils/validation';

const router = Router();

/**
 * @route GET /api/v1/hotels/search
 * @desc Search hotels with traditional filters
 * @access Public
 */
router.get(
  '/search',
  validate({ query: hotelSearchSchema }),
  hotelController.searchHotels
);

/**
 * @route POST /api/v1/hotels/chat-search
 * @desc AI-powered semantic hotel search
 * @access Public
 */
router.post(
  '/chat-search',
  validate({ body: chatSearchSchema }),
  hotelController.chatSearch
);

/**
 * @route GET /api/v1/hotels/:id
 * @desc Get hotel details by ID
 * @access Public
 */
router.get(
  '/:id',
  validate({ params: uuidParamSchema }),
  hotelController.getHotelById
);

/**
 * @route GET /api/v1/hotels/:id/rooms
 * @desc Get rooms for a hotel
 * @access Public
 */
router.get(
  '/:id/rooms',
  validate({ params: uuidParamSchema }),
  hotelController.getHotelRooms
);

/**
 * @route GET /api/v1/hotels
 * @desc Get all hotels (admin endpoint)
 * @access Private (Admin)
 */
router.get(
  '/',
  authenticate,
  hotelController.getAllHotels
);

/**
 * @route POST /api/v1/hotels/embeddings/generate
 * @desc Generate embeddings for hotels (admin endpoint)
 * @access Private (Admin)
 */
router.post(
  '/embeddings/generate',
  authenticate,
  hotelController.generateEmbeddings
);

export default router;
