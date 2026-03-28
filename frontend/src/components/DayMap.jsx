import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

export default function DayMap({ places }) {
    const center = {
        lat: places[0]?.lat || 0,
        lng: places[0]?.lng || 0
    };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "400px" }}
                center={center}
                zoom={13}
            >
                {places.map((p, i) => (
                    <Marker key={i} position={{ lat: p.lat, lng: p.lng }} />
                ))}
            </GoogleMap>
        </LoadScript>
    );
}