const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

// 0. Load .env file into process.env
const ENV_PATH = path.join(__dirname, '.env');
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'travelmate.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 1. Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schemaSql);
db.exec('PRAGMA foreign_keys = ON;');

// Helper: JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: Parse Request Body
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

// 2. HTTP Server Router
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

  try {
    // ==========================================
    // GROK AI TRIP GENERATION ENDPOINT
    // ==========================================
    if ((pathname === '/generate-trip' || pathname === '/api/generate-trip') && method === 'POST') {
      const body = await parseBody(req);
      const apiKey = process.env.XAI_API_KEY;

      if (!apiKey || apiKey === '$$$$$' || apiKey.trim() === '') {
        return sendJson(res, 400, {
          error: "XAI_API_KEY is not configured in .env. Please set your valid Grok API key from https://console.x.ai/",
          needsKey: true
        });
      }

      const {
        destination,
        startDate,
        endDate,
        duration = 5,
        budget = 1500,
        currency = 'USD',
        travellerType = 'Couple',
        travellerCount = 2,
        travelStyle = 'Cultural & Historic',
        accommodation = 'Boutique Hotel',
        pace = 'Balanced & Steady'
      } = body;

      const userPrompt = `
Generate a detailed pastel scrapbook travel plan for:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${duration} days)
- Total Budget: ${budget} ${currency}
- Travellers: ${travellerType} (${travellerCount} people)
- Travel Style: ${travelStyle}
- Preferred Accommodation: ${accommodation}
- Pace: ${pace}

Respond with ONLY a valid JSON object strictly matching this schema, without any markdown fences, backticks, or extra commentary:
{
  "title": "A short, cute title for the trip",
  "summary": "2 sentences describing the adventure",
  "weather_vibe": "Short realistic weather expectation (e.g. ☀️ 22°C Mild & Breezy)",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1: Catchy subtitle",
      "city": "${destination.split(',')[0]}",
      "hotel": "${accommodation}",
      "weather": "e.g. ☀️ 21°C Gentle Breezes",
      "morning": { "time": "08:30 AM - 11:30 AM", "title": "Activity name", "desc": "Short charming description", "tag": "Short tag" },
      "afternoon": { "time": "01:00 PM - 04:30 PM", "title": "Activity name", "desc": "Short charming description", "tag": "Short tag" },
      "evening": { "time": "06:30 PM - 09:30 PM", "title": "Activity name", "desc": "Short charming description", "tag": "Short tag" },
      "journalNote": "A cute scrapbook tip or souvenir suggestion"
    }
  ],
  "packingList": [
    { "name": "Item name tailored to weather & activity", "category": "Clothing" },
    { "name": "Item name tailored to weather & activity", "category": "Toiletries" },
    { "name": "Passport & Essential tickets", "category": "Documents" },
    { "name": "Camera or powerbank", "category": "Tech & Gear" },
    { "name": "Fun scrapbook item", "category": "Fun & Comfort" }
  ],
  "budgetBreakdown": {
    "Accommodation": 600,
    "Food & Dining": 400,
    "Activities & Sights": 250,
    "Transport": 150,
    "Shopping & Souvenirs": 100
  }
}
Note: Ensure you include exactly ${duration} day objects in the "days" array. Sum of budgetBreakdown should approximate total budget (${budget}). Packing list should include 8 to 12 realistic items taking expected weather into consideration.
`;

      let aiResponse;
      try {
        const grokFetch = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: 'You are an expert travel planner for TravelMate. You output exclusively strict, valid JSON with no markdown formatting, backticks, or explanatory text.'
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],
            temperature: 0.7
          })
        });

        if (!grokFetch.ok) {
          const errText = await grokFetch.text();
          console.error("Grok API Error Response:", errText);
          return sendJson(res, grokFetch.status, {
            error: `Grok API error (${grokFetch.status}): ${errText}`,
            canRetry: true
          });
        }

        aiResponse = await grokFetch.json();
      } catch (networkErr) {
        console.error("Network error connecting to Grok API:", networkErr);
        return sendJson(res, 502, {
          error: "Failed to connect to Grok API. Please check your internet connection and API key.",
          canRetry: true
        });
      }

      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) {
        return sendJson(res, 500, { error: "Empty response received from Grok AI.", canRetry: true });
      }

      // Clean markdown code blocks if any were returned
      let cleanedJson = content.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsedTrip;
      try {
        parsedTrip = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("Failed to parse Grok JSON:", cleanedJson);
        return sendJson(res, 500, { error: "Failed to parse structured response from Grok AI.", canRetry: true });
      }

      // Save to SQLite Database
      const tripId = `trip-${Date.now()}`;
      const insertTrip = db.prepare(`
        INSERT INTO trips (id, destination, start_date, end_date, duration, budget, currency, traveller_type, traveller_count, travel_style, accommodation, pace)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertTrip.run(
        tripId,
        destination,
        startDate,
        endDate,
        parseInt(duration),
        parseFloat(budget),
        currency,
        travellerType,
        parseInt(travellerCount),
        travelStyle,
        accommodation,
        pace
      );

      // Save days to itineraries
      if (Array.isArray(parsedTrip.days)) {
        const insertItin = db.prepare(`
          INSERT INTO itineraries (trip_id, day_number, city, hotel, activities)
          VALUES (?, ?, ?, ?, ?)
        `);
        parsedTrip.days.forEach(d => {
          insertItin.run(tripId, d.dayNumber, d.city || destination.split(',')[0], d.hotel || accommodation, JSON.stringify(d));
        });
      }

      // Save packing items
      if (Array.isArray(parsedTrip.packingList)) {
        const insertPacking = db.prepare(`
          INSERT INTO packing_items (trip_id, item_name, category, is_packed)
          VALUES (?, ?, ?, 0)
        `);
        parsedTrip.packingList.forEach(item => {
          insertPacking.run(tripId, item.name, item.category || 'Clothing');
        });
      }

      // Save budget breakdown
      if (parsedTrip.budgetBreakdown && typeof parsedTrip.budgetBreakdown === 'object') {
        const insertBudget = db.prepare(`
          INSERT INTO budget_items (trip_id, category, amount, title)
          VALUES (?, ?, ?, ?)
        `);
        Object.entries(parsedTrip.budgetBreakdown).forEach(([cat, amt]) => {
          insertBudget.run(tripId, cat, parseFloat(amt) || 0, `${cat} Allocation`);
        });
      }

      // Fetch saved trip and details to return
      const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?;').get(tripId);
      const itineraries = db.prepare('SELECT * FROM itineraries WHERE trip_id = ? ORDER BY day_number ASC;').all(tripId);
      const packing = db.prepare('SELECT * FROM packing_items WHERE trip_id = ? ORDER BY id ASC;').all(tripId);
      const budgetItems = db.prepare('SELECT * FROM budget_items WHERE trip_id = ? ORDER BY id ASC;').all(tripId);

      return sendJson(res, 201, {
        success: true,
        trip: createdTrip,
        title: parsedTrip.title,
        summary: parsedTrip.summary,
        days: itineraries.map(r => JSON.parse(r.activities)),
        packing: packing.map(p => ({ id: p.id, name: p.item_name, category: p.category, packed: !!p.is_packed })),
        budget: budgetItems,
        budgetBreakdown: parsedTrip.budgetBreakdown
      });
    }

    // ==========================================
    // STANDARD TRIP CRUD APIS
    // ==========================================

    // GET /api/trips : List all trips
    if (pathname === '/api/trips' && method === 'GET') {
      const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC;').all();
      return sendJson(res, 200, trips);
    }

    // POST /api/trips : Create manual trip
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

      // GET /api/trips/:id
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

      // PUT /api/trips/:id
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

      // DELETE /api/trips/:id
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

    // Static File Server
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

    return sendJson(res, 404, { error: 'Not Found' });

  } catch (error) {
    console.error('Server error:', error);
    return sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`TravelMate backend with Grok API integration listening on http://localhost:${PORT}`);
});
