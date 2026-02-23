import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTrip } from "./api";

export default function Wizard() {
  const nav = useNavigate();
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onGenerate() {
    setErr("");
    setLoading(true);
    try {
      const data = await generateTrip({
        city,
        startDate,
        endDate,
        travelers: 1,
        interests: ["food", "landmarks", "museums"],
      });

      nav(`/trip/${data.tripId}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl w-[420px] space-y-4 shadow-2xl">
        <h1 className="text-3xl font-bold">TripWise</h1>

        <input
          className="w-full p-3 rounded-xl border"
          placeholder="City (ex: Los Angeles)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 rounded-xl border"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 rounded-xl border"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          className="generate-btn"
          onClick={handleGenerate}
        >
          Generate Itinerary
        </button>

      </div>
    </div>
  );
}
