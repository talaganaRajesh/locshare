import React, { useState, useEffect,useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import './MapComponent.css';


// Fix for default marker icons
let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapComponent() {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const inputRef = useRef(null); // Added inputRef definition

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => null
    );
  }, []);

  useEffect(() => {
    axios.get('https://locshare-server.vercel.app/')
      .then(response => setLocations(response.data))
      .catch(error => console.error("Error fetching locations: ", error));
  }, []);

  const handleShareLocation = (msg) => {
    if (userLocation) {
      if (!isSharing) {
        axios.post('https://locshare-server.vercel.app/', {
          userId: "user123",
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          message: msg || "User's Location",
        })
        .then(response => {
          console.log("Location shared!", response);
          setIsSharing(true);
        })
        .catch(error => console.error("Error sharing location: ", error));
      } else {
        axios.delete('https://locshare-server.vercel.app/', {
          data: { userId: "user123" }
        })
        .then(response => {
          console.log("Stopped sharing location and deleted data.", response);
          setIsSharing(false);
        })
        .catch(error => console.error("Error stopping sharing location: ", error));
      }
    }
  };

  return (
    <>

    <div className="flex justify-center">
      <div className=" min-w-full px-20 pb-32 min-h-svh">
        <MapContainer 
          center={userLocation || { lat: 20.5937, lng: 78.9629 }} 
          zoom={5}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here!</Popup>
            </Marker>
          )}
          
          {locations.map((location, index) => (
            <Marker key={index} position={{ lat: location.latitude, lng: location.longitude }}>
              <Popup>{location.message || "Friend's Location"}</Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className='flex flex-row justify-center'>
          <input type="text" ref={inputRef} placeholder='Enter a message' className='bg-green-200 border-2 border-gray-500 pr-20 pl-5 rounded-lg' />
          <button onClick={() => handleShareLocation(inputRef.current.value)} className="share-location-btn">
            {isSharing ? "Stop Sharing" : "Share Location"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default MapComponent;