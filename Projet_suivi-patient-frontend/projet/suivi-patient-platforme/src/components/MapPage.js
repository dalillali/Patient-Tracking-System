import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SideBare from "./SideBare";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./css/Aceuill.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41], 
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.latitude, location.longitude], 16);
    }
  }, [location, map]);
  return null;
};

const MapPage = () => {
  const { patientId } = useParams();
  const patientFirstName = localStorage.getItem("patientFirstName");
  const patientLastName = localStorage.getItem("patientLastName");

  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    try {
      const response = await fetch(`http://localhost:5001/last_location?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }
      const data = await response.json();
      console.log("Fetched location data:", data);
      if (data && data.latitude && data.longitude) {
        setLocation(data);
        setPath((prevPath) => [...prevPath, [data.latitude, data.longitude]]);
      } else {
        throw new Error("Invalid location data received");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const intervalId = setInterval(fetchLocation, 50000); 
    return () => clearInterval(intervalId);
  }, [patientId]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <div style={{ width: "250px", flexShrink: 0 }}>
        <SideBare />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        <center>
          <h1>Patient Location</h1>
          <p>
            Displaying location for patient: <strong>{patientFirstName} {patientLastName}</strong>
          </p>

          <div style={{ marginTop: "20px", marginBottom: "20px",marginLeft:'2%' }}>
            {loading ? (
              <p>Loading map...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : location ? (
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={16}
                style={{
                  height: "400px",
                  width: "100%",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <RecenterMap location={location} />

                
                <Polyline positions={path} color="blue" weight={4} />

                
                <Marker 
                  position={[location.latitude, location.longitude]} 
                  icon={DefaultIcon}
                >
                  <Popup>
                    <strong>Last Known Location</strong><br />
                    Latitude: {location.latitude}, Longitude: {location.longitude}<br />
                    Timestamp: {location.timestamp || "N/A"}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>No location data available for this patient.</p>
            )}
          </div>
        </center>
      </div>
    </div>
  );
};

export default MapPage;
