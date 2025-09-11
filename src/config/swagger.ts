import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hotel Booking API',
    version: '1.0.0',
    description: 'A comprehensive hotel booking system API with AI-powered search capabilities',
    contact: {
      name: 'Hotel Booking Team',
      email: 'api@hotelbooking.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.app.port}/api/v1`,
      description: 'Development server',
    },
    {
      url: 'https://api.hotelbooking.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token',
      },
    },
    schemas: {
      // Error Response
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
        },
      },

      // Pagination Meta
      PaginationMeta: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 100,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          hasNext: {
            type: 'boolean',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            example: false,
          },
        },
      },

      // User Schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phoneNumber: {
            type: 'string',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },

      RegisterUserRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'password123',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phoneNumber: {
            type: 'string',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
          },
        },
      },

      LoginUserRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },

      UpdateUserRequest: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phoneNumber: {
            type: 'string',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-01',
          },
        },
      },

      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'def50200...',
          },
        },
      },

      // Hotel Schemas
      Hotel: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            example: 'Grand Palace Hotel',
          },
          description: {
            type: 'string',
            example: 'Luxury hotel in the heart of the city',
          },
          starRating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            example: 5,
          },
          location: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
          amenities: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant'],
            },
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
            },
          },
          minPrice: {
            type: 'number',
            example: 150.00,
          },
          maxPrice: {
            type: 'number',
            example: 500.00,
          },
          averageRating: {
            type: 'number',
            example: 4.5,
          },
          totalReviews: {
            type: 'integer',
            example: 120,
          },
        },
      },

      // Booking Schemas
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          bookingReference: {
            type: 'string',
            example: 'HTL123456ABC',
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
          },
          checkInDate: {
            type: 'string',
            format: 'date',
          },
          checkOutDate: {
            type: 'string',
            format: 'date',
          },
          guests: {
            type: 'object',
            properties: {
              adults: { type: 'integer' },
              children: { type: 'integer' },
            },
          },
          roomsBooked: {
            type: 'integer',
            example: 1,
          },
          pricing: {
            type: 'object',
            properties: {
              roomRate: { type: 'number' },
              totalNights: { type: 'integer' },
              subtotal: { type: 'number' },
              taxes: { type: 'number' },
              fees: { type: 'number' },
              total: { type: 'number' },
              currency: { type: 'string', example: 'USD' },
            },
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded'],
          },
        },
      },

      CreateBookingRequest: {
        type: 'object',
        required: ['hotelId', 'roomId', 'checkInDate', 'checkOutDate', 'guests', 'guestInfo', 'roomsBooked', 'paymentMethod'],
        properties: {
          hotelId: {
            type: 'string',
            format: 'uuid',
          },
          roomId: {
            type: 'string',
            format: 'uuid',
          },
          checkInDate: {
            type: 'string',
            format: 'date',
          },
          checkOutDate: {
            type: 'string',
            format: 'date',
          },
          guests: {
            type: 'object',
            properties: {
              adults: { type: 'integer', minimum: 1 },
              children: { type: 'integer', minimum: 0 },
            },
          },
          guestInfo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phoneNumber: { type: 'string' },
              },
            },
          },
          roomsBooked: {
            type: 'integer',
            minimum: 1,
          },
          paymentMethod: {
            type: 'string',
            example: 'credit_card',
          },
          specialRequests: {
            type: 'string',
            example: 'Late check-in',
          },
        },
      },

      UpdateBookingRequest: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
          },
          guestInfo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phoneNumber: { type: 'string' },
              },
            },
          },
          specialRequests: {
            type: 'string',
          },
          cancellationReason: {
            type: 'string',
          },
        },
      },

      AvailabilityCheckRequest: {
        type: 'object',
        required: ['hotelId', 'roomId', 'checkInDate', 'checkOutDate', 'roomsRequested'],
        properties: {
          hotelId: {
            type: 'string',
            format: 'uuid',
          },
          roomId: {
            type: 'string',
            format: 'uuid',
          },
          checkInDate: {
            type: 'string',
            format: 'date',
          },
          checkOutDate: {
            type: 'string',
            format: 'date',
          },
          roomsRequested: {
            type: 'integer',
            minimum: 1,
          },
        },
      },

      AvailabilityResult: {
        type: 'object',
        properties: {
          isAvailable: {
            type: 'boolean',
          },
          availableRooms: {
            type: 'integer',
          },
          rate: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
          restrictions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },

      ChatSearchResult: {
        type: 'object',
        properties: {
          hotels: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Hotel',
            },
          },
          query: {
            type: 'string',
          },
          processingTime: {
            type: 'integer',
            description: 'Processing time in milliseconds',
          },
          totalResults: {
            type: 'integer',
          },
          searchMetadata: {
            type: 'object',
            properties: {
              embedding: {
                type: 'array',
                items: { type: 'number' },
              },
              similarityThreshold: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Users',
      description: 'User authentication and profile management',
    },
    {
      name: 'Hotels',
      description: 'Hotel search and management',
    },
    {
      name: 'Bookings',
      description: 'Hotel booking management',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/controllers/*.ts',
    './src/routes/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
