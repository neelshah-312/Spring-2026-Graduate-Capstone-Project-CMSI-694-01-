import { useState } from "react";
import { useNavigate } from "react-router-dom";

const POPULAR_DESTINATIONS = [
    { city: "Ahmedabad", emoji: "🕌" },
    { city: "Dubai", emoji: "🌆" },
    { city: "New York", emoji: "🗽" },
    { city: "London", emoji: "🎡" },
    { city: "Barcelona", emoji: "🏖" },
    { city: "Tokyo", emoji: "⛩" },
];

export default function PlanTrip() {
    const [destination, setDestination] = useState("");
    const navigate = useNavigate();

    function goNext(city) {
        const val = (city || destination).trim();
        if (!val) return;
        navigate("/dates", { state: { destination: val } });
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
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
        }
        .search-input::placeholder { color: rgba(80,80,80,0.6); }
        .search-input:focus { outline: none; }
        .city-chip:hover { background: rgba(255,255,255,0.95) !important; transform: translateY(-2px); }
        .go-btn:hover { background: rgba(120,80,220,0.95) !important; transform: scale(1.03); }
      `}</style>

            {/* Dark gradient overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.5) 100%)",
            }} />

            {/* Content */}
            <div style={{
                position: "relative", zIndex: 10,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                minHeight: "100vh",
                padding: "0 24px",
                textAlign: "center",
            }}>

                {/* Eyebrow */}
                <div style={{
                    animation: "fadeUp 0.5s ease forwards",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 999,
                    padding: "6px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 20,
                }}>
                    ✦ AI-Powered Travel Planning
                </div>

                {/* Headline */}
                <h1 style={{
                    animation: "fadeUp 0.5s 0.1s ease both",
                    fontSize: "clamp(42px, 6vw, 80px)",
                    fontWeight: 900,
                    color: "white",
                    margin: "0 0 16px",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                    maxWidth: 800,
                }}>
                    Discover your<br />next adventure
                </h1>

                <p style={{
                    animation: "fadeUp 0.5s 0.18s ease both",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 18,
                    margin: "0 0 36px",
                    fontWeight: 400,
                }}>
                    Tell us where you want to go — we'll handle the rest.
                </p>

                {/* Search bar */}
                <div style={{
                    animation: "fadeUp 0.5s 0.26s ease both",
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 999,
                    padding: "8px 8px 8px 24px",
                    width: "100%",
                    maxWidth: 600,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.6)",
                }}>
                    <span style={{ fontSize: 20, marginRight: 10 }}>🔍</span>
                    <input
                        className="search-input"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goNext()}
                        placeholder="Where do you want to travel?"
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#1a1a1a",
                            fontFamily: "inherit",
                        }}
                    />
                    <button
                        className="go-btn"
                        onClick={() => goNext()}
                        style={{
                            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                            color: "white",
                            border: "none",
                            borderRadius: 999,
                            padding: "13px 28px",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                            fontFamily: "inherit",
                            boxShadow: "0 4px 16px rgba(109,40,217,0.4)",
                        }}
                    >
                        Go →
                    </button>
                </div>

                {/* Popular destinations */}
                <div style={{
                    animation: "fadeUp 0.5s 0.34s ease both",
                    marginTop: 28,
                }}>
                    <p style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 12,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                    }}>
                        Popular destinations
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                        {POPULAR_DESTINATIONS.map(({ city, emoji }) => (
                            <button
                                key={city}
                                className="city-chip"
                                onClick={() => goNext(city)}
                                style={{
                                    background: "rgba(255,255,255,0.18)",
                                    backdropFilter: "blur(12px)",
                                    border: "1.5px solid rgba(255,255,255,0.3)",
                                    borderRadius: 999,
                                    padding: "9px 18px",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "white",
                                    cursor: "pointer",
                                    transition: "all 0.18s ease",
                                    fontFamily: "inherit",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <span>{emoji}</span> {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scroll hint */}
                <div style={{
                    position: "absolute",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                }}>
                    Scroll to explore ↓
                </div>
            </div>
        </div>
    );
}