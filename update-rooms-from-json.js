#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map friendly room type names to enum values used in DB
function mapRoomType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('presidential')) return 'presidential';
  if (n.includes('suite')) return 'suite';
  if (n.includes('deluxe')) return 'deluxe';
  if (n.includes('family')) return 'family';
  if (n.includes('accessible')) return 'accessible';
  return 'standard';
}

function buildMaxOccupancy(value) {
  const adults = typeof value === 'number' ? value : 2;
  return { adults, children: Math.max(0, Math.min(2, Math.floor((adults - 2) / 2))) };
}

function buildBedConfiguration(maxOccupancy) {
  const adults = maxOccupancy?.adults || 2;
  const beds = adults <= 2 ? [{ type: 'queen', count: 1 }] : [{ type: 'queen', count: 2 }];
  return { beds };
}

async function getHotelByName(name) {
  const { data, error } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('name', name)
    .single();
  if (error) return null;
  return data;
}

async function ensureHotel(hotel) {
  const existing = await getHotelByName(hotel.name);
  if (existing) return existing.id;

  const payload = {
    name: hotel.name,
    description: hotel.description || null,
    star_rating: hotel.star_rating || '3',
    location: {
      address: hotel.location?.address || null,
      city: hotel.location?.city || null,
      state: hotel.location?.state || null,
      country: hotel.location?.country || 'Sri Lanka',
    },
    amenities: hotel.amenities || [],
    images: hotel.images || [],
    is_active: true,
  };

  const { data, error } = await supabase
    .from('hotels')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertRooms(hotelId, rooms) {
  for (const room of rooms) {
    const maxOcc = typeof room.max_occupancy === 'number' ? buildMaxOccupancy(room.max_occupancy) : (room.max_occupancy || buildMaxOccupancy(2));
    const bedConfig = room.bed_configuration || buildBedConfiguration(maxOcc);

    const payload = {
      hotel_id: hotelId,
      room_number: room.room_number || null,
      type: mapRoomType(room.type),
      description: room.description || room.type || null,
      max_occupancy: maxOcc,
      bed_configuration: bedConfig,
      amenities: room.amenities || [],
      images: room.images || [],
      base_price: room.base_price ?? 10000,
      is_active: room.is_active !== false,
    };

    // Upsert strategy: if a room with same type exists, update; else insert
    const { data: existing, error: fetchErr } = await supabase
      .from('rooms')
      .select('id')
      .eq('hotel_id', hotelId)
      .eq('type', payload.type)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      const { error } = await supabase
        .from('rooms')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('rooms')
        .insert(payload);
      if (error) throw error;
    }
  }
}

async function updateHotelCoreFields(hotelId, hotel) {
  const update = {};
  if (hotel.star_rating) update.star_rating = hotel.star_rating;
  if (hotel.location) {
    update.location = {
      address: hotel.location.address || null,
      city: hotel.location.city || null,
      state: hotel.location.state || null,
      country: hotel.location.country || 'Sri Lanka',
    };
  }
  if (Array.isArray(hotel.amenities)) update.amenities = hotel.amenities;
  if (Array.isArray(hotel.images)) update.images = hotel.images;

  if (Object.keys(update).length === 0) return;

  const { error } = await supabase
    .from('hotels')
    .update(update)
    .eq('id', hotelId);
  if (error) throw error;
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.log('Usage: node update-rooms-from-json.js <path-to-json>');
    console.log('Example: node update-rooms-from-json.js data/hotels-with-rooms.example.json');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let items = [];
  try {
    items = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Invalid JSON:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(items)) {
    console.error('❌ JSON must be an array of hotel objects');
    process.exit(1);
  }

  console.log(`🏨 Updating ${items.length} hotels with room data...`);

  let processed = 0, created = 0, updated = 0, roomsUpserted = 0, failed = 0;

  for (const hotel of items) {
    try {
      const hotelId = await ensureHotel(hotel);
      await updateHotelCoreFields(hotelId, hotel);
      await upsertRooms(hotelId, hotel.rooms || []);

      processed++;
      updated++;

      roomsUpserted += (hotel.rooms || []).length;
      console.log(`✅ ${hotel.name}: updated with ${hotel.rooms?.length || 0} rooms`);
    } catch (err) {
      failed++;
      console.error(`❌ ${hotel.name || 'Unknown Hotel'}: ${err.message}`);
    }
  }

  console.log('\n📈 Summary');
  console.log('==========');
  console.log(`Processed: ${processed}`);
  console.log(`Updated/Created Hotels: ${updated}`);
  console.log(`Rooms Upserted: ${roomsUpserted}`);
  console.log(`Failed: ${failed}`);
}

if (require.main === module) {
  main();
}
