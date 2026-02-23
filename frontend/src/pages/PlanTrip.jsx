import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./planTripHero.css";

const POPULAR_DESTINATIONS = [
    "Ahmedabad",
    "Tokyo",
    "New York",
    "London",
    "Los Angeles",
    "Barcelona",
    "Mumbai",
    "Sydney",
    "Dubai",
    "Singapore",
    "Delhi",
    "Toronto"
];

export default function PlanTrip() {
    const [destination, setDestination] = useState("");
    const navigate = useNavigate();
    const handleCityClick = (selectedCity) => {
        const val = selectedCity.trim();
        setDestination(selectedCity);
        navigate("/dates", { state: { destination: val } });
    };
    // const [date, setDate] = useState("Thu, 11 Aug");
    // const [people, setPeople] = useState("2 people");

    function goNext() {
        const val = destination.trim();
        if (!val) return;
        navigate("/dates", { state: { destination: val } });
    }

    return (

        <div className="heroWrap">
            <div className="heroBg" />

            <div className="heroFrame">
                {/* keep your header/nav exactly as you have */}

                <main className="heroMain">
                    {/* ✅ Tripadvisor-style title */}
                    <h1 className="heroTitle heroTitleWhere">Discover best place to
                        enjoy your next Vacation</h1>
                    <h1 className="heroTitle heroTitleWhere">.    </h1>

                    {/* ✅ Single search pill (no category tabs) */}
                    <div className="searchPill searchPillWhere">
                        <div className="pillField pillFieldCenter">
                            <div className="pillLabel">Destination</div>
                            <input
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Paris, Los Angeles, NewYork."
                                className="centerInput"
                                onKeyDown={(e) => e.key === "Enter" && goNext()}
                            />
                        </div>
                        <button className="pillButton" onClick={goNext}>
                            Go Next!!
                        </button>
                    </div>
                    {/* ✅ Popular Destinations */}
                    <div className="popular-section">
                        <div className="popular-title">Popular destinations</div>

                        <div className="popular-grid">
                            {POPULAR_DESTINATIONS.map((city) => (
                                <button
                                    key={city}
                                    type="button"
                                    className="city-chip"
                                    onClick={() => handleCityClick(city)}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>

    );
}