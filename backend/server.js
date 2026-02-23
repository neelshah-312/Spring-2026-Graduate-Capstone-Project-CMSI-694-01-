require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { generateItinerary } = require("./planner");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("TripWise backend is running");
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

    const travelers = 1;

    const tripInsert = db.prepare(
      `INSERT INTO trips (city, startDate, endDate, travelers, interests)
       VALUES (?, ?, ?, ?, ?)`
    );

    const trip = tripInsert.run(city, startDate || null, endDate || null, travelers, interestsJson);
    const tripId = String(trip.lastInsertRowid);

    const itinerary = await generateItinerary({
      city,
      days: Number(days),
      budget: Number(budget || 150),
      interests: safeInterests.length ? safeInterests : ["landmarks", "food", "museums"],
      style: style || "balanced",
    });

    const insert = db.prepare(
      `INSERT INTO itinerary (tripId, day, name, address, lat, lng, category, photoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
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
          i.photoUrl || null
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
// ✅ Get trip meta (city, startDate, endDate, etc.)
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

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});
