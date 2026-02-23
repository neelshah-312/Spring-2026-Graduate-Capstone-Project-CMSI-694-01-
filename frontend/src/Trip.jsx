import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getItinerary } from "./api";

export default function Trip() {
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [day, setDay] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getItinerary(id);
                setItems(data);
                setErr("");
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const days = useMemo(() => {
        const maxDay = items.reduce((m, x) => Math.max(m, x.day || 1), 1);
        return Array.from({ length: maxDay }, (_, i) => i + 1);
    }, [items]);

    const dayItems = items.filter((x) => (x.day || 1) === day);

    return (
        <div className="min-h-screen bg-[#0b0b0d] text-white">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Trip #{id}</h1>
                    <Link to="/" className="text-white/80 hover:text-white">
                        + New Trip
                    </Link>
                </div>

                {loading && <div className="mt-6 text-white/70">Loading itinerary...</div>}
                {err && <div className="mt-6 text-red-400">{err}</div>}

                {!loading && !err && (
                    <>
                        {/* day tabs */}
                        <div className="flex gap-2 mt-5 flex-wrap">
                            {days.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDay(d)}
                                    className={`px-4 py-2 rounded-full border transition ${d === day
                                        ? "bg-white text-black border-white"
                                        : "border-white/15 hover:bg-white/10"
                                        }`}
                                >
                                    Day {d}
                                </button>
                            ))}
                        </div>

                        {/* cards */}
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {dayItems.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl"
                                >
                                    <div className="h-44 bg-black/10">
                                        {p.photoUrl ? (
                                            <img
                                                src={p.photoUrl}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm text-black/60">
                                                No photo from Google
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="font-semibold text-lg">{p.name}</div>
                                        <div className="text-sm text-black/60 mt-1">{p.address}</div>
                                        <div className="mt-3 inline-flex px-3 py-1 rounded-full bg-black/5 text-xs">
                                            {p.category}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {items.length === 0 && (
                            <div className="mt-10 text-white/70">
                                No items yet. Generate again.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
