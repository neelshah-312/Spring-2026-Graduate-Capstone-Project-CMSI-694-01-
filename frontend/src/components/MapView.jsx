import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
    width: "100%",
    height: "400px",
};

export default function MapView({ places }) {
    const [coords, setCoords] = useState([]);

    useEffect(() => {
        async function geocode() {
            const results = await Promise.all(
                places.map(async (p) => {
                    try {
                        const res = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                                p.name + " " + (p.address || "")
                            )}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
                        );

                        const data = await res.json();

                        if (data.results[0]) {
                            return {
                                lat: data.results[0].geometry.location.lat,
                                lng: data.results[0].geometry.location.lng,
                            };
                        }
                    } catch (err) {
                        console.error(err);
                    }

                    return null;
                })
            );

            setCoords(results.filter(Boolean));
        }

        if (places.length) geocode();
    }, [places]);

    const center = coords[0] || { lat: 34.0522, lng: -118.2437 };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                {coords.map((c, i) => (
                    <Marker key={i} position={c} />
                ))}
            </GoogleMap>
        </LoadScript>
    );
}