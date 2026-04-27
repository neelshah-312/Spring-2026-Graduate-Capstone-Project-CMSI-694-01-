const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function buildPhotoUrl(photoRef) {
  if (!photoRef) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${API_KEY}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const cache = new Map();

async function fetchJsonWithRetry(url, tries = 4) {
  let lastErr;

  for (let i = 0; i < tries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      const raw = await res.text();
      clearTimeout(timeoutId);

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Google returned non-JSON: ${raw.slice(0, 200)}`);
      }

      if (data.status === "INTERNAL") {
        console.warn(`Google Places INTERNAL (try ${i + 1}/${tries})`);
        await sleep(350 * (i + 1));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Google Places HTTP ${res.status}: ${raw.slice(0, 300)}`);
      }

      return { res, data, raw };
    } catch (e) {
      clearTimeout(timeoutId);
      lastErr = e;
      await sleep(350 * (i + 1));
    }
  }

  throw lastErr || new Error("Google Places failed after retries");
}

async function searchPlaces({ city, query }) {
  if (!API_KEY) throw new Error("Missing GOOGLE_MAPS_API_KEY in backend .env");
  if (!city?.trim() || !query?.trim()) return [];

  const cityClean = city.trim();
  const queryClean = query.trim();

  const cacheKey = `${cityClean.toLowerCase()}|${queryClean.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
    encodeURIComponent(`${queryClean} in ${cityClean}`) +
    "&region=us&language=en" +
    `&key=${API_KEY}`;

  console.log("PLACES URL:", url);

  const { data } = await fetchJsonWithRetry(url);

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.error("Google Places API Error:", data.status, data.error_message);
    throw new Error(
      `Google Places error: ${data.status} ${data.error_message || ""}`.trim()
    );
  }

  const mapped = (data.results || []).map((p) => ({
    place_id: p.place_id,
    name: p.name,
    address: p.formatted_address,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    rating: p.rating ?? null,
    userRatingsTotal: p.user_ratings_total ?? null,
    priceLevel: p.price_level ?? null, // 0=free, 1=$, 2=$$, 3=$$$, 4=$$$$
    photoUrl: buildPhotoUrl(p.photos?.[0]?.photo_reference),
  }));

  cache.set(cacheKey, { expires: Date.now() + 10 * 60 * 1000, value: mapped });
  await sleep(200);

  return mapped;
}

module.exports = { searchPlaces };