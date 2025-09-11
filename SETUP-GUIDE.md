# Hotel Booking API - Setup Guide

This guide will help you set up the complete Hotel Booking API with Google Gemini integration and vector search capabilities.

## 🚀 Quick Setup (3 Steps)

### Step 1: Database Setup
Run the main database setup script in your **Supabase SQL Editor**:

```sql
-- Copy and paste the entire content of sql-scripts/supabase-setup.sql
```

### Step 2: Add Sri Lankan Hotels
Run the extended Sri Lankan hotels script in your **Supabase SQL Editor**:

```sql
-- Copy and paste the entire content of sql-scripts/sri-lanka-hotels-extended.sql
```

### Step 3: Generate Embeddings
Run the embedding generation script in your terminal:

```bash
node generate-embeddings-script.js
```

## 📁 Project Structure

### Root Directory (Essential Files)
```
hotel-booking-api/
├── generate-embeddings-script.js   # Generate embeddings (RUN THIS THIRD)
├── setup.js                        # Setup verification script
├── test-gemini-connection.js       # Test Google Gemini API
├── package.json                    # Dependencies
├── README.md                       # Project documentation
├── SETUP-GUIDE.md                  # This setup guide
├── SETUP.md                        # Development setup
├── DEPLOYMENT.md                   # Deployment guide
├── api-examples.http               # API testing examples
└── src/                           # Source code
```

### sql-scripts/ Directory (All SQL Scripts)
```
sql-scripts/
├── supabase-setup.sql              # Main database setup (RUN THIS FIRST)
├── sri-lanka-hotels-extended.sql   # Sri Lankan hotels data (RUN THIS SECOND)
├── supabase-setup-consolidated.sql # Consolidated setup (reference only)
├── sri-lanka-hotels.sql            # Basic Sri Lankan hotels
├── sample-data.sql                 # Additional sample data
└── sri-lanka-missing-data-fix.sql  # Missing data fixes
```

## 🔧 Environment Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Required environment variables**:
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google Gemini
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   
   # JWT
   JWT_SECRET=your_jwt_secret
   
   # CORS
   FRONTEND_URL=http://localhost:3001
   ```

## 🗄️ Database Setup Order

### 1. Main Setup (Required)
```sql
-- Run in Supabase SQL Editor
-- File: sql-scripts/supabase-setup.sql
```

### 2. Hotel Data (Required)
```sql
-- Run in Supabase SQL Editor  
-- File: sql-scripts/sri-lanka-hotels-extended.sql
```

### 3. Generate Embeddings (Required)
```bash
# Run in terminal
node generate-embeddings-script.js
```

### 4. Optional Additional Data
```sql
-- Run in Supabase SQL Editor (optional)
-- File: sql-scripts/sample-data.sql
-- File: sql-scripts/sri-lanka-missing-data-fix.sql
```

## 🧪 Testing

### Verify Complete Setup
```bash
npm run setup
```

### Test Google Gemini Connection
```bash
npm run test-gemini
```

### Generate Embeddings
```bash
npm run generate-embeddings
```

### Test API Endpoints
```bash
# Start the server
npm run dev

# Test traditional search
curl "http://localhost:3000/api/v1/hotels/search?city=Kandy&checkIn=2025-09-11&checkOut=2025-09-12&adults=2&children=0&rooms=1"

# Test RAG search
curl -X POST http://localhost:3000/api/v1/hotels/chat-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need a room from Kandy today",
    "checkIn": "2025-09-11T06:00:00.000Z",
    "checkOut": "2025-09-12T06:00:00.000Z",
    "guests": {
      "adults": 2,
      "children": 0,
      "rooms": 1
    }
  }'
```

## 📊 Verification

### Check Database Setup
```sql
-- Run in Supabase SQL Editor
SELECT * FROM check_embedding_stats();
```

### Check API Health
```bash
curl http://localhost:3000/api/v1/health
```

### View API Documentation
- Open: http://localhost:3000/docs

## 🎯 Expected Results

After successful setup:
- ✅ **39 Sri Lankan hotels** with rooms and inventory
- ✅ **100% embedding coverage** for vector search
- ✅ **Traditional search** working for Kandy, Colombo, etc.
- ✅ **RAG search** working with natural language queries
- ✅ **API documentation** available at `/docs`

## 🆘 Troubleshooting

### Common Issues

1. **"Vector similarity search failed"**
   - Run `node generate-embeddings-script.js`
   - Check embedding stats: `SELECT * FROM check_embedding_stats();`

2. **"No search results"**
   - Verify hotel data: `SELECT COUNT(*) FROM hotels WHERE location->>'country' = 'Sri Lanka';`
   - Check room inventory: `SELECT COUNT(*) FROM room_inventory;`

3. **"Google Gemini API error"**
   - Test connection: `node test-gemini-connection.js`
   - Verify API key in `.env` file

4. **"Function does not exist"**
   - Re-run `sql-scripts/supabase-setup.sql` in Supabase SQL Editor

## 📝 Next Steps

1. **Customize hotel data** in `sql-scripts/sample-data.sql`
2. **Add more cities** by extending the hotel data
3. **Configure authentication** for production use
4. **Set up monitoring** and logging
5. **Deploy to production** using `DEPLOYMENT.md`

## 🔗 Useful Links

- [API Documentation](http://localhost:3000/docs)
- [Health Check](http://localhost:3000/api/v1/health)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Gemini API](https://ai.google.dev/)
