const { searchPlaces } = require("./googlePlaces");
const { getTravelTime } = require("./distance");

/* ─────────────────────────────────────────
   CATEGORY CONFIG
   duration  = realistic visit time in hours
   mealSlot  = which meal window this covers
   queries   = varied search queries so Day 2
               doesn't repeat Day 1 exactly
───────────────────────────────────────── */
const CATEGORY_CONFIG = {
  food: {
    duration: 1,
    queries: [
      "best restaurants",
      "top rated cafes",
      "popular local eateries",
      "highly rated bistros",
      "famous street food",
    ],
  },
  landmarks: {
    duration: 1.5,
    queries: [
      "top landmarks",
      "famous attractions",
      "must see sights",
      "iconic tourist spots",
      "historic monuments",
    ],
  },
  museums: {
    duration: 2,
    queries: [
      "best museums",
      "top art galleries",
      "history museums",
      "science museums",
      "cultural centers",
    ],
  },
  nature: {
    duration: 1.5,
    queries: [
      "scenic parks",
      "nature reserves",
      "botanical gardens",
      "waterfront parks",
      "hiking trails",
    ],
  },
  shopping: {
    duration: 1.5,
    queries: [
      "popular shopping areas",
      "best markets",
      "local bazaars",
      "shopping districts",
      "artisan shops",
    ],
  },
  nightlife: {
    duration: 2,
    queries: [
      "best bars",
      "popular nightlife",
      "rooftop bars",
      "live music venues",
      "cocktail lounges",
    ],
  },
  adventure: {
    duration: 2,
    queries: [
      "adventure activities",
      "outdoor experiences",
      "water sports",
      "zip line tours",
      "extreme sports",
    ],
  },
};

/* ─────────────────────────────────────────
   MEAL SLOTS — structured breakfast / lunch
   / dinner windows mapped to food category
───────────────────────────────────────── */
const MEAL_SLOTS = [
  { start: 7, end: 9, label: "breakfast", query: "best breakfast cafes" },
  { start: 12, end: 14, label: "lunch", query: "best lunch restaurants" },
  { start: 19, end: 21, label: "dinner", query: "best dinner restaurants" },
];

/* ─────────────────────────────────────────
   TIME-OF-DAY → CATEGORY RULES
   Returns best category for a given hour,
   respecting user's selected interests only
───────────────────────────────────────── */
const TIME_RULES = [
  { start: 9, end: 12, preferred: ["landmarks", "nature", "adventure"] },
  { start: 12, end: 14, preferred: ["food"] },
  { start: 14, end: 17, preferred: ["museums", "shopping", "landmarks"] },
  { start: 17, end: 19, preferred: ["nature", "shopping", "landmarks"] },
  { start: 19, end: 23, preferred: ["food", "nightlife"] },
];

function getCategoryForHour(hour, interests) {
  const rule = TIME_RULES.find(r => hour >= r.start && hour < r.end);
  if (!rule) return interests[0];

  // pick first preferred category that the user actually selected
  const match = rule.preferred.find(cat => interests.includes(cat));
  return match || interests[0];
}

/* ─────────────────────────────────────────
   HAVERSINE DISTANCE  (accurate km)
───────────────────────────────────────── */
function haversineKm(a, b) {
  if (!a?.lat || !b?.lat) return Infinity;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2 = (x) => Math.sin(x / 2) ** 2;
  const h =
    sin2(dLat) +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    sin2(dLng);
  return R * 2 * Math.asin(Math.sqrt(h));
}

/* ─────────────────────────────────────────
   SCORE PLACES
   Blends rating quality with proximity.
   Formula: ratingScore - proximityPenalty
   Higher = better.
───────────────────────────────────────── */
function scorePlaces(places, currentLocation) {
  return places.map((p) => {
    // rating score: bayesian-style (rating × log(reviews+1))
    const ratingScore =
      p.rating && p.userRatingsTotal
        ? p.rating * Math.log10(p.userRatingsTotal + 1)
        : p.rating
          ? p.rating * 0.5
          : 0;

    // proximity penalty: 0 if no prior location, else km / 2
    const distKm = currentLocation
      ? haversineKm(currentLocation, p)
      : 0;
    const proximityPenalty = distKm / 2;

    return { ...p, _score: ratingScore - proximityPenalty };
  });
}

