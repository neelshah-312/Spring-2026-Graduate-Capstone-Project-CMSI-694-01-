import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import GlassPage from "../components/GlassPage";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

function Badge({ children }) {
    return (
        <span className="px-2 py-1 rounded-full text-xs border border-[rgb(var(--border))] text-[rgb(var(--muted))]">
            {children}
        </span>
    );
}

function googleMapsUrl(p) {
    if (p?.lat != null && p?.lng != null) {
        return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    }
    const q = encodeURIComponent([p?.name, p?.address].filter(Boolean).join(" "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function PlaceCard({ p }) {
    return (
        <a
            href={googleMapsUrl(p)}
            target="_blank"
            rel="noreferrer"
            className="block"
            title="Open in Google Maps"
        >
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/80 dark:bg-[rgb(var(--card))]/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                <div className="h-40 bg-black/5 dark:bg-white/5">
                    {p.photoUrl ? (
                        <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : null}
                </div>

                <div className="p-4">
                    <div className="text-[rgb(var(--text))] font-semibold text-lg leading-snug">
                        {p.name}
                    </div>

                    {p.address ? (
                        <div className="mt-1 text-sm text-[rgb(var(--muted))] line-clamp-2">
                            {p.address}
                        </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                        {p.category ? <Badge>{p.category}</Badge> : null}
                    </div>

                    <div className="mt-3 text-xs text-[rgb(var(--muted))] underline">
                        Open in Google Maps
                    </div>
                </div>
            </div>
        </a>
    );
}

function ResultsSkeleton() {
    return (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[rgb(var(--border))] bg-white/80 dark:bg-[rgb(var(--card))]/80 overflow-hidden"
                >
                    <div className="h-40 bg-black/5 dark:bg-white/5 animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function TripResults() {
    const location = useLocation();
    const state = location.state;

    const { tripId } = useParams();
    const navigate = useNavigate();
    const interests = state?.interests || []; ``


    const [loading, setLoading] = useState(true);
    const [itinerary, setItinerary] = useState(state?.itinerary || []);
    const [error, setError] = useState("");

    // ✅ Trip meta for header (city + dates)
    const [tripMeta, setTripMeta] = useState({
        city: state?.city || null,
        startDate: state?.startDate || null,
        endDate: state?.endDate || null,
        days: state?.days || null,
    });

    useEffect(() => {
        async function loadTripMetaIfNeeded() {
            // If we already have meta from navigation state, don't fetch
            if (tripMeta.city || tripMeta.startDate || tripMeta.endDate) return;

            try {
                const res = await fetch(`${BACKEND_URL}/api/trips/${tripId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load trip info.");

                setTripMeta({
                    city: data.city || null,
                    startDate: data.startDate || null,
                    endDate: data.endDate || null,
                    days: null,
                });
            } catch {
                // non-fatal: header just won't show meta
            }
        }

        loadTripMetaIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]);

    useEffect(() => {
        // ✅ If we already have itinerary from navigation state, use it
        if (state?.itinerary?.length) {
            setItinerary(state.itinerary);
            setLoading(false);
            return;
        }

        // ✅ Otherwise fetch saved itinerary from DB using your real endpoint:
        async function loadItinerary() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${BACKEND_URL}/api/itinerary/${tripId}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data?.error || "Failed to load itinerary.");
                setItinerary(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e.message || "Something went wrong.");
                setItinerary([]);
            } finally {
                setLoading(false);
            }
        }

        loadItinerary();
    }, [tripId, state]);

    // group by day
    const byDay = useMemo(() => {
        const m = new Map();
        for (const item of itinerary) {
            const d = item.day ?? 1;
            if (!m.has(d)) m.set(d, []);
            m.get(d).push(item);
        }
        for (const [d, arr] of m.entries()) {
            arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            m.set(d, arr);
        }
        return m;
    }, [itinerary]);

    const dayKeys = useMemo(() => Array.from(byDay.keys()).sort((a, b) => a - b), [byDay]);
    const [activeDay, setActiveDay] = useState(1);

    useEffect(() => {
        if (dayKeys.length) setActiveDay(dayKeys[0]);
    }, [dayKeys]);

    const activePlaces = byDay.get(activeDay) || [];

    return (

        <GlassPage>
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-[rgb(var(--text))]">
                            Your Itinerary
                        </h1>

                        <p className="mt-1 text-[rgb(var(--muted))]">
                            {tripMeta.city ? <span> {tripMeta.city}</span> : null}
                            {tripMeta.startDate && tripMeta.endDate ? (
                                <span> • {tripMeta.startDate} → {tripMeta.endDate}</span>
                            ) : null}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/plan")}
                        className="px-4 py-2 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--text))] hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        Plan Another Trip
                    </button>

                </div>

                {/* Day tabs */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {dayKeys.length ? (
                        dayKeys.map((d) => {
                            const active = d === activeDay;
                            return (
                                <button
                                    key={d}
                                    onClick={() => setActiveDay(d)}
                                    className={
                                        "px-4 py-2 rounded-xl text-sm border transition " +
                                        (active
                                            ? "border-transparent text-white bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary2))] shadow"
                                            : "border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-black/5 dark:hover:bg-white/5")
                                    }
                                >
                                    Day {d}
                                </button>
                            );
                        })
                    ) : (
                        <span className="text-[rgb(var(--muted))]">
                            {loading ? "Loading days..." : "No days found"}
                        </span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <ResultsSkeleton />
                ) : itinerary.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-[rgb(var(--border))] bg-white/70 dark:bg-[rgb(var(--card))]/70 p-6">
                        <div className="text-[rgb(var(--text))] font-semibold">
                            {error ? "Could not load itinerary" : "No itinerary data"}
                        </div>
                        <div className="mt-2 text-[rgb(var(--muted))]">
                            {error ? error : "Go back and generate a trip again."}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {activePlaces.map((p) => (
                            <PlaceCard key={`${p.id || p.place_id || p.name}-${p.day}`} p={p} />
                        ))}
                    </div>
                )}
            </div>
        </GlassPage>

    );
}
