const { searchPlaces } = require("./googlePlaces");
const { getTravelTime } = require("./distance");

const CATEGORIES = {
  food: "best restaurants",
  landmarks: "top landmarks",
  museums: "best museums",
  nature: "parks",
  shopping: "shopping areas",
  nightlife: "nightlife",
};

/* ---------- TIME LOGIC ---------- */

function parseStartHour(startTime) {
  if (!startTime) return 9;

  const [h, m] = startTime.split(":").map(Number);
  if (!h && h !== 0) return 9;

  return m === 0 ? h : Math.min(h + 1, 23);
}

function getCategoryByTime(hour, interests) {
  const rules = [
    { start: 6, end: 10, type: "food" },        // breakfast
    { start: 10, end: 14, type: "landmarks" },  // sightseeing
    { start: 14, end: 17, type: "museums" },
    { start: 17, end: 20, type: "shopping" },
    { start: 20, end: 23, type: "nightlife" },
  ];

  const rule = rules.find(r => hour >= r.start && hour < r.end);

  // fallback to user interests
  if (!rule) return interests[0];

  return interests.includes(rule.type)
    ? rule.type
    : interests[0];
}

/* ---------- DISTANCE LOGIC ---------- */

function getDistance(a, b) {
  if (!a || !b || !a.lat || !b.lat) return Infinity;

  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ---------- MAIN GENERATOR ---------- */

async function generateItinerary({ city, interests, days, startTime }) {
  const itinerary = [];
  const used = new Set();

  const startHour = parseStartHour(startTime);

  for (let d = 1; d <= days; d++) {
    let currentHour = startHour;
    let currentLocation = null;

    for (let slot = 0; slot < interests.length; slot++) {
      const category = getCategoryByTime(currentHour, interests);

      const query = CATEGORIES[category] || category;

      let places = await searchPlaces({ city, query });

      // remove duplicates
      places = places.filter(p => p?.name && !used.has(p.name));

      if (!places.length) {
        currentHour += 2;
        continue;
      }

      // 🔥 sort by distance (NEARBY optimization)
      if (currentLocation) {
        places.sort(
          (a, b) =>
            getDistance(currentLocation, a) -
            getDistance(currentLocation, b)
        );
      }

      const selected = places[0];
      used.add(selected.name);

      let travel = null;

      if (currentLocation && selected.lat) {
        travel = await getTravelTime(
          { lat: currentLocation.lat, lng: currentLocation.lng },
          { lat: selected.lat, lng: selected.lng }
        );
      }

      itinerary.push({
        ...selected,
        day: d,
        category,
        photoUrl: selected.photoUrl || null,
        time: `${String(currentHour).padStart(2, "0")}:00`,
        walkTime: travel?.walking || null,
        driveTime: travel?.driving || null,
        travelDistance: travel?.distance || null,
      });

      currentLocation = selected;
      currentHour += 2;
    }
  }

  return itinerary;
}

module.exports = { generateItinerary };