import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                padding: scrolled ? "8px 24px" : "14px 24px",
                transition: "padding 0.3s ease",
                background: "transparent",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "999px",
                    padding: "8px 8px 8px 20px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                    pointerEvents: "all",
                    transition: "all 0.3s ease",
                }}
            >
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        textDecoration: "none",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            flexShrink: 0,
                        }}
                    >
                        ✈️
                    </div>
                    <span
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "#fff",
                            letterSpacing: "-0.2px",
                        }}
                    >
                        TripWise
                    </span>
                </Link>

                {/* Center links */}
                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}
                >
                    {["Home", "About", "Destinations", "Contact"].map((item) => (
                        <a
                            key={item}
                            href="#"
                            style={{
                                padding: "6px 16px",
                                borderRadius: "999px",
                                fontSize: "13.5px",
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.6)",
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = "#fff";
                                e.target.style.background = "rgba(255,255,255,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = "rgba(255,255,255,0.6)";
                                e.target.style.background = "transparent";
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <Link
                    to="/plan"
                    style={{
                        padding: "9px 22px",
                        borderRadius: "999px",
                        fontSize: "13.5px",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 600,
                        color: "#fff",
                        textDecoration: "none",
                        background: "linear-gradient(135deg, #a855f7, #ec4899)",
                        boxShadow: "0 0 20px rgba(168,85,247,0.45)",
                        transition: "all 0.2s ease",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.04)";
                        e.currentTarget.style.boxShadow = "0 0 30px rgba(168,85,247,0.65)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(168,85,247,0.45)";
                    }}
                >
                    Plan Trip →
                </Link>
            </div>
        </header>
    );
}