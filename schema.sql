-- TravelMate Essential Database Schema (SQLite / PostgreSQL / MySQL compatible)

-- 1. Trips
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    duration INTEGER NOT NULL,
    budget REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    traveller_type TEXT NOT NULL,
    traveller_count INTEGER NOT NULL DEFAULT 1,
    travel_style TEXT NOT NULL,
    accommodation TEXT,
    pace TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Itinerary
CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    city TEXT NOT NULL,
    hotel TEXT,
    activities TEXT NOT NULL, -- JSON string containing morning, afternoon, evening slots & notes
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- 3. Packing
CREATE TABLE IF NOT EXISTS packing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_packed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- 4. Budget
CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    title TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
