import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DateRangePill from "../components/DateRangePill";

function daysBetween(start, end) {
    if (!start || !end) return 0;

    const s = new Date(start);
    const e = new Date(end);

    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));

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

        const startDate = toISODate(start);
        const endDate = toISODate(end);

        navigate("/interests", {
            state: {
                destination,
                startDate,
                endDate,
                days
            }
        });
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center relative"
            style={{
                backgroundImage: "url('/images/mountain.jpg')"
            }}
        >
            {/* overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-[70vh] text-center px-6">

                <h1 className="text-5xl font-bold text-white">
                    Choose your travel dates
                </h1>

                <p className="text-white/80 mt-3">
                    Destination: <b>{destination}</b> {days > 0 ? `• ${days} days` : ""}
                </p>

                <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-4 w-full max-w-3xl mt-8">

                    <DateRangePill
                        start={start}
                        end={end}
                        onChange={(s, e) => {
                            setStart(s || null);
                            setEnd(e || null);
                        }}
                    />

                    <div className="px-4 text-gray-400">|</div>

                    <div className="text-gray-700 w-24">
                        {days > 0 ? `${days} days` : "--"}
                    </div>

                    <button
                        onClick={findPlaces}
                        className="ml-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 py-2"
                    >
                        Find Places
                    </button>

                </div>

                {err && (
                    <div className="mt-4 text-sm text-red-200">
                        {err}
                    </div>
                )}

            </div>
        </div>
    );
}