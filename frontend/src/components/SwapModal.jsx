import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

const CAT_ICONS = {
    food: "🍽️", museums: "🏛️", nature: "🌿", shopping: "🛍️",
    nightlife: "🌙", landmarks: "🏙️", adventure: "⛰️",
};

const CAT_QUERIES = {
    food: "best restaurants",
    landmarks: "top landmarks",
    museums: "best museums",
    nature: "parks gardens",
    shopping: "shopping areas",
    nightlife: "bars nightlife",
    adventure: "adventure activities",
};

export default function SwapModal({ place, city, allPlaces, onSwap, onClose }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!place || !city) return;

        setLoading(true);
        setError("");
        setSuggestions([]);

        const query = CAT_QUERIES[place.category] || "top attractions";
        const excluded = new Set((allPlaces || []).map(p => (p.name || "").toLowerCase()));

        fetch(
            BACKEND_URL + "/api/places-search"
            + "?city=" + encodeURIComponent(city)
            + "&query=" + encodeURIComponent(query)
        )
            .then(r => {
                if (!r.ok) throw new Error("Server error " + r.status);
                return r.json();
            })
            .then(data => {
                if (data && data.error) throw new Error(data.error);
                const results = (Array.isArray(data) ? data : [])
                    .filter(p => p?.name && !excluded.has(p.name.toLowerCase()))
                    .slice(0, 4);
                setSuggestions(results);
            })
            .catch(e => {
                console.error("SwapModal error:", e);
                setError(e.message || "Failed to load suggestions");
            })
            .finally(() => setLoading(false));

    }, [place?.name, city]);

    if (!place) return null;

    return (
        <>
            <div onClick={onClose} style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
                animation: "fadeIn 0.2s ease",
            }} />

            <div style={{
                position: "fixed", zIndex: 1001,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(560px, 92vw)",
                background: "rgba(15,15,35,0.95)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 28, padding: "28px 28px 24px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                animation: "slideUp 0.25s ease",
                fontFamily: "'Outfit', system-ui, sans-serif",
            }}>
                <style>{`
                    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                    @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
                    @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
                    .swap-card:hover { background:rgba(255,255,255,0.13) !important; transform:translateY(-2px); }
                `}</style>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                            🔄 Swap Place
                        </div>
                        <div style={{ color: "white", fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>
                            Replace "{place.name}"
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 3 }}>
                            {CAT_ICONS[place.category] || "📍"} {place.category} · {city}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)", border: "none",
                        color: "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}
                        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    >✕</button>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />

                {/* Skeletons */}
                {loading && [1, 2, 3].map(i => (
                    <div key={i} style={{
                        height: 72, borderRadius: 16, marginBottom: 12,
                        background: "rgba(255,255,255,0.07)",
                        animation: `pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
                    }} />
                ))}

                {/* Error */}
                {!loading && error && (
                    <div style={{ color: "#f87171", fontSize: 14, padding: "12px 16px", background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.2)", marginBottom: 12 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && suggestions.length === 0 && (
                    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "24px 0", fontSize: 14 }}>
                        No alternatives found.
                    </div>
                )}

                {/* Cards */}
                {!loading && !error && suggestions.map((s, i) => (
                    <button key={s.place_id || i} className="swap-card"
                        onClick={() => { onSwap(s); onClose(); }}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 14px", borderRadius: 16, marginBottom: 10,
                            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer", textAlign: "left", transition: "all 0.18s ease", fontFamily: "inherit",
                        }}
                    >
                        <div style={{
                            width: 52, height: 52, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                            background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                        }}>
                            {s.photoUrl
                                ? <img src={s.photoUrl} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : (CAT_ICONS[place.category] || "📍")
                            }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {s.name}
                            </div>
                            {s.address && (
                                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    📍 {s.address}
                                </div>
                            )}
                            {s.rating && (
                                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>⭐ {s.rating}</div>
                            )}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18, flexShrink: 0 }}>→</div>
                    </button>
                ))}

                {/* Cancel */}
                <button onClick={onClose} style={{
                    width: "100%", marginTop: 6, padding: "11px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
                    color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease",
                }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >Cancel</button>
            </div>
        </>
    );
}