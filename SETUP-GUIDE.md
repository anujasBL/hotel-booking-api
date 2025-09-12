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
-- File: sql-scripts/update-hotel-images.sql
```

### 5. Setup Image Storage (Optional)
```sql
-- Run in Supabase SQL Editor to enable image uploads
-- File: sql-scripts/setup-supabase-storage.sql
```

### 6. Setup Image Classification (Optional)
```bash
# Setup intelligent image classification system
npm run setup-images
```

### 7. Update Hotel Images (Optional)
```bash
# Option 1: Use external URLs (Unsplash)
npm run update-images

# Option 2: Upload your own images to Supabase Storage
npm run upload-images list                    # List available hotels
npm run upload-images upload "Hotel Name" ./images/  # Upload images

# Option 3: Intelligent classification and upload
npm run classify-images ./images              # Auto-classify and upload images

# Or run the SQL script directly in Supabase SQL Editor
-- File: sql-scripts/update-hotel-images.sql
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

## 🖼️ Image Management

### Option 1: External URLs (Unsplash)
Quick setup with high-quality external images:

```bash
# Update all hotels with Unsplash images
npm run update-images
```

**Features:**
- High-quality, royalty-free images from Unsplash
- Optimized for web (800x600 pixels)
- Categorized by hotel type (luxury, business, budget, eco, heritage)

### Option 2: Supabase Storage (Your Own Images)
Upload and manage your own images:

#### Setup Storage
```sql
-- Run in Supabase SQL Editor
-- File: sql-scripts/setup-supabase-storage.sql
```

#### Upload Images
```bash
# List available hotels
npm run upload-images list

# Upload single image
npm run upload-images upload "Royal Palace Kandy" ./images/hotel1.jpg

# Upload multiple images
npm run upload-images upload "Royal Palace Kandy" ./images/hotel1.jpg ./images/hotel2.jpg

# Upload all images from directory
npm run upload-images upload "Royal Palace Kandy" ./images/

# Delete all images for a hotel
npm run upload-images delete "Royal Palace Kandy"
```

**Features:**
- Store images directly in Supabase
- Public URLs for easy access
- 5MB file size limit
- Support for JPEG, PNG, WebP, GIF
- Automatic URL generation
- Image management functions

### Option 3: Intelligent Image Classification (AI-Powered)
Automatically classify and assign images to hotels:

#### Setup Classification System
```bash
# Setup the intelligent classification system
npm run setup-images
```

#### Classify and Upload Images
```bash
# Auto-classify and upload all images from a folder
npm run classify-images ./images

# The system will automatically:
# 1. Analyze each image (colors, brightness, contrast, visual elements)
# 2. Classify images by type (luxury, business, budget, eco, heritage, beach, mountain)
# 3. Find best matching hotels based on characteristics
# 4. Upload to Supabase Storage
# 5. Update hotel records with image URLs
```

**AI Classification Features:**
- **Visual Analysis**: Analyzes colors, brightness, contrast, and visual elements
- **Smart Matching**: Matches images to hotels based on star rating, amenities, and location
- **Automatic Upload**: Direct upload to Supabase Storage with organized file structure
- **Intelligent Categorization**: 7 categories (luxury, business, budget, eco, heritage, beach, mountain)
- **Confidence Scoring**: Provides confidence scores for each classification
- **Batch Processing**: Processes entire folders of images automatically

**Classification Rules:**
- **Luxury**: 5-star hotels, palaces, resorts with spa/butler services
- **Business**: 4-5 star hotels with business centers and meeting rooms
- **Budget**: 2-3 star hotels, inns, rest houses with basic amenities
- **Eco**: Nature-focused hotels with sustainable features
- **Heritage**: Colonial, historic, traditional architecture
- **Beach**: Coastal hotels with ocean views and water sports
- **Mountain**: Hill country hotels with scenic views and hiking trails

### Image Storage Structure
```
Supabase Storage:
├── hotel-images/
│   ├── hotels/
│   │   ├── {hotel-id}/
│   │   │   ├── image_1.jpg
│   │   │   ├── image_2.jpg
│   │   │   └── image_3.jpg
│   │   └── ...
│   └── room-images/ (optional)
```

### Database Functions
```sql
-- Add image to hotel
SELECT add_hotel_image('hotel-id', 'path/to/image.jpg', 1);

-- Remove image from hotel
SELECT remove_hotel_image('hotel-id', 1);

-- Get public URL
SELECT get_public_url('hotel-images', 'hotels/hotel-id/image_1.jpg');
```

### Manual Image Updates
```sql
-- Update with custom URLs
UPDATE hotels 
SET images = ARRAY[
    'https://your-domain.com/image1.jpg',
    'https://your-domain.com/image2.jpg'
]
WHERE name = 'Your Hotel Name';

-- Update with Supabase Storage URLs
UPDATE hotels 
SET images = ARRAY[
    'https://your-project.supabase.co/storage/v1/object/public/hotel-images/hotels/hotel-id/image_1.jpg'
]
WHERE name = 'Your Hotel Name';
```

## 8. Sync Hotel Images (After Upload)

After uploading images to Supabase Storage, you need to update the hotel records with the new image URLs:

### **Check Image Status**
```bash
# See which hotels have images and their sync status
npm run image-status
```

### **Sync All Hotel Images**
```bash
# Update all hotel records with their uploaded images
npm run sync-images
```

### **Sync Specific Hotel**
```bash
# Update a specific hotel's images
node update-hotel-images-array.js sync-hotel <hotel-id>
```

### **What the Sync Script Does**
- ✅ **Fetches all hotels** from the database
- ✅ **Checks Supabase Storage** for uploaded images
- ✅ **Generates public URLs** for all stored images
- ✅ **Updates hotel records** with the correct image URLs
- ✅ **Shows detailed progress** and results
- ✅ **Handles errors gracefully** and continues processing

## 📝 Next Steps

1. **Upload and sync hotel images** using the provided scripts
2. **Customize hotel data** in `sql-scripts/sample-data.sql`
3. **Add more cities** by extending the hotel data
4. **Configure authentication** for production use
5. **Set up monitoring** and logging
6. **Deploy to production** using `DEPLOYMENT.md`

## 🔗 Useful Links

- [API Documentation](http://localhost:3000/docs)
- [Health Check](http://localhost:3000/api/v1/health)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Gemini API](https://ai.google.dev/)
