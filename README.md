# Hotel Booking API

A comprehensive Node.js + Express API backend built with TypeScript for a hotel booking system. Features traditional search capabilities and AI-powered semantic search using OpenAI embeddings and Supabase vector database.

## Features

- 🏨 **Hotel Search**: Traditional filtering by city, dates, and occupancy
- 🤖 **AI/RAG Search**: Natural language semantic search using OpenAI embeddings
- 📅 **Booking Management**: Complete CRUD operations for hotel bookings
- 🔐 **Authentication**: Secure JWT-based auth via Supabase Auth
- 📊 **Database**: Supabase with pgvector for vector similarity search
- 📝 **API Documentation**: Auto-generated Swagger/OpenAPI docs
- ✅ **Validation**: Request payload validation using Zod
- 📋 **Logging**: Comprehensive logging with Winston

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI/ML**: OpenAI API for embeddings
- **Authentication**: Supabase Auth (JWT)
- **Validation**: Zod
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access API documentation**:
   - API Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/health

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `OPENAI_API_KEY` | OpenAI API key for embeddings |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Server port (default: 3000) |

## API Endpoints

### Hotels
- `GET /api/v1/hotels/search` - Traditional hotel search with filters
- `POST /api/v1/hotels/chat-search` - AI-powered semantic search

### Bookings
- `GET /api/v1/bookings` - List user's bookings
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Users
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── services/         # Business logic
├── models/          # TypeScript interfaces
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # Type definitions
└── server.ts        # Application entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## License

MIT
