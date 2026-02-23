const { searchPlaces } = require("./googlePlaces");

const CATEGORIES = {
  food: "best restaurants",
  landmarks: "top landmarks",
  museums: "best museums",
  nature: "parks",
  shopping: "shopping areas",
  nightlife: "nightlife",
};

// ✅ Helpers
function parseStartHour(startTime) {
  if (!startTime) return 9;
  <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)} // gives "09:00"
    className="..."
  />
  //  return Number.isFinite(h) ? h : 9;
}

function preferredInterestsForHour(hour, interests) {
  // Time-based preference order (only uses interests the user actually picked)
  const ranges = [
    { start: 6, end: 10, prefs: ["nature", "landmarks"] },
    { start: 10, end: 14, prefs: ["food"] },
    { start: 14, end: 18, prefs: ["museums", "shopping"] },
    { start: 18, end: 23, prefs: ["nightlife", "food"] },
  ];

  const rule = ranges.find((r) => hour >= r.start && hour < r.end);
  const preferred = rule ? rule.prefs.filter((i) => interests.includes(i)) : [];

  // fallback: keep user's interests after preferred ones
  const rest = interests.filter((i) => !preferred.includes(i));

  return [...preferred, ...rest];
}

async function generateItinerary({ city, interests, days, startTime }) {
  const items = [];
  const used = new Set();

  const startHour = parseStartHour(startTime);

  for (let d = 1; d <= days; d++) {
    let currentHour = startHour;

    // Same behavior as before: number of activities/day = number of selected interests
    for (let slot = 0; slot < interests.length; slot++) {
      const orderedInterests = preferredInterestsForHour(currentHour, interests);

      let pickedPlace = null;
      let pickedCategory = null;

      // Try preferred categories first, then fallback to remaining interests
      for (const interest of orderedInterests) {
        const query = CATEGORIES[interest] || interest;

        const results = await searchPlaces({ city, query });
        await new Promise((r) => setTimeout(r, 250)); // ✅ small throttle

        const place = results.find((p) => p?.name && !used.has(p.name));
        if (!place) continue;

        pickedPlace = place;
        pickedCategory = interest;
        used.add(place.name);
        break;
      }

      if (!pickedPlace) {
        // Couldn't find any unused place for this slot — just skip the slot
        currentHour += 2;
        continue;
      }

      items.push({
        ...pickedPlace,
        day: d,
        category: pickedCategory,
        photoUrl: pickedPlace.photoUrl || null,
        time: `${String(currentHour).padStart(2, "0")}:00`,
      });

      currentHour += 2; // next activity starts 2 hours later
    }
  }

  return items;
}

module.exports = { generateItinerary };