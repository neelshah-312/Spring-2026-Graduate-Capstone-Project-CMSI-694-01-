// import { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./planTripHero.css";

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

// function daysBetween(startISO, endISO) {
//     if (!startISO || !endISO) return 0;
//     const s = new Date(startISO);
//     const e = new Date(endISO);
//     if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
//     const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
// }

// export default function TripDates() {
//     const location = useLocation();
//     const navigate = useNavigate();

//     const destination = location.state?.destination || "";

//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [err, setErr] = useState("");

//     // If user refreshes /dates, send them back (since state is lost)
//     useEffect(() => {
//         if (!destination) navigate("/plan", { replace: true });
//     }, [destination, navigate]);

//     const days = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);

//     async function findPlaces() {
//         setErr("");

//         if (!startDate || !endDate) {
//             setErr("Please select start and end date.");
//             return;
//         }
//         if (days <= 0) {
//             setErr("End date must be after start date.");
//             return;
//         }

//         try {
//             setLoading(true);

//             // 👉 Change this endpoint to YOUR backend route if different
//             const res = await fetch(`${BACKEND_URL}/api/trips/generate`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     city: destination,
//                     days, // auto calculated
//                     // include your other fields if you use them:
//                     // budget: "medium",
//                     // interests: ["food"],
//                     // style: "balanced",
//                 }),
//             });

//             const data = await res.json();
//             if (!res.ok) throw new Error(data?.error || "Failed to generate trip.");

//             // Expecting backend returns { tripId: "..." } (adjust if yours differs)
//             const tripId = data.tripId || data.id;
//             if (!tripId) throw new Error("Backend did not return tripId.");

//             navigate(`/trip/${tripId}`);
//         } catch (e) {
//             setErr(e.message || "Something went wrong.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="heroWrap">
//             <div className="heroBg" />

//             <div className="heroFrame">
//                 {/* keep same header/nav exactly as PlanTrip */}

//                 <main className="heroMain">
//                     <h1 className="heroTitle">
//                         Choose your travel dates
//                     </h1>

//                     <p className="heroSub">
//                         Destination: <b>{destination}</b> {days > 0 ? `• ${days} day(s)` : ""}
//                     </p>

//                     {/* White bar: start + end + Find Places */}
//                     <div className="searchPill">
//                         <div className="pillField">
//                             <div className="pillLabel">Start Date</div>
//                             <input
//                                 type="date"
//                                 value={startDate}
//                                 onChange={(e) => setStartDate(e.target.value)}
//                             />
//                         </div>

//                         <div className="pillDivider" />

//                         <div className="pillField">
//                             <div className="pillLabel">End Date</div>
//                             <input
//                                 type="date"
//                                 value={endDate}
//                                 onChange={(e) => setEndDate(e.target.value)}
//                             />
//                         </div>

//                         <button className="pillButton" onClick={findPlaces} disabled={loading}>
//                             {loading ? "Generating..." : "Find Places"}
//                         </button>
//                     </div>

//                     {err ? (
//                         <div style={{ marginTop: 10, fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
//                             {err}
//                         </div>
//                     ) : null}
//                 </main>
//             </div>
//         </div>
//     );
// }
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DateRangePill from "../components/DateRangePill";
import "./planTripHero.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

function daysBetween(start, end) {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// Date -> "YYYY-MM-DD" (matches what your DB is storing)
function toISODate(d) {
    if (!d) return null;
    // Use local date (not UTC shift)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function TripDates() {
    const location = useLocation();
    const navigate = useNavigate();
    const destination = location.state?.destination || "";

    const [start, setStart] = useState(null); // Date
    const [end, setEnd] = useState(null);     // Date
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!destination) navigate("/plan", { replace: true });
    }, [destination, navigate]);

    const days = useMemo(() => daysBetween(start, end), [start, end]);

    async function findPlaces() {
        setErr("");

        if (!start || !end || days <= 0) {
            setErr("Please select valid start and end dates.");
            return;
        }

        const startDate = toISODate(start);
        const endDate = toISODate(end);

        // ✅ Go to interests page (Step 3)
        navigate("/interests", {
            state: {
                destination,
                startDate,
                endDate,
                days,
            },
        });
        // try {
        //     setLoading(true);

        //     const startDate = toISODate(start);
        //     const endDate = toISODate(end);

        //     const res = await fetch(`${BACKEND_URL}/api/trips/generate`, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //             city: destination,
        //             days,
        //             startDate,  // ✅ save to DB
        //             endDate,    // ✅ save to DB
        //         }),
        //     });

        //     const data = await res.json();
        //     if (!res.ok) throw new Error(data?.error || "Failed to generate trip.");

        //     const tripId = data.tripId || data.id;
        //     if (!tripId) throw new Error("Backend did not return tripId.");

        //     // ✅ Pass itinerary in state so TripResults renders immediately (no empty flash)
        //     navigate(`/trip/${tripId}`, {
        //         state: {
        //             itinerary: data.itinerary || [],
        //             city: destination,
        //             startDate,
        //             endDate,
        //             days,
        //         },
        //     });
        // } catch (e) {
        //     setErr(e.message || "Something went wrong.");
        // } finally {
        //     setLoading(false);
        // }
    }

    return (
        <div className="heroWrap">
            <div className="heroBg" />

            <div className="heroFrame">
                <main className="heroMain">
                    <h1 className="heroTitle heroTitleWhere titleUp">Choose your travel dates</h1>

                    <div className="searchPill searchPillDates">
                        <DateRangePill
                            start={start}
                            end={end}
                            onChange={(s, e) => {
                                setStart(s || null);
                                setEnd(e || null);
                            }}
                        />

                        <div className="pillDivider" />

                        <div className="pillField daysField">
                            <div className="pillLabel">Days</div>
                            <div className="daysValue">{days > 0 ? `${days} days` : "--"}</div>
                        </div>

                        <button className="pillButton" onClick={findPlaces} disabled={loading}>
                            {loading ? "Generating..." : "Find Places"}
                        </button>
                    </div>

                    {err ? <div className="heroError">{err}</div> : null}
                </main>
            </div>
        </div>
    );
}
