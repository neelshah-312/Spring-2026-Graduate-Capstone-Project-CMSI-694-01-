import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

const INTEREST_OPTIONS = [
    { key: "food", label: "Food & Dining", icon: "🍽️", desc: "Restaurants, cafés & local cuisine" },
    { key: "museums", label: "Museums", icon: "🏛️", desc: "Art, history & culture" },
    { key: "nature", label: "Nature", icon: "🌿", desc: "Parks, hikes & outdoors" },
    { key: "nightlife", label: "Nightlife", icon: "🎉", desc: "Bars, clubs & entertainment" },
    { key: "shopping", label: "Shopping", icon: "🛍️", desc: "Markets, malls & boutiques" },
    { key: "adventure", label: "Adventure", icon: "⛰️", desc: "Thrill-seeking experiences" },
    { key: "landmarks", label: "Landmarks", icon: "🏙️", desc: "Icons & historic sites" },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function SelectInterests() {
    const navigate = useNavigate();
    const location = useLocation();
    const { destination, startDate, endDate, days } = location.state || {};

    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const canContinue = useMemo(() => selected.length > 0, [selected]);

    function toggle(id) {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    async function handleGenerate() {
        try {
            setLoading(true);
            setErr("");

            const res = await fetch(`${BACKEND_URL}/api/trips/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city: destination, days, startDate, endDate, interests: selected }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error);

            const tripId = data.tripId || data.id;

            navigate(`/trip/${tripId}`, {
                state: { itinerary: data.itinerary, city: destination, startDate, endDate, days, interests: selected },
            });
        } catch (e) {
            setErr(e.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: "url('/images/mountain.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            position: "relative",
            fontFamily: "'Outfit', system-ui, sans-serif",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .interest-card:hover { transform: translateY(-3px) !important; }
        .generate-btn:hover:not(:disabled) { transform: scale(1.03); }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

            {/* Overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.55) 100%)",
            }} />

            {/* Content */}
            <div style={{
                position: "relative", zIndex: 10,
                display: "flex", flexDirection: "column",
                alignItems: "center",
                padding: "32px 24px 60px",
                minHeight: "100vh",
            }}>

                {/* Top nav row */}
                <div style={{
                    width: "100%", maxWidth: 860,
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
                    animation: "fadeUp 0.4s ease both",
                }}>
                    <button
                        onClick={() => navigate("/dates", { state: { destination } })}
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            borderRadius: 999,
                            padding: "7px 16px",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.15s ease",
                        }}
                        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    >
                        ← Back
                    </button>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Step 3 of 3</span>

                    {/* trip summary pill */}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <span style={{
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 999, padding: "5px 14px",
                            color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600,
                        }}>
                            📍 {destination}
                        </span>
                        {days && (
                            <span style={{
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 999, padding: "5px 14px",
                                color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600,
                            }}>
                                🗓 {days} days
                            </span>
                        )}
                    </div>
                </div>

                {/* Heading */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1 style={{
                        animation: "fadeUp 0.4s 0.08s ease both",
                        fontSize: "clamp(32px, 4.5vw, 56px)",
                        fontWeight: 900,
                        color: "white",
                        margin: "0 0 10px",
                        letterSpacing: "-0.03em",
                        textShadow: "0 2px 30px rgba(0,0,0,0.3)",
                    }}>
                        What excites you?
                    </h1>
                    <p style={{
                        animation: "fadeUp 0.4s 0.14s ease both",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 16, margin: 0,
                    }}>
                        Pick your interests — select as many as you like
                    </p>
                </div>

                {/* Interest grid */}
                <div style={{
                    animation: "fadeUp 0.4s 0.2s ease both",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 14,
                    width: "100%",
                    maxWidth: 860,
                }}>
                    {INTEREST_OPTIONS.map((item, i) => {
                        const isActive = selected.includes(item.key);
                        return (
                            <button
                                key={item.key}
                                className="interest-card"
                                onClick={() => toggle(item.key)}
                                style={{
                                    background: isActive
                                        ? "rgba(109,40,217,0.85)"
                                        : "rgba(255,255,255,0.14)",
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    border: isActive
                                        ? "2px solid rgba(167,139,250,0.8)"
                                        : "2px solid rgba(255,255,255,0.2)",
                                    borderRadius: 20,
                                    padding: "22px 20px",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontFamily: "inherit",
                                    animationDelay: `${i * 40}ms`,
                                    boxShadow: isActive
                                        ? "0 8px 32px rgba(109,40,217,0.35)"
                                        : "0 4px 16px rgba(0,0,0,0.12)",
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 10, lineHeight: 1 }}>{item.icon}</div>
                                <div style={{
                                    fontWeight: 700, fontSize: 16,
                                    color: isActive ? "white" : "rgba(255,255,255,0.92)",
                                    marginBottom: 4,
                                }}>
                                    {item.label}
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)",
                                    fontWeight: 400,
                                    lineHeight: 1.4,
                                }}>
                                    {item.desc}
                                </div>

                                {isActive && (
                                    <div style={{
                                        position: "absolute",
                                        top: 14, right: 14,
                                        width: 20, height: 20,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.25)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11,
                                        color: "white",
                                        fontWeight: 800,
                                    }}>✓</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Error */}
                {err && (
                    <div style={{
                        marginTop: 16,
                        background: "rgba(239,68,68,0.15)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        borderRadius: 12,
                        padding: "10px 18px",
                        color: "#FCA5A5",
                        fontSize: 14, fontWeight: 500,
                    }}>
                        ⚠️ {err}
                    </div>
                )}

                {/* Bottom bar */}
                <div style={{
                    marginTop: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    animation: "fadeUp 0.4s 0.3s ease both",
                }}>
                    {selected.length > 0 && (
                        <div style={{
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 999,
                            padding: "10px 18px",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 14, fontWeight: 600,
                        }}>
                            {selected.length} selected
                        </div>
                    )}

                    <button
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={!canContinue || loading}
                        style={{
                            background: canContinue && !loading
                                ? "linear-gradient(135deg, #EC4899, #DB2777)"
                                : "rgba(255,255,255,0.2)",
                            color: "white",
                            border: "none",
                            borderRadius: 16,
                            padding: "15px 36px",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: canContinue && !loading ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            fontFamily: "inherit",
                            boxShadow: canContinue && !loading ? "0 6px 24px rgba(236,72,153,0.4)" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    display: "inline-block",
                                    width: 16, height: 16,
                                    border: "2.5px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "white",
                                    borderRadius: "50%",
                                    animation: "spin 0.7s linear infinite",
                                }} />
                                Generating your trip...
                            </>
                        ) : (
                            <>Generate Itinerary ✨</>
                        )}
                    </button>
                </div>

                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .interest-card { position: relative; }
        `}</style>
            </div>
        </div>
    );
}