/* ─────────────────────────────────────────
   PARSE START HOUR
───────────────────────────────────────── */
function parseStartHour(startTime) {
  if (!startTime) return 9;
  const [h, m] = startTime.split(":").map(Number);
  if (isNaN(h)) return 9;
  return m > 0 ? Math.min(h + 1, 23) : h;
}

/* ─────────────────────────────────────────
   BUILD DAILY SCHEDULE
   Figures out how many stops fit in a day
   given realistic durations + start hour.
   Returns array of { hour, category, isMeal }
───────────────────────────────────────── */
function buildDaySchedule(startHour, interests, dayIndex) {
  const END_HOUR = 22;
  const slots = [];
  let hour = startHour;

  while (hour < END_HOUR) {
    // check if this hour falls in a meal window
    const mealSlot = MEAL_SLOTS.find(
      m => hour >= m.start && hour < m.end && interests.includes("food")
    );

    if (mealSlot) {
      slots.push({ hour, category: "food", isMeal: true, mealLabel: mealSlot.label, mealQuery: mealSlot.query });
      hour += CATEGORY_CONFIG.food.duration;
      continue;
    }

    // skip meal windows even if user didn't pick food
    const inMealWindow = MEAL_SLOTS.some(m => hour >= m.start && hour < m.end);
    if (inMealWindow) {
      hour += 1;
      continue;
    }

    const category = getCategoryForHour(hour, interests);
    const duration = CATEGORY_CONFIG[category]?.duration || 2;

    slots.push({ hour, category, isMeal: false });
    hour += duration;
  }

  return slots;
}

/* ─────────────────────────────────────────
   MAIN GENERATOR
───────────────────────────────────────── */
async function generateItinerary({ city, interests, days, startTime }) {
  const itinerary = [];
  const used = new Set();
  const startHour = parseStartHour(startTime);

  // Validate interests — default if empty
  const safeInterests =
    Array.isArray(interests) && interests.length
      ? interests
      : ["landmarks", "food", "museums"];

  for (let d = 1; d <= days; d++) {
    const daySchedule = buildDaySchedule(startHour, safeInterests, d - 1);
    let currentLocation = null;

    // track per-category query rotation per day
    // e.g. Day 1 uses query index 0, Day 2 uses index 1, etc.
    const queryIndexForDay = (d - 1) % 5;

    for (const slot of daySchedule) {
      const { hour, category, isMeal, mealQuery } = slot;

      // pick query — meal slots use specific meal queries,
      // others rotate across days for variety
      const config = CATEGORY_CONFIG[category];
      const queryList = config?.queries || ["top places"];
      const query = isMeal
        ? mealQuery
        : queryList[queryIndexForDay % queryList.length];

      let places = await searchPlaces({ city, query });

      // remove already-used places
      places = places.filter(p => p?.name && !used.has(p.name));

      if (!places.length) continue;

      // score by rating + proximity (fixes raw lat/lng sort)
      const scored = scorePlaces(places, currentLocation);
      scored.sort((a, b) => b._score - a._score);

      const selected = scored[0];
      used.add(selected.name);

      // get travel times from previous stop
      let travel = null;
      if (currentLocation && selected.lat) {
        travel = await getTravelTime(
          { lat: currentLocation.lat, lng: currentLocation.lng },
          { lat: selected.lat, lng: selected.lng }
        );
      }

      const hourStr = String(Math.floor(hour)).padStart(2, "0");
      const minStr = hour % 1 === 0.5 ? "30" : "00";

      itinerary.push({
        ...selected,
        day: d,
        category,
        photoUrl: selected.photoUrl || null,
        time: `${hourStr}:${minStr}`,
        walkTime: travel?.walking || null,
        driveTime: travel?.driving || null,
        travelDistance: travel?.distance || null,
        rating: selected.rating || null,
        userRatingsTotal: selected.userRatingsTotal || null,
      });

      currentLocation = selected;
    }
  }

  return itinerary;
}

module.exports = { generateItinerary };