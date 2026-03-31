// const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// async function getTravelTime(origin, destination) {
//     if (!origin || !destination) return null;

//     const url =
//         `https://maps.googleapis.com/maps/api/distancematrix/json` +
//         `?origins=${origin.lat},${origin.lng}` +
//         `&destinations=${destination.lat},${destination.lng}` +
//         `&mode=walking` +
//         `&key=${API_KEY}`;

//     const res = await fetch(url);
//     const data = await res.json();

//     if (
//         !data.rows ||
//         !data.rows[0] ||
//         !data.rows[0].elements ||
//         !data.rows[0].elements[0]
//     ) {
//         return null;
//     }

//     const element = data.rows[0].elements[0];

//     return {
//         distance: element.distance?.text || null,
//         duration: element.duration?.text || null,
//     };
// }

// module.exports = { getTravelTime };
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getTravelTime(origin, destination) {
    if (!origin || !destination) return null;

    const base =
        "https://maps.googleapis.com/maps/api/distancematrix/json" +
        `?origins=${origin.lat},${origin.lng}` +
        `&destinations=${destination.lat},${destination.lng}` +
        `&key=${API_KEY}`;

    // 🚶 Walking
    const walkRes = await fetch(base + "&mode=walking");
    const walkData = await walkRes.json();

    // 🚗 Driving
    const driveRes = await fetch(base + "&mode=driving");
    const driveData = await driveRes.json();

    const walking = walkData.rows?.[0]?.elements?.[0];
    const driving = driveData.rows?.[0]?.elements?.[0];

    return {
        walking: walking?.duration?.text || null,
        driving: driving?.duration?.text || null,
        distance: walking?.distance?.text || null,
    };
}

module.exports = { getTravelTime };