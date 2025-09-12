# Hotel Images Directory

This directory contains hotel images that will be automatically classified and uploaded to Supabase.

## Directory Structure

- `luxury/` - Luxury hotel images (5-star, palaces, resorts)
- `business/` - Business hotel images (4-5 star, corporate)
- `budget/` - Budget hotel images (2-3 star, inns, rest houses)
- `eco/` - Eco-friendly hotel images (nature, sustainable)
- `heritage/` - Heritage hotel images (colonial, historic, traditional)
- `beach/` - Beach/coastal hotel images (ocean views, water sports)
- `mountain/` - Mountain/hill hotel images (scenic views, hiking)

## Image Requirements

- **Formats**: JPEG, PNG, WebP, GIF
- **Size**: Maximum 5MB per image
- **Recommended**: 800x600 pixels for optimal web display
- **Naming**: Use descriptive names (e.g., `hotel-exterior.jpg`, `hotel-lobby.jpg`)

## Usage

1. Place your hotel images in the appropriate subdirectories
2. Run: `npm run classify-images ./images`
3. The system will automatically:
   - Analyze each image
   - Classify it based on visual characteristics
   - Find the best matching hotels
   - Upload to Supabase Storage
   - Update hotel records with image URLs

## Classification Rules

The system uses the following criteria to classify images:

### Luxury Hotels
- Keywords: palace, grand, imperial, royal, luxury, resort, suite
- Visual cues: marble, gold, chandelier, elegant, opulent
- Star rating: 5 stars
- Amenities: spa, concierge, butler service, valet parking

### Business Hotels
- Keywords: business, executive, central, corporate, commercial
- Visual cues: modern, glass, steel, office, meeting, conference
- Star rating: 4-5 stars
- Amenities: business center, meeting rooms, airport shuttle

### Budget Hotels
- Keywords: budget, inn, rest house, economy, affordable
- Visual cues: simple, basic, clean, minimal, functional
- Star rating: 2-3 stars
- Amenities: wifi, parking

### Eco Hotels
- Keywords: eco, forest, nature, sustainable, green, organic
- Visual cues: wood, plants, natural, outdoor, garden, trees
- Star rating: 3-4 stars
- Amenities: eco friendly, solar power, organic food

### Heritage Hotels
- Keywords: heritage, colonial, historic, mansion, traditional
- Visual cues: antique, wooden, colonial, traditional, historic
- Star rating: 3-5 stars
- Amenities: heritage architecture, antique furniture

### Beach Hotels
- Keywords: beach, ocean, coastal, seaside, marina
- Visual cues: water, beach, ocean, waves, sand, palm
- Star rating: 3-5 stars
- Amenities: beach access, ocean view, water sports

### Mountain Hotels
- Keywords: mountain, hill, alpine, highland, peak
- Visual cues: mountain, hills, elevation, scenic, panoramic
- Star rating: 3-5 stars
- Amenities: mountain view, hiking trails, scenic views
