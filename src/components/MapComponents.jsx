import React, { useEffect, useState } from 'react'
import { MapContainer } from 'react-leaflet'
import { TileLayer } from 'react-leaflet'
import { Marker } from 'react-leaflet'
import { Popup } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../App.css'
import manuk from '../assets/manuk.png'
import {FeatureGroup, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"

// Import icon untuk marker
import L, { marker } from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
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
  
  useEffect(()=>{
    fetch("http://localhost:1000/api/missions")
    .then((response) => response.json())
    .then((data) => {
      setMission(data);
      console.log(data);
    }

    ).catch((error)=> console.error('Error fetching missions:', error));
  }, []);

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
          draw={{
            marker: {
              icon: DefaultIcon  // Use the custom icon for drawn markers
            },
            circle: false, // Customize tools as needed
            rectangle: false,
            polygon: true
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

// Location marker component
const LocationMarker = () => {
  const [position, setPosition] = useState(null)
  
  
  const map = useMapEvents({drawControl:true},{
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