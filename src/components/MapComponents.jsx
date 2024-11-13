import React, { useEffect, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { TileLayer } from 'react-leaflet'
import { Marker } from 'react-leaflet'
import { Popup } from 'react-leaflet'
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
  const [missions, setMission] = useState([])
  const [drawnItems, setDrawnItems] = useState([])

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
        // Menyiapkan data sesuai format yang dibutuhkan backend
        const missionData = {
          nama: `Mission-${newItem.id}`,
          coord: coordinates
        };

        // Mengirim data ke backend
        const response = await axios.post('http://localhost:3000/api/missions', missionData);
        console.log('Mission saved:', response.data);

        // Update state lokal
        setDrawnItems(prev => [...prev, newItem]);
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