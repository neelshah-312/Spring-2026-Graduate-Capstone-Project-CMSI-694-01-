import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import GlassPage from "../components/GlassPage";

const INTEREST_OPTIONS = [
    { key: "food", label: "Food", icon: "🍽️" },
    { key: "museums", label: "Museums", icon: "🏛️" },
    { key: "nature", label: "Nature", icon: "🌿" },
    { key: "nightlife", label: "Nightlife", icon: "🎉" },
    { key: "shopping", label: "Shopping", icon: "🛍️" },
    { key: "adventure", label: "Adventure", icon: "⛰️" },
    { key: "landmarks", label: "Landmarks", icon: "🏙️" },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function SelectInterests({ theme, setTheme }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Data coming from TripDates page
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
        setErr("");

        if (!destination || !startDate || !endDate || !days) {
            setErr("Missing trip details. Please go back and select dates again.");
            return;
        }
        if (selected.length === 0) {
            setErr("Please select at least one interest.");
            return;
        }

        try {
            setLoading(true);

            // ✅ Generate trip WITH interests
            const res = await fetch(`${BACKEND_URL}/api/trips/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    city: destination,
                    days,
                    startDate,
                    endDate,
                    interests: selected,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to generate trip.");

            const tripId = data.tripId || data.id;
            if (!tripId) throw new Error("Backend did not return tripId.");

            navigate(`/trip/${tripId}`, {
                state: {
                    itinerary: data.itinerary || [],
                    city: destination,
                    startDate,
                    endDate,
                    days,
                    interests: selected,
                },
            });
        } catch (e) {
            setErr(e.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar theme={theme} setTheme={setTheme} />

            <GlassPage>
                <div className="max-w-3xl mx-auto px-6 py-12">
                    <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
                        What excites you most?
                    </h1>

                    <p className="text-[rgb(var(--muted))] mb-8">
                        Select your interests to personalize your trip.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        {INTEREST_OPTIONS.map((item) => {
                            const isActive = selected.includes(item.key);

                            return (
                                <button
                                    key={item.key}
                                    onClick={() => toggle(item.key)}
                                    type="button"
                                    className={`rounded-2xl p-6 text-left transition-all duration-300 border
                        ${isActive
                                            ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-xl scale-[1.02]"
                                            : "bg-white/70 dark:bg-[rgb(var(--card))]/70 border-[rgb(var(--border))]"
                                        }`}
                                >
                                    <div className="text-2xl mb-3">{item.icon}</div>
                                    <div className="font-semibold">{item.label}</div>
                                </button>
                            );
                        })}
                    </div>

                    {err ? <div className="mt-6 text-sm text-red-500">{err}</div> : null}

                    <div className="mt-10 flex justify-between">
                        <button
                            onClick={() => navigate("/dates", { state: { destination } })}
                            className="px-6 py-3 rounded-xl border border-[rgb(var(--border))] bg-white/70 dark:bg-[rgb(var(--card))]/70"
                        >
                            ← Back
                        </button>

                        <button
                            onClick={handleGenerate}
                            disabled={!canContinue || loading}
                            className={`px-6 py-3 rounded-xl text-white font-semibold transition
                    ${!canContinue || loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[rgb(var(--primary))] hover:opacity-90"
                                }`}
                        >
                            {loading ? "Generating..." : "Generate Itinerary →"}
                        </button>
                    </div>
                </div>
            </GlassPage>
        </>
    );
}
