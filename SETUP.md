# Hotel Booking API - Setup Guide

This guide will help you set up and run the Hotel Booking API on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### 1. Node.js and npm
- **Download and install Node.js** (version 18 or higher) from: https://nodejs.org/
- This will also install npm (Node Package Manager)
- After installation, verify by running:
  ```bash
  node --version
  npm --version
  ```

### 2. Supabase Account
- Create a free account at: https://supabase.com/
- Create a new project
- Note down your project URL and API keys

### 3. OpenAI Account
- Create an account at: https://platform.openai.com/
- Get your API key from the API keys section

## Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your actual credentials:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-that-should-be-at-least-32-characters-long

   # CORS Configuration
   FRONTEND_URL=http://localhost:3001

   # Logging
   LOG_LEVEL=info
   ```

### Step 3: Database Setup
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `src/config/database-setup.sql`
4. Run the SQL script to create all tables and functions

### Step 4: Start the Development Server
```bash
npm run dev
```

The API will be available at:
- **API Base URL**: http://localhost:3000/api/v1
- **Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/api/v1/health

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Supabase client setup
│   ├── env.ts        # Environment validation
│   ├── logger.ts     # Winston logger setup
│   ├── openai.ts     # OpenAI client setup
│   └── swagger.ts    # API documentation setup
├── controllers/      # HTTP request handlers
│   ├── hotelController.ts
│   ├── bookingController.ts
│   └── userController.ts
├── middleware/       # Custom middleware
│   ├── auth.ts       # Authentication middleware
│   ├── cors.ts       # CORS configuration
│   ├── errorHandler.ts # Error handling
│   ├── requestLogger.ts # Request logging
│   └── validation.ts # Input validation
├── models/           # TypeScript interfaces
│   ├── User.ts       # User data models
│   ├── Hotel.ts      # Hotel data models
│   └── Booking.ts    # Booking data models
├── routes/           # Express routes
│   ├── hotelRoutes.ts
│   ├── bookingRoutes.ts
│   ├── userRoutes.ts
│   ├── docsRoutes.ts
│   └── index.ts
├── services/         # Business logic
│   ├── authService.ts
│   ├── hotelService.ts
│   ├── bookingService.ts
│   └── ragSearchService.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── constants.ts  # App constants
│   ├── helpers.ts    # Helper functions
│   ├── validation.ts # Zod schemas
│   └── index.ts
└── server.ts         # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Hotels
- `GET /api/v1/hotels/search` - Search hotels with filters
- `POST /api/v1/hotels/chat-search` - AI-powered semantic search
- `GET /api/v1/hotels/:id` - Get hotel details

### Bookings
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings` - Get user's bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `POST /api/v1/bookings/:id/cancel` - Cancel booking
- `POST /api/v1/bookings/availability/check` - Check availability

## Features

### ✅ Completed Features
- **Traditional Hotel Search**: Filter by city, dates, occupancy, amenities, price
- **AI/RAG Semantic Search**: Natural language queries using OpenAI embeddings
- **User Authentication**: Supabase Auth with JWT tokens
- **Booking Management**: Complete CRUD operations
- **Availability Checking**: Real-time room availability
- **Input Validation**: Comprehensive Zod schemas
- **Error Handling**: Structured error responses
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Logging**: Winston-based request and error logging
- **Security**: CORS, Helmet, JWT authentication

### 🔧 Configuration Required
- **Environment Variables**: Set up `.env` file
- **Database Schema**: Run SQL setup script in Supabase
- **OpenAI API**: Configure embeddings for semantic search

### 🚀 Next Steps
1. Set up your Supabase project and run the database schema
2. Configure your environment variables
3. Install Node.js and project dependencies
4. Start the development server
5. Test the API endpoints using the Swagger documentation

## Testing the API

Once the server is running, you can:

1. **View API Documentation**: http://localhost:3000/docs
2. **Check Health**: http://localhost:3000/api/v1/health
3. **Test Search**: 
   ```bash
   curl "http://localhost:3000/api/v1/hotels/search?city=New%20York&checkIn=2024-12-01&checkOut=2024-12-03&adults=2"
   ```
4. **Test AI Search**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/hotels/chat-search \
     -H "Content-Type: application/json" \
     -d '{"query": "luxury hotel with spa in New York"}'
   ```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the project root
   - Check that all required variables are set

2. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Ensure database schema is properly set up

3. **OpenAI API Errors**
   - Check API key validity
   - Ensure you have sufficient credits

4. **Port Already in Use**
   - Change PORT in `.env` file
   - Or kill process using the port

For more help, check the logs in the `logs/` directory or the console output.

## Production Deployment

For production deployment, consider:

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use production Supabase instance
3. **Secrets**: Use secure secret management
4. **Logging**: Configure log aggregation
5. **Monitoring**: Set up health checks and alerts
6. **SSL**: Enable HTTPS
7. **Rate Limiting**: Add API rate limits

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review the logs for error details
3. Verify environment configuration
4. Check Supabase and OpenAI service status
