import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import '../App.css'
import manuk from '../assets/manuk.png'
import { FeatureGroup, Circle } from 'react-leaflet'
import { EditControl } from "react-leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import L from 'leaflet'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: manuk,
  shadowUrl: iconShadow,
  iconSize: [81, 121],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponents = () => {
  const position = [-7.764785277662592, 110.38173999968215]
  const [missions, setMissions] = useState([])
  const [drawnItems, setDrawnItems] = useState([])

  // Fetch saved missions when component mounts
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/missions');
        setMissions(response.data);
        console.log('Fetched missions:', response.data);
      } catch (error) {
        console.error('Error fetching missions:', error);
      }
    };

    fetchMissions();
  }, []);

  useEffect(() => {
    console.log('Drawn Items:', drawnItems);
  }, [drawnItems]);

  const handleCreated = async (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polyline') {
      const coordinates = layer.getLatLngs().map(latLng => ({
        lat: latLng.lat,
        lng: latLng.lng
      }));

      const newItem = {
        type: 'polyline',
        coordinates: coordinates,
        id: Date.now()
      };

      try {
        const missionData = {
          nama: `Mission-${newItem.id}`,
          coord: coordinates
        };

        const response = await axios.post('http://localhost:3000/api/missions', missionData);
        console.log('Mission saved:', response.data);

        // Update both drawnItems and missions
        setDrawnItems(prev => [...prev, newItem]);
        setMissions(prev => [...prev, response.data]);
      } catch (error) {
        console.error('Error saving mission:', error);
      }
    }
  };

  const handleDeleted = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      setDrawnItems(prev => 
        prev.filter(item => !layer.getLatLngs().every((latLng, i) => 
          latLng.lat === item.coordinates[i]?.lat && 
          latLng.lng === item.coordinates[i]?.lng
        ))
      );
    });
  };

  // Function to convert stored coordinates to Leaflet format
  const convertCoordinates = (coord) => {
    return coord.map(point => [point.lat, point.lng]);
  };

  return (
    <MapContainer 
      center={position} 
      zoom={16} 
      scrollWheelZoom={false}
      style={{ height: "740px", width: "100%", marginTop: '70px'}}
    >
      <FeatureGroup>
        <EditControl
          position='topright'
          onCreated={handleCreated}
          onDeleted={handleDeleted}
          draw={{
            marker: {
              icon: DefaultIcon
            },
            circle: false,
            rectangle: false,
            polygon: true,
            polyline: true,
            circlemarker: false
          }}
        />
        <Circle center={[51.51, -0.06]} radius={200} />
      </FeatureGroup>

      {/* Render saved missions */}
      {missions.map((mission, index) => (
        <React.Fragment key={mission.mission_id}>
          <Polyline
            positions={convertCoordinates(mission.coord)}
            color="red"
            weight={3}
          >
            <Popup>
              <div>
                <h3>{mission.nama}</h3>
                <p>Mission ID: {mission.mission_id}</p>
                <p>Created: {new Date(mission.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </Polyline>
          
          {/* Add markers for start and end points */}
          {mission.coord.length > 0 && (
            <>
              <Marker 
                position={[mission.coord[0].lat, mission.coord[0].lng]}
                icon={L.divIcon({
                  html: '🟢',
                  className: 'custom-icon',
                  iconSize: [20, 20]
                })}
              >
                <Popup>Start Point - {mission.nama}</Popup>
              </Marker>
              
              <Marker 
                position={[
                  mission.coord[mission.coord.length - 1].lat, 
                  mission.coord[mission.coord.length - 1].lng
                ]}
                icon={L.divIcon({
                  html: '🔴',
                  className: 'custom-icon',
                  iconSize: [20, 20]
                })}
              >
                <Popup>End Point - {mission.nama}</Popup>
              </Marker>
            </>
          )}
        </React.Fragment>
      ))}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={position}>
        <Popup>
          Mabur<br /> To infinity and beyond
        </Popup>
      </Marker>
      
      <LocationMarker />
    </MapContainer>
  )
}

const LocationMarker = () => {
  const [position, setPosition] = useState(null)
  
  const map = useMapEvents({
    click() {
      map.locate()
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

export default MapComponents