import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import GlassPage from "../components/GlassPage";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

/* ---------- helpers ---------- */

function googleMapsUrl(p) {
    if (p?.lat != null && p?.lng != null) {
        return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    }

    const q = encodeURIComponent(
        [p?.name, p?.address].filter(Boolean).join(" ")
    );

    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

const DEFAULT_TIMES = [
    "09:00 AM",
    "11:00 AM",
    "01:00 PM",
    "03:00 PM",
    "06:00 PM",
    "08:00 PM",
];

/* ---------- components ---------- */

function Badge({ children }) {
    return (
        <span className="px-2 py-1 text-xs rounded-full border border-[rgb(var(--border))] text-[rgb(var(--muted))]">
            {children}
        </span>
    );
}

function TimelineItem({
    place,
    index,
    onSwapUp,
    onSwapDown,
    onRunningLate,
}) {
    const time = DEFAULT_TIMES[index] || "";

    return (
        <div className="flex gap-4 items-start">
            {/* time */}
            <div className="text-sm w-20 text-[rgb(var(--muted))] pt-2">{time}</div>

            {/* timeline dot */}
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[rgb(var(--primary))]" />
                <div className="flex-1 w-px bg-[rgb(var(--border))]" />
            </div>

            {/* card */}
            <div className="flex-1">
                <a
                    href={googleMapsUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="rounded-xl border border-[rgb(var(--border))] bg-white/80 dark:bg-[rgb(var(--card))]/80 backdrop-blur overflow-hidden hover:shadow-lg transition">

                        {/* image */}
                        <div className="h-40 bg-black/5 dark:bg-white/5">
                            {place.photoUrl && (
                                <img
                                    src={place.photoUrl}
                                    alt={place.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) =>
                                        (e.currentTarget.style.display = "none")
                                    }
                                />
                            )}
                        </div>

                        <div className="p-4">
                            <div className="font-semibold text-[rgb(var(--text))]">
                                {place.name}
                            </div>

                            {place.address && (
                                <div className="text-sm text-[rgb(var(--muted))] mt-1">
                                    {place.address}
                                </div>
                            )}

                            {place.walkTime && (
                                <div className="text-xs text-gray-500 mt-2">
                                    🚶 Walk: {place.walkTime}
                                </div>
                            )}

                            {place.driveTime && (
                                <div className="text-xs text-gray-500">
                                    🚗 Drive: {place.driveTime}
                                </div>
                            )}

                            <div className="flex gap-2 mt-2">
                                {place.category && <Badge>{place.category}</Badge>}
                            </div>

                            <div className="text-xs underline mt-2 text-[rgb(var(--muted))]">
                                Open in Google Maps
                            </div>

                            {/* controls */}
                            <div className="flex gap-2 mt-3">


                                <button
                                    onClick={onRunningLate}
                                    className="text-xs px-2 py-1 border rounded bg-orange-200 hover:bg-orange-300"
                                >
                                    ⏰ Running Late
                                </button>
                                <a href={`https://www.google.com/search?q=hotels+near+${place.name}`}>
                                    🏨 Hotels
                                </a>

                                <a href={`https://www.skyscanner.com/`}>
                                    ✈ Flights
                                </a>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}

/* ---------- main page ---------- */

export default function TripResults() {
    const location = useLocation();
    const state = location.state || {};
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [itinerary, setItinerary] = useState([]);
    const [error, setError] = useState("");
    const [summary, setSummary] = useState("");

    const [tripMeta] = useState({
        city: state?.destination || state?.city || null,
        startDate: state?.startDate || null,
        endDate: state?.endDate || null,
    });

    /* load itinerary */

    useEffect(() => {
        const city = tripMeta.city;

        if (!city) return;

        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/weather?city=${city}`
                );

                const data = await res.json();

                console.log("Weather:", data);

                if (data.error) {
                    console.error("Weather error:", data.error);
                    return;
                }

                setWeather(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchWeather();

        async function load() {
            try {
                setLoading(true);

                const res = await fetch(
                    `${BACKEND_URL}/api/itinerary/${tripId}`
                );

                const data = await res.json();

                if (!res.ok) throw new Error(data?.error);

                setItinerary(data);
            } catch (e) {
                setError(e.message || "Failed to load itinerary");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tripId, state, tripMeta.city]);
    /* group by day */

    const byDay = useMemo(() => {
        const map = new Map();

        for (const item of itinerary) {
            const d = item.day ?? 1;

            if (!map.has(d)) map.set(d, []);

            map.get(d).push(item);
        }

        return map;
    }, [itinerary]);

    const dayKeys = useMemo(
        () => [...byDay.keys()].sort((a, b) => a - b),
        [byDay]
    );
    useEffect(() => {
        async function loadSummary() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/trips/summary`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        city: tripMeta.city,
                        days: dayKeys.length,
                        interests: state?.interests || [],
                    }),
                });

                const data = await res.json();
                setSummary(data.summary);

            } catch (e) {
                console.log("Summary error", e);
            }
        }

        if (tripMeta.city) {
            loadSummary();
        }

    }, [tripMeta, dayKeys]);


    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        if (dayKeys.length) setActiveDay(dayKeys[0]);
    }, [dayKeys]);

    const activePlaces = byDay.get(activeDay) || [];

    // ✅ ADD THIS HERE
    // ✅ get selected day date
    const selectedDate = new Date(tripMeta.startDate);
    selectedDate.setDate(selectedDate.getDate() + (activeDay - 1));

    // ✅ FIX: use LOCAL date (not ISO)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    // ✅ filter
    // ✅ filter weather by selected day
    let filteredWeather = [];

    if (weather?.list) {
        filteredWeather = weather.list.filter(item => {
            const itemDate = item.dt_txt.split(" ")[0];
            return itemDate === formattedDate;
        });

        // ✅ fallback if no data
        if (filteredWeather.length === 0) {
            filteredWeather = weather.list.slice(0, 4);
        }

        // ✅ daytime only (9AM–6PM)
        filteredWeather = filteredWeather.filter(item => {
            const hour = new Date(item.dt_txt).getHours();
            return hour >= 9 && hour <= 18;
        });
    }
    /* ---------- actions ---------- */

    // function swapActivity(i, j) {
    //     if (j < 0 || j >= activePlaces.length) return;

    //     const updated = [...itinerary];

    //     const a = updated.findIndex((x) => x === activePlaces[i]);
    //     const b = updated.findIndex((x) => x === activePlaces[j]);

    //     [updated[a], updated[b]] = [updated[b], updated[a]];

    //     setItinerary(updated);
    // }

    function delayActivity(i) {
        const updated = [...itinerary];

        const item = updated.find((x) => x === activePlaces[i]);

        if (!item) return;

        const hour = parseInt((item.time || "09:00").split(":")[0]);

        const newHour = Math.min(hour + 1, 23);

        item.time = `${String(newHour).padStart(2, "0")}:00`;

        setItinerary(updated);
    }

    return (
        <GlassPage>
            <div className="mx-auto max-w-5xl px-4 py-10">

                {/* header */}

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-[rgb(var(--text))]">
                            Your Trip
                        </h1>

                        <p className="text-[rgb(var(--muted))] mt-1">
                            {tripMeta.city}
                            {tripMeta.startDate && tripMeta.endDate && (
                                <> • {tripMeta.startDate} → {tripMeta.endDate}</>
                            )}
                        </p>
                        {weather?.weather && (
                            <div className="bg-white/10 p-4 rounded-xl mb-6">
                                <h2 className="text-xl font-bold mb-2">
                                    🌤 Weather for Day {activeDay}
                                </h2>

                                <div className="flex gap-4 overflow-x-auto">

                                    {weather.weather[activeDay - 1]?.hourly
                                        ?.filter((item) => {
                                            const hour = parseInt(item.time) / 100;
                                            return hour >= 9 && hour <= 18;
                                        })
                                        .slice(0, 4)
                                        .map((item, i) => (
                                            <div key={i} className="p-3 bg-white/10 rounded-lg text-center">

                                                {/* TIME */}
                                                <p className="text-sm">
                                                    {parseInt(item.time) / 100}:00
                                                </p>

                                                {/* TEMP */}
                                                <p className="font-bold text-lg">
                                                    {item.tempC}°C
                                                </p>

                                                {/* ICON */}
                                                <img
                                                    src={item.weatherIconUrl[0].value}
                                                    alt="weather"
                                                    className="w-8 h-8 mx-auto"
                                                />

                                                {/* DESCRIPTION */}
                                                <p className="text-xs capitalize">
                                                    {item.weatherDesc[0].value}
                                                </p>

                                            </div>
                                        ))}

                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate("/plan")}
                        className="px-4 py-2 rounded-xl border border-[rgb(var(--border))]"
                    >
                        Plan New Trip
                    </button>
                </div>

                {/* day selector */}

                <div className="flex gap-2 mt-6">
                    {dayKeys.map((d) => (
                        <button
                            key={d}
                            onClick={() => setActiveDay(d)}
                            className={`px-4 py-2 rounded-xl border text-sm
              ${activeDay === d
                                    ? "bg-[rgb(var(--primary))] text-white border-transparent"
                                    : "border-[rgb(var(--border))]"
                                }`}
                        >
                            Day {d}
                        </button>
                    ))}
                </div>

                {/* timeline */}
                <div className="mt-10 space-y-8">

                    {loading && <div>Loading itinerary...</div>}

                    {error && <div className="text-red-500">{error}</div>}

                    {!loading &&
                        activePlaces.map((place, i) => (
                            <TimelineItem
                                key={place.id || i}
                                place={place}
                                index={i}
                                // onSwapUp={() => swapActivity(i, i - 1)}
                                // onSwapDown={() => swapActivity(i, i + 1)}
                                onRunningLate={() => delayActivity(i)}
                            />
                        ))}
                </div>
            </div>
        </GlassPage>
    );
}