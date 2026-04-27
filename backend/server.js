require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { generateItinerary } = require("./planner");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TripWise backend is running");
});

app.get("/api/weather", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City required" });
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Weather error:", err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// ✅ Generate trip + save to DB
app.post("/api/trips/generate", async (req, res) => {
  try {
    const { city, startDate, endDate, days, budget, interests, style } = req.body;

    if (!city || !days) {
      return res.status(400).json({ error: "Missing city or days" });
    }

    const safeInterests = Array.isArray(interests) ? interests : [];
    const interestsJson = JSON.stringify(safeInterests);

    // Validate budget tier
    const validBudgets = ["budget", "midrange", "luxury"];
    const safeBudget = validBudgets.includes(budget) ? budget : "midrange";

    const tripInsert = db.prepare(
      `INSERT INTO trips (city, startDate, endDate, travelers, interests)
       VALUES (?, ?, ?, ?, ?)`
    );

    const trip = tripInsert.run(city, startDate || null, endDate || null, 1, interestsJson);
    const tripId = String(trip.lastInsertRowid);

    const itinerary = await generateItinerary({
      city,
      days: Number(days),
      budget: safeBudget,
      interests: safeInterests.length ? safeInterests : ["landmarks", "food", "museums"],
      style: style || "balanced",
    });

    const insert = db.prepare(
      `INSERT INTO itinerary
      (tripId, day, name, address, lat, lng, category, photoUrl, time, walkTime, driveTime, travelDistance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const tx = db.transaction((rows) => {
      rows.forEach((i) => {
        insert.run(
          tripId,
          i.day || 1,
          i.name || "",
          i.address || "",
          i.lat ?? null,
          i.lng ?? null,
          i.category || "",
          i.photoUrl || null,
          i.time || null,
          i.walkTime || null,
          i.driveTime || null,
          i.travelDistance || null
        );
      });
    });

    tx(itinerary);

    return res.json({ tripId, itinerary });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Get trip meta
app.get("/api/trips/:id", (req, res) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    return res.json(trip);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Get saved itinerary by tripId
app.get("/api/itinerary/:id", (req, res) => {
  try {
    const tripId = String(req.params.id);
    const rows = db.prepare(`SELECT * FROM itinerary WHERE tripId=? ORDER BY day, id`).all(tripId);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});

// ✅ Trip AI Summary
app.post("/api/trips/summary", (req, res) => {
  try {
    const { city, days, interests } = req.body;
    const safeInterests = Array.isArray(interests) ? interests : [];
    const summary = `Your ${days}-day trip to ${city} focuses on ${safeInterests.join(", ")}. Expect a mix of food, culture, and local experiences.`;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ✅ Get swap alternatives for a place
app.get("/api/swap-suggestions", async (req, res) => {
  try {
    const { city, category, excludeNames } = req.query;
    if (!city || !category) return res.status(400).json({ error: "city and category required" });

    const { searchPlaces } = require("./googlePlaces");

    const CATEGORY_QUERIES = {
      food: "best restaurants", landmarks: "top landmarks", museums: "best museums",
      nature: "parks gardens", shopping: "shopping areas", nightlife: "bars nightlife", adventure: "adventure activities",
    };

    let places = await searchPlaces({ city, query: CATEGORY_QUERIES[category] || category });

    const excluded = new Set(
      (excludeNames || "").split("|").map(n => n.trim().toLowerCase()).filter(Boolean)
    );
    places = places.filter(p => p?.name && !excluded.has(p.name.toLowerCase()));

    return res.json(places.slice(0, 4));
  } catch (e) {
    console.error("Swap suggestions error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});
app.get("/api/places-search", async (req, res) => {
  try {
    const { city, query } = req.query;
    if (!city || !query) return res.status(400).json({ error: "city and query required" });
    const { searchPlaces } = require("./googlePlaces");
    const places = await searchPlaces({ city, query });
    return res.json(places);
  } catch (e) {
    console.error("places-search error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
});
app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});