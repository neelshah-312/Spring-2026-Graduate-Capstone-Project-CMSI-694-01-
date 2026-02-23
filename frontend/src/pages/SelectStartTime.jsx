import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import GlassPage from "../components/GlassPage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function SelectStartTime({ theme, setTheme }) {
    const navigate = useNavigate();
    const { state } = useLocation();

    const tripId = state?.tripId;
    const city = state?.city;
    const interests = state?.interests || [];
    const days = state?.days;

    const [startTime, setStartTime] = useState(normalizeToHHMM(state?.startTime));
    console.log("startTime raw:", startTime, "valid?", /^\d{2}:\d{2}$/.test(startTime));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    function normalizeToHHMM(input) {
        if (!input) return "09:00";

        // If it's already HH:MM
        if (/^\d{2}:\d{2}$/.test(input)) return input;

        // Convert formats like "09:00 AM", "9:00 PM"
        const m = String(input).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return "09:00";

        let hour = parseInt(m[1], 10);
        const minute = m[2];
        const ampm = m[3].toUpperCase();

        if (ampm === "AM") {
            if (hour === 12) hour = 0;
        } else {
            if (hour !== 12) hour += 12;
        }

        return `${String(hour).padStart(2, "0")}:${minute}`;
    }
    async function handleGenerate() {
        try {
            setLoading(true);
            setError("");

            if (!tripId) throw new Error("Missing tripId (navigation state).");
            if (!city) throw new Error("Missing city (navigation state).");
            if (!days) throw new Error("Missing days (navigation state).");
            if (!interests.length) throw new Error("No interests selected.");

            // ✅ IMPORTANT: startTime must be "HH:MM" (e.g. "09:00")
            const res = await fetch(`${BACKEND_URL}/api/itinerary/${tripId}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city, interests, days, startTime }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to generate itinerary.");

            navigate(`/trip/${tripId}`, {
                state: {
                    ...state,
                    startTime,
                    itinerary: Array.isArray(data) ? data : [],
                },
            });
        } catch (e) {
            setError(e.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[rgb(var(--background))]">
            <Navbar theme={theme} setTheme={setTheme} />

            <GlassPage>
                <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl font-bold text-[rgb(var(--text))]">
                        What time do you want to start your day?
                    </h1>

                    <div className="mt-10 flex justify-center">
                        {/* Apple-ish pill style but still returns HH:MM */}
                        <input
                            type="time"
                            value={/^\d{2}:\d{2}$/.test(startTime) ? startTime : "09:00"}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    {error ? (
                        <div className="mt-6 text-sm text-red-600">{error}</div>
                    ) : null}

                    <div className="mt-10">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-10 py-4 rounded-full font-semibold text-white bg-pink-500 hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                        >
                            {loading ? "Generating..." : "Generate Itinerary"}
                        </button>
                    </div>
                </div>
            </GlassPage>
        </div>
    );
}