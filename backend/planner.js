const { searchPlaces } = require("./googlePlaces");
const { getTravelTime } = require("./distance");

/* ---------- BUDGET CONFIG ---------- */

// Maps budget tier → search query prefixes per category
const BUDGET_QUERIES = {
  budget: {
    food: "cheap eats street food",
    landmarks: "free landmarks",
    museums: "free museums",
    nature: "free parks",
    shopping: "markets flea markets",
    nightlife: "cheap bars pubs",
    adventure: "free hiking trails",
  },
  midrange: {
    food: "best restaurants",
    landmarks: "top landmarks",
    museums: "best museums",
    nature: "parks gardens",
    shopping: "shopping areas",
    nightlife: "bars nightlife",
    adventure: "adventure activities",
  },
  luxury: {
    food: "fine dining michelin restaurants",
    landmarks: "exclusive landmarks tours",
    museums: "top museums",
    nature: "luxury resorts nature",
    shopping: "luxury shopping boutiques",
    nightlife: "rooftop bars luxury clubs",
    adventure: "premium adventure experiences",
  },
};

// Maps budget tier → acceptable Google price_level values
// price_level: 0=free, 1=$, 2=$$, 3=$$$, 4=$$$$
// null means no price data — always allow
const BUDGET_PRICE_LEVELS = {
  budget: new Set([0, 1, null]),
  midrange: new Set([1, 2, 3, null]),
  luxury: new Set([3, 4, null]),
};

// Budget tier → label shown on itinerary cards
const BUDGET_LABELS = {
  budget: { label: "Budget Friendly", icon: "💰", color: "#22c55e" },
  midrange: { label: "Mid-Range", icon: "💰💰", color: "#f59e0b" },
  luxury: { label: "Luxury", icon: "💰💰💰", color: "#a855f7" },
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
    { start: 6, end: 10, type: "food" },
    { start: 10, end: 14, type: "landmarks" },
    { start: 14, end: 17, type: "museums" },
    { start: 17, end: 20, type: "shopping" },
    { start: 20, end: 23, type: "nightlife" },
  ];

  const rule = rules.find(r => hour >= r.start && hour < r.end);
  if (!rule) return interests[0];
  return interests.includes(rule.type) ? rule.type : interests[0];
}

/* ---------- DISTANCE LOGIC ---------- */

function getDistance(a, b) {
  if (!a || !b || !a.lat || !b.lat) return Infinity;
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ---------- BUDGET FILTERING ---------- */

function filterByBudget(places, budget) {
  const allowed = BUDGET_PRICE_LEVELS[budget] || BUDGET_PRICE_LEVELS.midrange;
  return places.filter(p => allowed.has(p.priceLevel ?? null));
}

/* ---------- MAIN GENERATOR ---------- */

async function generateItinerary({ city, interests, days, startTime, budget = "midrange" }) {
  const itinerary = [];
  const used = new Set();
  const startHour = parseStartHour(startTime);
  const queries = BUDGET_QUERIES[budget] || BUDGET_QUERIES.midrange;
  const budgetMeta = BUDGET_LABELS[budget] || BUDGET_LABELS.midrange;

  for (let d = 1; d <= days; d++) {
    let currentHour = startHour;
    let currentLocation = null;

    for (let slot = 0; slot < interests.length; slot++) {
      const category = getCategoryByTime(currentHour, interests);
      const query = queries[category] || category;

      let places = await searchPlaces({ city, query });

      // Remove already used places
      places = places.filter(p => p?.name && !used.has(p.name));

      // Filter by budget price level
      let budgetFiltered = filterByBudget(places, budget);

      // If budget filtering leaves nothing, fall back to all places
      // (better to show something than nothing)
      if (budgetFiltered.length === 0) budgetFiltered = places;

      if (!budgetFiltered.length) {
        currentHour += 2;
        continue;
      }

      // Sort by proximity to current location
      if (currentLocation) {
        budgetFiltered.sort(
          (a, b) => getDistance(currentLocation, a) - getDistance(currentLocation, b)
        );
      }

      const selected = budgetFiltered[0];
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
        // Budget metadata shown on the card
        budgetTier: budget,
        budgetLabel: budgetMeta.label,
        budgetIcon: budgetMeta.icon,
        budgetColor: budgetMeta.color,
        priceLevel: selected.priceLevel ?? null,
      });

      currentLocation = selected;
      currentHour += 2;
    }
  }

  return itinerary;
}

module.exports = { generateItinerary };