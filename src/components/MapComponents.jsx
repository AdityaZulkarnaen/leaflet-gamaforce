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
import Swal from 'sweetalert2'

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
  const [editingMission, setEditingMission] = useState(null)

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/missions');
      setMissions(response.data);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

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

          setMissions(prev => [...prev, response.data]);
          setDrawnItems(prev => [...prev, { type: 'polyline', coordinates, id: response.data.mission_id }]);
        } catch (error) {
          console.error('Error saving mission:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save mission'
          });
        }
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

  const handleDeleteMission = async (missionId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3000/api/missions/${missionId}`);
        setMissions(prev => prev.filter(mission => mission.mission_id !== missionId));
        
        Swal.fire(
          'Deleted!',
          'Your mission has been deleted.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting mission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete mission'
      });
    }
  };

  const handleEditMission = async (mission) => {
    const { value: newName } = await Swal.fire({
      title: 'Edit Mission Name',
      input: 'text',
      inputLabel: 'New Mission Name',
      inputValue: mission.nama,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a mission name!';
        }
      }
    });

    if (newName) {
      try {
        const response = await axios.put(`http://localhost:3000/api/missions/${mission.mission_id}`, {
          nama: newName
        });

        setMissions(prev => prev.map(m => 
          m.mission_id === mission.mission_id ? { ...m, nama: newName } : m
        ));

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Mission name has been updated.',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        console.error('Error updating mission:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update mission'
        });
      }
    }
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
      </FeatureGroup>

      {missions.map((mission) => (
        <React.Fragment key={mission.mission_id}>
          <Polyline
            positions={convertCoordinates(mission.coord)}
            color="red"
            weight={3}
          >
            <Popup>
              <div className="mission-popup">
                <h3>{mission.nama}</h3>
                <p>Mission ID: {mission.mission_id}</p>
                <p>Created: {new Date(mission.created_at).toLocaleString()}</p>
                <div className="popup-buttons">
                  <button 
                    onClick={() => handleEditMission(mission)}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      marginRight: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteMission(mission.mission_id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Popup>
          </Polyline>
          
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
            position={[mission.coord[mission.coord.length - 1].lat, mission.coord[mission.coord.length - 1].lng]}
            icon={L.divIcon({
              html: '🔴',
              className: 'custom-icon',
              iconSize: [20, 20]
            })}
          >
            <Popup>End Point - {mission.nama}</Popup>
          </Marker>
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
