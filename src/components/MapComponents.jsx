import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useMapEvents } from 'react-leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import '../App.css'
import manuk from '../assets/manuk.png'
import { FeatureGroup } from 'react-leaflet'
import { EditControl } from "react-leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import L from 'leaflet'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import Swal from 'sweetalert2'

let DefaultIcon = L.icon({
  iconUrl: manuk,
  shadowUrl: iconShadow,
  iconSize: [81, 121],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponents = ({ selectedMissionId }) => {
  const position = [-7.764785277662592, 110.38173999968215]
  const [selectedMission, setSelectedMission] = useState(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    const fetchSelectedMission = async () => {
      if (selectedMissionId) {
        try {
          const response = await axios.get(`http://localhost:3000/api/missions/${selectedMissionId}`);
          setSelectedMission(response.data);
          
          if (response.data.coord && response.data.coord.length > 0 && map) {
            const firstCoord = response.data.coord[0];
            map.setView([firstCoord.lat, firstCoord.lng], 16);
          }
        } catch (error) {
          console.error('Error fetching selected mission:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load mission data'
          });
        }
      } else {
        setSelectedMission(null); 
      }
    };

    fetchSelectedMission();
  }, [selectedMissionId, map]);

  const handleCreated = async (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polyline') {
      const coordinates = layer.getLatLngs().map(latLng => ({
        lat: latLng.lat,
        lng: latLng.lng
      }));

      const { value: missionName } = await Swal.fire({
        title: 'Enter Mission Name',
        input: 'text',
        inputLabel: 'Mission Name',
        inputPlaceholder: 'Enter your mission name',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter a mission name!'
          }
        }
      });

      if (missionName) {
        try {
          const missionData = {
            nama: missionName,
            coord: coordinates
          };

          const response = await axios.post('http://localhost:3000/api/missions', missionData);
          
          Swal.fire({
            icon: 'success',
            title: 'Mission Saved!',
            text: `Mission "${missionName}" has been saved successfully`,
            showConfirmButton: false,
            timer: 2000
          });
          
          setSelectedMission(response.data);
        } catch (error) {
          console.error('Error saving mission:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save mission'
          });
        }
      } else {
        layer.remove();
      }
    }
  };

  const handleDeleted = (e) => {
    const layers = e.layers;
    layers.eachLayer(() => {
      setSelectedMission(null);
    });
  };

  const convertCoordinates = (coord) => {
    return coord.map(point => [point.lat, point.lng]);
  };

  return (
    <MapContainer 
      center={position} 
      zoom={16} 
      scrollWheelZoom={false}
      style={{ height: "740px", width: "100%", marginTop: '70px'}}
      ref={setMap}
    >
      <FeatureGroup>
        <EditControl
          position='topright'
          onCreated={handleCreated}
          onDeleted={handleDeleted}
          draw={{
            marker: false,
            circle: false,
            rectangle: false,
            polygon: false,
            polyline: true,
            circlemarker: false
          }}
        />
      </FeatureGroup>

      {selectedMission && selectedMission.coord && (
        <Polyline
          positions={convertCoordinates(selectedMission.coord)}
          color="blue"
          weight={4}
          opacity={0.8}
        >
          <Popup>
            <div className="mission-popup">
              <h3>{selectedMission.nama}</h3>
              <p>Mission ID: {selectedMission.mission_id}</p>
            </div>
          </Popup>
        </Polyline>
      )}

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