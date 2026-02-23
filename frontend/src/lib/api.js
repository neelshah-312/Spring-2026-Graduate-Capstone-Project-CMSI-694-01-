const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export async function generateTrip(payload) {
  const res = await fetch(`${BASE}/api/itinerary/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to generate");
  return res.json();
}

export async function getTrip(id) {
  const res = await fetch(`${BASE}/api/trips/${id}`);
  if (!res.ok) throw new Error("Trip not found");
  return res.json();
}

export async function getItinerary(id) {
  const res = await fetch(`${BASE}/api/trips/${id}/itinerary`);
  if (!res.ok) throw new Error("Itinerary not found");
  return res.json();
}
