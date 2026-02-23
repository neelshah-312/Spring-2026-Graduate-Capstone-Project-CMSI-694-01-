const Database = require("better-sqlite3");

const db = new Database(process.env.DB_PATH || "./tripwise.db");

db.exec(`
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT,
  startDate TEXT,
  endDate TEXT,
  travelers INTEGER,
  interests TEXT
);

CREATE TABLE IF NOT EXISTS itinerary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER,
  day INTEGER,
  name TEXT,
  address TEXT,
  lat REAL,
  lng REAL,
  category TEXT,
  photoUrl TEXT
);
`);

module.exports = db;
