const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export async function generateTrip(payload) {
    const res = await fetch(`${BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error((data && JSON.stringify(data)) || "Generate failed");
    }

    return data; // { tripId }
}

export async function getItinerary(tripId) {
    const res = await fetch(`${BASE}/api/itinerary/${tripId}`);
    const data = await res.json().catch(() => null);

    if (!res.ok) throw new Error("Itinerary load failed");
    return data; // array
}
