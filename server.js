const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'travelmate.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 1. Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schemaSql);
db.exec('PRAGMA foreign_keys = ON;');

// Seed initial trip if database is empty
const countQuery = db.prepare('SELECT COUNT(*) as count FROM trips;');
const { count } = countQuery.get();

if (count === 0) {
  const tripId = 'trip-kyoto-spring';
  const insertTrip = db.prepare(`
    INSERT INTO trips (id, destination, start_date, end_date, duration, budget, currency, traveller_type, traveller_count, travel_style, accommodation, pace)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTrip.run(
    tripId, 'Kyoto, Japan', '2026-04-10', '2026-04-15', 5, 1800, 'USD',
    'Couple / Pair', 2, 'Cultural & Historic', 'Boutique Ryokan Gion', 'Balanced & Steady (3-4 stops/day)'
  );

  // Seed default 5 days itinerary
  const insertItin = db.prepare(`
    INSERT INTO itineraries (trip_id, day_number, city, hotel, activities)
    VALUES (?, ?, ?, ?, ?)
  `);

  const mockDays = [
    {
      dayNumber: 1,
      title: "Day 1: Arrival & Gentle Beginnings",
      city: "Kyoto",
      hotel: "Boutique Ryokan Gion",
      weather: "☀️ 22°C Clear & Mild",
      morning: { time: "08:30 AM - 11:30 AM", title: "Early Sunrise Walk & Bakery Treats", desc: "Beat the crowds to capture serene golden hour photos. Stop by a beloved local pastry shop.", tag: "Sunrise & Coffee" },
      afternoon: { time: "01:00 PM - 04:30 PM", title: "Historic Old Town & Hidden Alleys", desc: "Stroll along historic cobblestones, explore artisan workshops, and shop for postcards.", tag: "Culture & Sights" },
      evening: { time: "06:30 PM - 09:30 PM", title: "Cozy Lantern-lit Dinner & Drinks", desc: "Unwind at a quaint local tavern or eatery. Savor regional specialities.", tag: "Gastronomy" },
      journalNote: "Scrapbook reminder: Pick up stamps at the post office!",
      photoUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=70"
    },
    {
      dayNumber: 2,
      title: "Day 2: Exploring Temples & Bamboo",
      city: "Kyoto",
      hotel: "Boutique Ryokan Gion",
      weather: "⛅ 20°C Breezy",
      morning: { time: "08:30 AM - 11:30 AM", title: "Arashiyama Bamboo Sanctuary", desc: "Towering green bamboo stalks swaying in morning breeze.", tag: "Scenic Panorama" },
      afternoon: { time: "01:00 PM - 04:30 PM", title: "Art Museum & Zen Rock Garden", desc: "Discover tranquil courtyards and contemporary exhibits, followed by iced matcha.", tag: "Art & Leisure" },
      evening: { time: "06:30 PM - 09:30 PM", title: "Riverside Stroll & Street Food", desc: "Sample vibrant street stalls, sweet dango skewers by Kamogawa river.", tag: "Night Walk" },
      journalNote: "Tasted the most delicious matcha soft serve today!",
      photoUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=70"
    }
  ];

  mockDays.forEach(d => {
    insertItin.run(tripId, d.dayNumber, d.city, d.hotel, JSON.stringify(d));
  });

  // Seed default packing
  const insertPacking = db.prepare(`
    INSERT INTO packing_items (trip_id, item_name, category, is_packed)
    VALUES (?, ?, ?, ?)
  `);
  insertPacking.run(tripId, 'Passport & Visa copies', 'Documents', 1);
  insertPacking.run(tripId, 'Lightweight linen shirts (x4)', 'Clothing', 0);
  insertPacking.run(tripId, 'Comfortable walking sneakers', 'Clothing', 1);
  insertPacking.run(tripId, 'Mini skincare bottles', 'Toiletries', 1);
  insertPacking.run(tripId, 'Universal travel plug adapter', 'Tech & Gear', 1);

  // Seed default budget
  const insertBudget = db.prepare(`
    INSERT INTO budget_items (trip_id, category, amount, title)
    VALUES (?, ?, ?, ?)
  `);
  insertBudget.run(tripId, 'Accommodation', 520, 'Ryokan Booking Deposit');
  insertBudget.run(tripId, 'Transport', 110, 'Regional Rail Pass');
  insertBudget.run(tripId, 'Food & Dining', 45, 'Tea Ceremony & Wagashi');
}

// 2. Helper: JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// 3. Helper: Parse Request Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// 4. HTTP Server Router
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API Routes
  try {
    // GET /api/trips : List all trips
    if (pathname === '/api/trips' && method === 'GET') {
      const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC;').all();
      return sendJson(res, 200, trips);
    }

    // POST /api/trips : Create new trip
    if (pathname === '/api/trips' && method === 'POST') {
      const body = await parseBody(req);
      const id = body.id || `trip-${Date.now()}`;
      const insert = db.prepare(`
        INSERT INTO trips (id, destination, start_date, end_date, duration, budget, currency, traveller_type, traveller_count, travel_style, accommodation, pace)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(
        id,
        body.destination || '',
        body.startDate || body.start_date || '',
        body.endDate || body.end_date || '',
        parseInt(body.duration) || 1,
        parseFloat(body.budget) || 0,
        body.currency || 'USD',
        body.travellerType || body.traveller_type || 'Solo',
        parseInt(body.travellerCount || body.traveller_count) || 1,
        body.travelStyle || body.travel_style || 'Cultural',
        body.accommodation || '',
        body.pace || ''
      );

      // If days were sent, insert itinerary
      if (Array.isArray(body.days)) {
        const insertItin = db.prepare(`
          INSERT INTO itineraries (trip_id, day_number, city, hotel, activities)
          VALUES (?, ?, ?, ?, ?)
        `);
        body.days.forEach(d => {
          insertItin.run(id, d.dayNumber, d.city || '', d.hotel || '', JSON.stringify(d));
        });
      }

      const created = db.prepare('SELECT * FROM trips WHERE id = ?;').get(id);
      return sendJson(res, 201, created);
    }

    // Match /api/trips/:id
    const tripMatch = pathname.match(/^\/api\/trips\/([^/]+)$/);
    if (tripMatch) {
      const tripId = tripMatch[1];

      // GET /api/trips/:id : Get trip with itinerary, packing, budget
      if (method === 'GET') {
        const trip = db.prepare('SELECT * FROM trips WHERE id = ?;').get(tripId);
        if (!trip) return sendJson(res, 404, { error: 'Trip not found' });

        const itineraries = db.prepare('SELECT * FROM itineraries WHERE trip_id = ? ORDER BY day_number ASC;').all(tripId);
        const days = itineraries.map(r => {
          try { return JSON.parse(r.activities); } catch (e) { return r; }
        });

        const packing = db.prepare('SELECT * FROM packing_items WHERE trip_id = ? ORDER BY id ASC;').all(tripId);
        const budget = db.prepare('SELECT * FROM budget_items WHERE trip_id = ? ORDER BY id ASC;').all(tripId);

        return sendJson(res, 200, { trip, days, packing, budget });
      }

      // PUT /api/trips/:id : Update trip
      if (method === 'PUT') {
        const body = await parseBody(req);
        const update = db.prepare(`
          UPDATE trips
          SET destination = COALESCE(?, destination),
              budget = COALESCE(?, budget),
              currency = COALESCE(?, currency),
              accommodation = COALESCE(?, accommodation),
              pace = COALESCE(?, pace)
          WHERE id = ?
        `);
        update.run(body.destination, body.budget, body.currency, body.accommodation, body.pace, tripId);
        const updated = db.prepare('SELECT * FROM trips WHERE id = ?;').get(tripId);
        return sendJson(res, 200, updated);
      }

      // DELETE /api/trips/:id : Delete trip
      if (method === 'DELETE') {
        db.prepare('DELETE FROM trips WHERE id = ?;').run(tripId);
        return sendJson(res, 200, { success: true, deletedId: tripId });
      }
    }

    // Match /api/trips/:id/packing
    const packingMatch = pathname.match(/^\/api\/trips\/([^/]+)\/packing$/);
    if (packingMatch && method === 'POST') {
      const tripId = packingMatch[1];
      const body = await parseBody(req);
      const insert = db.prepare(`
        INSERT INTO packing_items (trip_id, item_name, category, is_packed)
        VALUES (?, ?, ?, ?)
      `);
      const result = insert.run(tripId, body.name || body.item_name, body.category || 'General', body.is_packed ? 1 : 0);
      return sendJson(res, 201, { id: Number(result.lastInsertRowid), trip_id: tripId, ...body });
    }

    // Match /api/trips/:id/packing/:itemId
    const packingItemMatch = pathname.match(/^\/api\/trips\/([^/]+)\/packing\/(\d+)$/);
    if (packingItemMatch) {
      const [, tripId, itemId] = packingItemMatch;
      if (method === 'PUT') {
        const body = await parseBody(req);
        db.prepare('UPDATE packing_items SET is_packed = ? WHERE id = ? AND trip_id = ?;')
          .run(body.is_packed ? 1 : 0, itemId, tripId);
        return sendJson(res, 200, { success: true });
      }
      if (method === 'DELETE') {
        db.prepare('DELETE FROM packing_items WHERE id = ? AND trip_id = ?;').run(itemId, tripId);
        return sendJson(res, 200, { success: true });
      }
    }

    // Match /api/trips/:id/budget
    const budgetMatch = pathname.match(/^\/api\/trips\/([^/]+)\/budget$/);
    if (budgetMatch && method === 'POST') {
      const tripId = budgetMatch[1];
      const body = await parseBody(req);
      const insert = db.prepare(`
        INSERT INTO budget_items (trip_id, category, amount, title)
        VALUES (?, ?, ?, ?)
      `);
      const result = insert.run(tripId, body.category || 'Other', parseFloat(body.amount) || 0, body.title || '');
      return sendJson(res, 201, { id: Number(result.lastInsertRowid), trip_id: tripId, ...body });
    }

    // 5. Static File Server for Frontend
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    // 404 Not Found
    return sendJson(res, 404, { error: 'Not Found' });

  } catch (error) {
    console.error('Server error:', error);
    return sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`TravelMate backend listening on http://localhost:${PORT}`);
});
