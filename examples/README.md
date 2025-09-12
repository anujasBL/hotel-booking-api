# Examples

This directory contains example scripts and files to help you get started with the Hotel Booking API.

## 📁 Files

- `upload-images-example.js` - Example of how to upload hotel images to Supabase Storage
- `classification-example.js` - Example of intelligent image classification system

## 🖼️ Image Upload Examples

### Basic Usage

```bash
# List all available hotels
npm run upload-images list

# Upload images for a specific hotel
npm run upload-images upload "Royal Palace Kandy" ./images/hotel1.jpg

# Upload multiple images
npm run upload-images upload "Royal Palace Kandy" ./images/hotel1.jpg ./images/hotel2.jpg

# Upload all images from a directory
npm run upload-images upload "Royal Palace Kandy" ./images/

# Delete all images for a hotel
npm run upload-images delete "Royal Palace Kandy"
```

### Programmatic Usage

```javascript
const { uploadHotelImages, getHotelByName } = require('./upload-hotel-images');

// Get hotel by name
const hotel = await getHotelByName('Royal Palace Kandy');

// Upload images
const imagePaths = ['./image1.jpg', './image2.jpg'];
const uploadedUrls = await uploadHotelImages(hotel.id, imagePaths);

console.log('Uploaded URLs:', uploadedUrls);
```

## 📋 Prerequisites

1. **Setup Supabase Storage**:
   ```sql
   -- Run in Supabase SQL Editor
   -- File: sql-scripts/setup-supabase-storage.sql
   ```

2. **Environment Variables**:
   Make sure your `.env` file contains:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 🎯 Image Requirements

- **File Size**: Maximum 5MB per image
- **Formats**: JPEG, PNG, WebP, GIF
- **Recommended**: 800x600 pixels for optimal web display
- **Naming**: Use descriptive names (e.g., `hotel-exterior.jpg`, `hotel-room.jpg`)

## 🤖 Intelligent Image Classification

### Demo the Classification System
```bash
# Run the classification demo
node examples/classification-example.js
```

### Use the Classification System
```bash
# Setup the classification system
npm run setup-images

# Classify and upload images automatically
npm run classify-images ./images
```

### How It Works
1. **Image Analysis**: Analyzes colors, brightness, contrast, and visual elements
2. **Classification**: Categorizes images into 7 types (luxury, business, budget, eco, heritage, beach, mountain)
3. **Hotel Matching**: Finds best matching hotels based on characteristics
4. **Upload**: Automatically uploads to Supabase Storage
5. **Update**: Updates hotel records with image URLs

### Classification Categories
- **Luxury**: 5-star hotels, palaces, resorts with spa/butler services
- **Business**: 4-5 star hotels with business centers and meeting rooms
- **Budget**: 2-3 star hotels, inns, rest houses with basic amenities
- **Eco**: Nature-focused hotels with sustainable features
- **Heritage**: Colonial, historic, traditional architecture
- **Beach**: Coastal hotels with ocean views and water sports
- **Mountain**: Hill country hotels with scenic views and hiking trails

## 🔧 Troubleshooting

### Common Issues

1. **"Bucket not found"**
   - Run `sql-scripts/setup-supabase-storage.sql` in Supabase SQL Editor

2. **"File too large"**
   - Compress your images to under 5MB
   - Use tools like ImageOptim or TinyPNG

3. **"Invalid file type"**
   - Convert images to JPEG, PNG, WebP, or GIF format

4. **"Hotel not found"**
   - Check hotel name spelling: `npm run upload-images list`
   - Use exact hotel name from the list

5. **"Sharp not installed"**
   - Run `npm run setup-images` to install dependencies
   - Or manually install: `npm install sharp`

6. **"No matching hotels found"**
   - Check if your images match the classification criteria
   - Try organizing images by category in subdirectories
   - Review the classification rules in the main script

### Getting Help

- Check the main [SETUP-GUIDE.md](../SETUP-GUIDE.md)
- Review the [classify-and-upload-images.js](../classify-and-upload-images.js) script
- Test with the example scripts:
  - `node examples/upload-images-example.js`
  - `node examples/classification-example.js`
