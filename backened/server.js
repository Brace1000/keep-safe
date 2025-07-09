
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allows our React app to make requests to this server
app.use(express.json());



const unsafeZones = [
    {
        name: 'High-Crime Area Downtown',
        type: 'danger', // 'danger' for personal safety
        lat: 34.0522, // Example: Los Angeles City Hall
        lon: -118.2437,
        radius: 500 // Radius in meters
    },
    {
        name: 'Accident Black Spot: Hwy 101 Intersection',
        type: 'warning', // 'warning' for road safety
        lat: 34.0600,
        lon: -118.2500,
        radius: 300 // Radius in meters
    },
    {
        name: 'Fog Prone Bridge',
        type: 'warning',
        lat: 37.8199, // Example: Golden Gate Bridge
        lon: -122.4783,
        radius: 1000
    }
];

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}


// --- API Endpoint ---
app.post('/api/check-location', (req, res) => {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    console.log(`Checking location: Lat ${lat}, Lon ${lon}`);

    for (const zone of unsafeZones) {
        const distance = getDistance(lat, lon, zone.lat, zone.lon);
        if (distance <= zone.radius) {
            console.log(`User is inside zone: ${zone.name}`);
            return res.json({
                status: zone.type,
                name: zone.name,
            });
        }
    }

    // If no zone was found
    console.log('User is in a safe area.');
    res.json({ status: 'safe', name: 'Safe Area' });
});

app.listen(PORT, () => {
    console.log(`Keep Safe backend server running on http://localhost:${PORT}`);
}); 