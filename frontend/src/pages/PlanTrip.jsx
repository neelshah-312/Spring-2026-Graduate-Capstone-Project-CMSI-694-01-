
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./planTripHero.css";

const POPULAR_DESTINATIONS = [
    "Ahmedabad",
    "Dubai",
    "New York",
    "London",
    "Barcelona",
];

export default function PlanTrip() {
    const [destination, setDestination] = useState("");
    const navigate = useNavigate();

    function goNext() {
        const val = destination.trim();
        if (!val) return;

        navigate("/dates", {
            state: { destination: val }
        });
    }

    function handleCityClick(city) {
        setDestination(city);

        navigate("/dates", {
            state: { destination: city }
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

            {/* hero content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-[70vh] text-center px-6">

                <h1 className="text-5xl font-bold text-white">
                    Discover your next trip
                </h1>

                <p className="text-white/80 mt-3">
                    AI powered travel planning
                </p>

                {/* search bar */}
                <div className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3 w-full max-w-2xl mt-6">

                    <input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where do you want to travel?"
                        className="flex-1 bg-transparent outline-none text-gray-700"
                    />

                    <button
                        onClick={goNext}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6 py-2"
                    >
                        Go
                    </button>

                </div>

                {/* popular destinations */}
                <div className="flex flex-wrap justify-center gap-3 mt-6">

                    {POPULAR_DESTINATIONS.map((city) => (
                        <button
                            key={city}
                            onClick={() => handleCityClick(city)}
                            className="px-4 py-2 bg-white/80 hover:bg-white rounded-full text-sm shadow"
                        >
                            {city}
                        </button>
                    ))}

                </div>

            </div>
        </div>
    );
}