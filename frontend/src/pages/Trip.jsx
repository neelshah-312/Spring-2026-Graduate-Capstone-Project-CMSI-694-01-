import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import GlassCard from "../components/GlassCard.jsx";
import { getTrip, getItinerary } from "../lib/api";

function Background() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-pink-400/35 to-orange-300/25 blur-2xl" />
      <div className="absolute top-24 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-400/25 to-cyan-300/25 blur-2xl" />
      <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-400/20 to-lime-300/15 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
    </div>
  );
}

export default function Trip() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [day, setDay] = useState(1);
  const [err, setErr] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    (async () => {
      try {
        const t = await getTrip(id);
        const it = await getItinerary(id);
        setTrip(t);
        setItems(it);
        setDay(1);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  const days = useMemo(() => {
    const maxDay = items.reduce((m, x) => Math.max(m, x.dayNumber), 1);
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [items]);

  const dayItems = items.filter((x) => x.dayNumber === day);

  const center = useMemo(() => {
    const first = dayItems.find((x) => x.lat && x.lng) || items.find((x) => x.lat && x.lng);
    return first
      ? { lat: Number(first.lat), lng: Number(first.lng) }
      : { lat: 48.8566, lng: 2.3522 };
  }, [dayItems, items]);

  if (err) return <div className="p-6">{err}</div>;
  if (!trip) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{trip.city}</h1>
            <div className="text-black/60 mt-1">
              {trip.startDate} → {trip.endDate} • {trip.travelers} traveler(s)
            </div>
          </div>

          <Link
            to="/"
            className="px-4 py-3 rounded-2xl border border-black/10 bg-white hover:bg-black/5 transition font-medium"
          >
            + New Trip
          </Link>
        </div>

        {/* day pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                d === day
                  ? "bg-black text-white border-black"
                  : "bg-white border-black/10 hover:bg-black/5"
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          {/* itinerary list */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Itinerary</h2>
              <div className="text-sm text-black/50">Day {day}</div>
            </div>

            <div className="mt-4 space-y-3">
              {dayItems.length === 0 ? (
                <div className="text-black/60">No items for this day.</div>
              ) : (
                dayItems.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-4 p-3 rounded-2xl border border-black/5 hover:bg-black/5 transition"
                  >
                    <div className="w-28 h-20 rounded-2xl bg-black/5 overflow-hidden shrink-0">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-sm text-black/60 truncate">{p.address}</div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-black/5">
                          {p.category}
                        </span>
                        {p.rating ? (
                          <span className="px-2 py-1 rounded-full bg-black/5">
                            ⭐ {p.rating}
                          </span>
                        ) : null}
                        {p.userRatingsTotal ? (
                          <span className="px-2 py-1 rounded-full bg-black/5">
                            {p.userRatingsTotal} reviews
                          </span>
                        ) : null}
                        {p.lat && p.lng ? (
                          <a
                            className="px-2 py-1 rounded-full bg-black text-white"
                            href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Maps
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* map */}
          <GlassCard className="p-0 overflow-hidden min-h-[480px]">
            {!isLoaded ? (
              <div className="p-5">Loading map...</div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={12}
              >
                {dayItems
                  .filter((x) => x.lat && x.lng)
                  .map((x) => (
                    <Marker
                      key={x.id}
                      position={{ lat: Number(x.lat), lng: Number(x.lng) }}
                    />
                  ))}
              </GoogleMap>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
