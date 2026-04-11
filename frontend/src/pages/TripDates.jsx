import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DateRangePill from "../components/DateRangePill";

function daysBetween(start, end) {
    if (!start || !end) return 0;
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

function toISODate(d) {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function TripDates() {
    const location = useLocation();
    const navigate = useNavigate();
    const destination = location.state?.destination || "";

    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!destination) navigate("/plan", { replace: true });
    }, [destination, navigate]);

    const days = useMemo(() => daysBetween(start, end), [start, end]);

    function findPlaces() {
        setErr("");
        if (!start || !end || days <= 0) {
            setErr("Please select valid start and end dates.");
            return;
        }
        navigate("/interests", {
            state: { destination, startDate: toISODate(start), endDate: toISODate(end), days },
        });
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
        .find-btn:hover { transform: scale(1.03); box-shadow: 0 8px 28px rgba(236,72,153,0.5) !important; }
        .back-link:hover { background: rgba(255,255,255,0.25) !important; }
      `}</style>

            {/* Overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)",
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

                {/* Breadcrumb */}
                <div style={{
                    animation: "fadeUp 0.4s ease both",
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
                }}>
                    <button
                        className="back-link"
                        onClick={() => navigate("/plan")}
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            borderRadius: 999,
                            padding: "6px 14px",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s ease",
                        }}
                    >
                        ← Back
                    </button>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Step 2 of 3</span>
                </div>

                {/* Destination badge */}
                <div style={{
                    animation: "fadeUp 0.4s 0.05s ease both",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 999,
                    padding: "6px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.05em",
                    marginBottom: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                }}>
                    📍 {destination}
                </div>

                {/* Headline */}
                <h1 style={{
                    animation: "fadeUp 0.4s 0.1s ease both",
                    fontSize: "clamp(36px, 5vw, 64px)",
                    fontWeight: 900,
                    color: "white",
                    margin: "0 0 12px",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                }}>
                    When are you going?
                </h1>

                <p style={{
                    animation: "fadeUp 0.4s 0.15s ease both",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 17,
                    margin: "0 0 36px",
                }}>
                    {days > 0
                        ? `✨ ${days} day${days > 1 ? "s" : ""} of adventure awaits`
                        : "Select your travel window below"}
                </p>

                {/* Date picker card */}
                <div style={{
                    animation: "fadeUp 0.4s 0.2s ease both",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 24,
                    padding: "24px 28px",
                    width: "100%",
                    maxWidth: 640,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1)",
                    border: "1.5px solid rgba(255,255,255,0.7)",
                }}>

                    {/* Date row */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                    }}>
                        <DateRangePill
                            start={start}
                            end={end}
                            onChange={(s, e) => { setStart(s || null); setEnd(e || null); }}
                        />

                        {/* Days display */}
                        <div style={{
                            padding: "0 20px",
                            borderLeft: "1.5px solid rgba(0,0,0,0.08)",
                            marginLeft: 8,
                            minWidth: 80,
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Duration</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: days > 0 ? "#6D28D9" : "#CCC" }}>
                                {days > 0 ? `${days}d` : "--"}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: "1.5px", background: "rgba(0,0,0,0.06)", margin: "20px 0" }} />

                    {/* Action row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        {err ? (
                            <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 500 }}>⚠️ {err}</div>
                        ) : (
                            <div style={{ fontSize: 13, color: "#888" }}>
                                {start && end ? `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} → ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : "No dates selected yet"}
                            </div>
                        )}

                        <button
                            className="find-btn"
                            onClick={findPlaces}
                            style={{
                                background: "linear-gradient(135deg, #EC4899, #DB2777)",
                                color: "white",
                                border: "none",
                                borderRadius: 14,
                                padding: "13px 28px",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                                fontFamily: "inherit",
                                boxShadow: "0 4px 20px rgba(236,72,153,0.35)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Find Places →
                        </button>
                    </div>
                </div>

                {/* Quick duration pills */}
                <div style={{
                    animation: "fadeUp 0.4s 0.28s ease both",
                    marginTop: 20,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}>
                    {[
                        { label: "Weekend", days: 2 },
                        { label: "Week", days: 7 },
                        { label: "10 Days", days: 10 },
                        { label: "2 Weeks", days: 14 },
                    ].map(({ label, days: d }) => (
                        <button
                            key={label}
                            onClick={() => {
                                const s = new Date();
                                s.setDate(s.getDate() + 1);
                                const e = new Date(s);
                                e.setDate(e.getDate() + d);
                                setStart(s);
                                setEnd(e);
                            }}
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(10px)",
                                border: "1.5px solid rgba(255,255,255,0.25)",
                                borderRadius: 999,
                                padding: "7px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "white",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                fontFamily: "inherit",
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
                            onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}