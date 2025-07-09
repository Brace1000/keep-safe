
import React, { useState, useEffect } from 'react';
import './App.css';


const StatusIcon = ({ status }) => {
  const icons = {
    safe: '✅',
    warning: '⚠️',
    danger: '🛑',
    loading: '⏳'
  };
  return <div className={`icon-wrapper ${status}`}>{icons[status]}</div>;
};

function App() {
  const [location, setLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState({ status: 'loading', name: 'Initializing...' });
  const [error, setError] = useState(null);

  // Effect to get the user's location in real-time
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // Watch for position changes
    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        setError(null); // Clear previous errors
      },
      (err) => {
        setError(`Location Error: ${err.message}`);
      },
      { // Options for more accuracy
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Cleanup function to stop watching when the component unmounts
    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  // Effect to check the location with our backend whenever the location changes
  useEffect(() => {
    if (!location) return;

    const checkLocationSafety = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/check-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(location),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setSafetyStatus(data);
      } catch (err) {
        console.error("Failed to check location:", err);
       
      }
    };

    checkLocationSafety();
  }, [location]); 

  // --- Render Logic ---
  const renderContent = () => {
    if (error) {
      return (
        <>
          <StatusIcon status="danger" />
          <h1 className="status-text">Access Denied</h1>
          <p className="zone-name">{error}</p>
        </>
      );
    }

    if (safetyStatus.status === 'loading') {
      return (
        <>
          <StatusIcon status="loading" />
          <h1 className="status-text">Getting Location...</h1>
          <p className="zone-name">Please grant location permissions.</p>
        </>
      );
    }
    
    return (
      <>
        <StatusIcon status={safetyStatus.status} />
        <h1 className="status-text">
          {safetyStatus.status.charAt(0).toUpperCase() + safetyStatus.status.slice(1)}
        </h1>
        <p className="zone-name">{safetyStatus.name}</p>
      </>
    );
  };


  return (
    <div className={`app-container ${safetyStatus.status}`}>
      {renderContent()}

      {location && (
        <div className="location-info">
          Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
        </div>
      )}
    </div>
  );
}

export default App;