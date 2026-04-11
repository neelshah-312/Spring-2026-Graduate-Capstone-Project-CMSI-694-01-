import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import GlassPage from "../components/GlassPage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY;

/* ─── helpers ─────────────────────────────────────────────── */

function googleMapsUrl(p) {
    if (p?.lat != null && p?.lng != null)
        return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    const q = encodeURIComponent([p?.name, p?.address].filter(Boolean).join(" "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function weatherIcon(code) {
    const c = Number(code);
    if (c <= 113) return "☀️";
    if (c <= 119) return "⛅";
    if (c <= 122) return "☁️";
    if (c <= 143) return "🌫️";
    if (c <= 176) return "🌦️";
    if (c <= 263) return "🌧️";
    if (c <= 296) return "🌧️";
    if (c <= 320) return "🌨️";
    if (c <= 377) return "❄️";
    if (c <= 389) return "⛈️";
    return "🌤️";
}

function weatherDesc(code) {
    const c = Number(code);
    if (c <= 113) return "Sunny";
    if (c <= 116) return "Partly Cloudy";
    if (c <= 119) return "Cloudy";
    if (c <= 122) return "Overcast";
    if (c <= 143) return "Foggy";
    if (c <= 176) return "Patchy Rain";
    if (c <= 200) return "Thundery";
    if (c <= 263) return "Drizzle";
    if (c <= 296) return "Rain";
    if (c <= 320) return "Sleet";
    if (c <= 377) return "Snow";
    if (c <= 389) return "Thunderstorm";
    return "Mixed";
}

/* ─── Weather Widget ──────────────────────────────────────── */

function WeatherWidget({ city }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!city) return;
        setLoading(true);
        fetch(`${BACKEND_URL}/api/weather?city=${encodeURIComponent(city)}`)
            .then((r) => r.json())
            .then((data) => {
                if (data?.current_condition?.[0]) setWeather(data);
                else setError("No weather data");
            })
            .catch(() => setError("Weather unavailable"))
            .finally(() => setLoading(false));
    }, [city]);

    if (!city) return null;

    const cur = weather?.current_condition?.[0];
    const today = weather?.weather?.[0];
    const forecast = weather?.weather?.slice(0, 3) || [];

    return (
        <div style={{
            background: "linear-gradient(135deg, rgba(99,179,237,0.18) 0%, rgba(56,178,172,0.14) 100%)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 24,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "20px 24px",
            marginBottom: 24,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* background shimmer blob */}
            <div style={{
                position: "absolute", top: -40, right: -40,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(147,210,255,0.25) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, color: "white" }}>
                    🌍 Live Weather · {city}
                </span>
            </div>

            {loading && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {[80, 120, 60, 90].map((w, i) => (
                        <div key={i} style={{ height: 18, width: w, borderRadius: 8, background: "rgba(255,255,255,0.15)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            )}

            {error && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{error}</div>}

            {cur && !loading && (
                <>
                    {/* Current conditions */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 56, lineHeight: 1 }}>{weatherIcon(cur.weatherCode)}</span>
                            <div>
                                <div style={{ fontSize: 42, fontWeight: 800, color: "white", lineHeight: 1 }}>
                                    {cur.temp_C}°<span style={{ fontSize: 22, opacity: 0.7 }}>C</span>
                                    <span style={{ fontSize: 20, marginLeft: 8, opacity: 0.5 }}>/ {cur.temp_F}°F</span>
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                                    {weatherDesc(cur.weatherCode)}
                                </div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginLeft: "auto" }}>
                            {[
                                { label: "Feels like", val: `${cur.FeelsLikeC}°C` },
                                { label: "Humidity", val: `${cur.humidity}%` },
                                { label: "Wind", val: `${cur.windspeedKmph} km/h` },
                                { label: "Visibility", val: `${cur.visibility} km` },
                            ].map((s) => (
                                <div key={s.label} style={{
                                    background: "rgba(255,255,255,0.12)",
                                    borderRadius: 14,
                                    padding: "8px 14px",
                                    textAlign: "center",
                                    minWidth: 70,
                                }}>
                                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                                    <div style={{ color: "white", fontSize: 16, fontWeight: 700, marginTop: 2 }}>{s.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3-day forecast */}
                    {forecast.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                            {forecast.map((day, i) => {
                                const avgCode = day.hourly?.[4]?.weatherCode || "113";
                                const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                                return (
                                    <div key={i} style={{
                                        flex: 1, minWidth: 90,
                                        background: "rgba(255,255,255,0.10)",
                                        borderRadius: 16,
                                        padding: "10px 12px",
                                        textAlign: "center",
                                        border: i === 0 ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                                    }}>
                                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{dayLabel}</div>
                                        <div style={{ fontSize: 24, margin: "6px 0" }}>{weatherIcon(avgCode)}</div>
                                        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                                            {day.maxtempC}° <span style={{ opacity: 0.5, fontWeight: 400 }}>{day.mintempC}°</span>
                                        </div>
                                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>
                                            💧 {day.hourly?.[4]?.chanceofrain || 0}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}

/* ─── Map Section ─────────────────────────────────────────── */

const MAP_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#16213e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f3460" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function TripMap({ places }) {
    const [selected, setSelected] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GMAPS_KEY || "",
        id: "google-map-script",
    });

    const validPlaces = places.filter((p) => p.lat && p.lng);

    const center = useMemo(() => {
        if (!validPlaces.length) return { lat: 41.3851, lng: 2.1734 }; // Barcelona default
        const avgLat = validPlaces.reduce((s, p) => s + Number(p.lat), 0) / validPlaces.length;
        const avgLng = validPlaces.reduce((s, p) => s + Number(p.lng), 0) / validPlaces.length;
        return { lat: avgLat, lng: avgLng };
    }, [validPlaces]);

    const pathCoords = validPlaces.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));

    const categoryColors = {
        food: "#f97316",
        museums: "#8b5cf6",
        nature: "#22c55e",
        shopping: "#ec4899",
        nightlife: "#06b6d4",
        landmarks: "#f59e0b",
        adventure: "#ef4444",
    };

    function markerColor(cat) {
        return categoryColors[cat] || "#6366f1";
    }

    if (!isLoaded) return (
        <div style={{ height: 420, borderRadius: 24, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", opacity: 0.5 }}>Loading map…</span>
        </div>
    );

    return (
        <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Legend */}
            <div style={{
                position: "absolute", top: 16, left: 16, zIndex: 10,
                background: "rgba(10,10,30,0.82)",
                backdropFilter: "blur(12px)",
                borderRadius: 16,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxWidth: 160,
            }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    📍 {validPlaces.length} stops
                </div>
                {Object.entries(categoryColors).filter(([cat]) => validPlaces.some(p => p.category === cat)).map(([cat, col]) => (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />
                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textTransform: "capitalize" }}>{cat}</span>
                    </div>
                ))}
            </div>

            <GoogleMap
                mapContainerStyle={{ width: "100%", height: 460 }}
                center={center}
                zoom={13}
                options={{
                    styles: MAP_STYLES,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                }}
                onLoad={() => setMapLoaded(true)}
            >
                {/* Route polyline */}
                {mapLoaded && pathCoords.length > 1 && (
                    <Polyline
                        path={pathCoords}
                        options={{
                            strokeColor: "#6366f1",
                            strokeOpacity: 0.6,
                            strokeWeight: 2,
                            geodesic: true,
                            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "20px" }],
                        }}
                    />
                )}

                {/* Markers */}
                {validPlaces.map((place, i) => (
                    <Marker
                        key={place.id || i}
                        position={{ lat: Number(place.lat), lng: Number(place.lng) }}
                        onClick={() => setSelected(place)}
                        label={{
                            text: String(i + 1),
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "12px",
                        }}
                        icon={{
                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                            fillColor: markerColor(place.category),
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                            scale: 1.8,
                            anchor: { x: 12, y: 22 },
                            labelOrigin: { x: 12, y: 9 },
                        }}
                    />
                ))}

                {/* Info window */}
                {selected && (
                    <InfoWindow
                        position={{ lat: Number(selected.lat), lng: Number(selected.lng) }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div style={{ maxWidth: 220, fontFamily: "system-ui, sans-serif" }}>
                            {selected.photoUrl && (
                                <img src={selected.photoUrl} alt={selected.name}
                                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                            )}
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selected.name}</div>
                            {selected.address && <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{selected.address}</div>}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {selected.category && (
                                    <span style={{ fontSize: 11, background: "#f3f4f6", padding: "2px 8px", borderRadius: 99, textTransform: "capitalize" }}>
                                        {selected.category}
                                    </span>
                                )}
                                {selected.walkTime && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 99 }}>🚶 {selected.walkTime}</span>}
                                {selected.driveTime && <span style={{ fontSize: 11, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 99 }}>🚗 {selected.driveTime}</span>}
                            </div>
                            <a href={googleMapsUrl(selected)} target="_blank" rel="noreferrer"
                                style={{ display: "block", marginTop: 8, textAlign: "center", background: "#4f46e5", color: "white", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                                Open in Maps ↗
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}

/* ─── Badge ───────────────────────────────────────────────── */

function Badge({ children, style = {} }) {
    return (
        <span style={{
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 99,
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.08)",
            ...style,
        }}>{children}</span>
    );
}

/* ─── Timeline Item ───────────────────────────────────────── */

const CAT_ICONS = {
    food: "🍽️", museums: "🏛️", nature: "🌿", shopping: "🛍️",
    nightlife: "🌙", landmarks: "🏙️", adventure: "⛰️",
};

const CAT_COLORS = {
    food: "#f97316", museums: "#8b5cf6", nature: "#22c55e",
    shopping: "#ec4899", nightlife: "#06b6d4", landmarks: "#f59e0b", adventure: "#ef4444",
};

function TimelineItem({ place, index, totalInDay }) {
    const [hovered, setHovered] = useState(false);
    const cat = place.category || "landmarks";
    const accent = CAT_COLORS[cat] || "#6366f1";
    const icon = CAT_ICONS[cat] || "📍";

    return (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {/* Timeline spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6, flexShrink: 0 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, boxShadow: `0 0 16px ${accent}55`,
                    border: "2px solid rgba(255,255,255,0.2)",
                }}>
                    <span style={{ fontWeight: 800, color: "white", fontSize: 13 }}>{index + 1}</span>
                </div>
                {index < totalInDay - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 40, background: `linear-gradient(to bottom, ${accent}66, transparent)`, marginTop: 4 }} />
                )}
            </div>

            {/* Card */}
            <a href={googleMapsUrl(place)} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                <div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        background: hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.09)",
                        border: `1px solid ${hovered ? accent + "66" : "rgba(255,255,255,0.12)"}`,
                        backdropFilter: "blur(12px)",
                        transition: "all 0.2s ease",
                        transform: hovered ? "translateY(-2px)" : "none",
                        boxShadow: hovered ? `0 12px 40px ${accent}30` : "0 4px 16px rgba(0,0,0,0.15)",
                        marginBottom: 12,
                    }}
                >
                    {/* Photo */}
                    <div style={{ position: "relative", height: 160, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                        {place.photoUrl ? (
                            <img src={place.photoUrl} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease", transform: hovered ? "scale(1.03)" : "scale(1)" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{icon}</div>
                        )}
                        {/* Time badge */}
                        {place.time && (
                            <div style={{
                                position: "absolute", top: 10, left: 12,
                                background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
                                borderRadius: 10, padding: "4px 10px",
                                color: "white", fontSize: 13, fontWeight: 700, letterSpacing: "0.03em",
                            }}>
                                {place.time}
                            </div>
                        )}
                        {/* Number badge */}
                        <div style={{
                            position: "absolute", top: 10, right: 12,
                            width: 28, height: 28, borderRadius: "50%",
                            background: accent, display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 800, fontSize: 13,
                            boxShadow: `0 4px 12px ${accent}88`,
                        }}>{index + 1}</div>
                        {/* Category pill */}
                        <div style={{
                            position: "absolute", bottom: 10, left: 12,
                            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
                            borderRadius: 99, padding: "3px 10px",
                            color: "white", fontSize: 11, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 4,
                        }}>
                            <span>{icon}</span> {cat}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "14px 16px" }}>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 4, lineHeight: 1.3 }}>{place.name}</div>
                        {place.address && (
                            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 4 }}>
                                <span style={{ flexShrink: 0 }}>📍</span> {place.address}
                            </div>
                        )}

                        {/* Travel times */}
                        {(place.walkTime || place.driveTime) && (
                            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                {place.walkTime && (
                                    <span style={{ fontSize: 12, background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "3px 10px", borderRadius: 99, border: "1px solid rgba(34,197,94,0.2)" }}>
                                        🚶 {place.walkTime}
                                    </span>
                                )}
                                {place.driveTime && (
                                    <span style={{ fontSize: 12, background: "rgba(59,130,246,0.15)", color: "#60a5fa", padding: "3px 10px", borderRadius: 99, border: "1px solid rgba(59,130,246,0.2)" }}>
                                        🚗 {place.driveTime}
                                    </span>
                                )}
                                {place.travelDistance && (
                                    <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "3px 10px", borderRadius: 99 }}>
                                        {place.travelDistance}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                                onClick={(e) => { e.preventDefault(); window.open(googleMapsUrl(place), "_blank"); }}
                                style={{
                                    background: "rgba(255,255,255,0.92)", color: "#111",
                                    border: "none", borderRadius: 12,
                                    padding: "6px 14px", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                                }}
                            >
                                🗺️ Open Maps
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); window.open(`https://www.google.com/search?q=hotels+near+${encodeURIComponent(place.name)}`, "_blank"); }}
                                style={{
                                    background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.8)",
                                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
                                    padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                🏨 Hotels
                            </button>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

/* ─── Main Page ───────────────────────────────────────────── */

export default function TripResults() {
    const location = useLocation();
    const state = location.state || {};
    const { tripId } = useParams();

    const [loading, setLoading] = useState(true);
    const [itinerary, setItinerary] = useState([]);
    const [error, setError] = useState("");
    const [showMap, setShowMap] = useState(false);

    const city = state?.destination || state?.city || null;
    const startDate = state?.startDate || null;
    const endDate = state?.endDate || null;

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetch(`${BACKEND_URL}/api/itinerary/${tripId}`);
                const data = await res.json();
                setItinerary(Array.isArray(data) ? data : []);
            } catch (e) {
                setError("Failed to load itinerary");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [tripId]);

    const byDay = useMemo(() => {
        const map = new Map();
        itinerary.forEach((item) => {
            const d = item.day ?? 1;
            if (!map.has(d)) map.set(d, []);
            map.get(d).push(item);
        });
        return map;
    }, [itinerary]);

    const dayKeys = [...byDay.keys()].sort((a, b) => a - b);
    const [activeDay, setActiveDay] = useState(1);
    const activePlaces = byDay.get(activeDay) || [];

    // Stats for current day
    const dayCatCounts = useMemo(() => {
        const counts = {};
        activePlaces.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
        return counts;
    }, [activePlaces]);

    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            {/* Scenic background */}
            <div style={{
                position: "fixed", inset: 0, zIndex: -1,
                backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2400&q=80')",
                backgroundSize: "cover", backgroundPosition: "center",
                filter: "brightness(0.45) saturate(1.2)",
            }} />
            <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)" }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 60px" }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div>
                            <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
                                {city || "Your Trip"} ✈️
                            </h1>
                            {(startDate || endDate) && (
                                <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 4, fontSize: 14 }}>
                                    📅 {startDate} → {endDate}
                                    {itinerary.length > 0 && <span style={{ marginLeft: 12 }}>· {itinerary.length} stops total</span>}
                                </div>
                            )}
                        </div>
                        <a href="/plan" style={{
                            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14,
                            padding: "10px 20px", color: "white", fontWeight: 600, fontSize: 14,
                            textDecoration: "none", transition: "background 0.2s",
                        }}>
                            + New Trip
                        </a>
                    </div>
                </div>

                {/* ── WEATHER WIDGET ── */}
                <WeatherWidget city={city} />

                {/* Day tabs */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {dayKeys.map((d) => (
                        <button
                            key={d}
                            onClick={() => setActiveDay(d)}
                            style={{
                                padding: "10px 20px", borderRadius: 99, border: "none",
                                background: d === activeDay ? "white" : "rgba(255,255,255,0.14)",
                                color: d === activeDay ? "#111" : "rgba(255,255,255,0.8)",
                                fontWeight: 700, fontSize: 14, cursor: "pointer",
                                backdropFilter: "blur(8px)",
                                transition: "all 0.2s ease",
                                boxShadow: d === activeDay ? "0 4px 20px rgba(0,0,0,0.25)" : "none",
                            }}
                        >
                            Day {d}
                        </button>
                    ))}
                </div>

                {/* Day summary bar */}
                {activePlaces.length > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                        background: "rgba(255,255,255,0.10)", backdropFilter: "blur(10px)",
                        borderRadius: 16, padding: "10px 16px", marginBottom: 20,
                        border: "1px solid rgba(255,255,255,0.15)",
                    }}>
                        <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13 }}>Day {activeDay}</span>
                        {Object.entries(dayCatCounts).map(([cat, count]) => (
                            <span key={cat} style={{
                                fontSize: 12, padding: "3px 10px", borderRadius: 99,
                                background: `${CAT_COLORS[cat] || "#6366f1"}33`,
                                color: CAT_COLORS[cat] || "#a5b4fc",
                                border: `1px solid ${CAT_COLORS[cat] || "#6366f1"}55`,
                                fontWeight: 600,
                            }}>
                                {CAT_ICONS[cat]} {count} {cat}
                            </span>
                        ))}
                        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                            {activePlaces.length} stops
                        </span>
                    </div>
                )}

                {/* Two-column layout: itinerary + map */}
                <div style={{ display: "grid", gridTemplateColumns: showMap ? "1fr 1fr" : "1fr", gap: 20, alignItems: "start" }}>

                    {/* ── ITINERARY TIMELINE ── */}
                    <div>
                        {loading && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{ height: 200, borderRadius: 20, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        )}
                        {error && <div style={{ color: "#f87171", padding: 20 }}>{error}</div>}
                        {!loading && !error && activePlaces.length === 0 && (
                            <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: 40 }}>No stops for this day.</div>
                        )}
                        {!loading && activePlaces.map((place, i) => (
                            <TimelineItem key={place.id || i} place={place} index={i} totalInDay={activePlaces.length} />
                        ))}
                    </div>

                    {/* ── MAP ── */}
                    {showMap && (
                        <div style={{ position: "sticky", top: 90 }}>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                📍 Day {activeDay} Map
                                <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5 }}>· click markers for details</span>
                            </div>
                            <TripMap places={activePlaces} />

                            {/* Mini legend */}
                            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {activePlaces.filter(p => p.lat && p.lng).map((p, i) => (
                                    <div key={i} style={{
                                        background: "rgba(255,255,255,0.10)", borderRadius: 10, padding: "4px 10px",
                                        fontSize: 11, color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)",
                                        display: "flex", alignItems: "center", gap: 5,
                                    }}>
                                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: CAT_COLORS[p.category] || "#6366f1", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                                        {p.name?.split(" ").slice(0, 3).join(" ")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MAP TOGGLE BUTTON ── */}
                <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
                    <button
                        onClick={() => setShowMap(!showMap)}
                        style={{
                            padding: "14px 32px",
                            borderRadius: 99,
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: showMap
                                ? "rgba(99,102,241,0.85)"
                                : "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s ease",
                            boxShadow: showMap ? "0 8px 32px rgba(99,102,241,0.4)" : "0 4px 20px rgba(0,0,0,0.2)",
                        }}
                    >
                        {showMap ? "🗺️ Hide Map" : "🗺️ Show Trip Map"}
                    </button>
                </div>
            </div>
        </GlassPage>
    );
}