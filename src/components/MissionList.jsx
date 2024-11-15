import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../App.css';
import './Missionlist.css'
import Swal from 'sweetalert2';

function MissionList({ missionListClose, onMissionLoad }) {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/missions');
        setMissions(response.data);
      } catch (error) {
        console.error('Error fetching missions:', error);
      }
    };

    fetchMissions();
  }, []);

  const handleEdit = async (id, currentName) => {
    try {
      const { value: newName } = await Swal.fire({
        title: 'Edit Mission Name',
        input: 'text',
        inputLabel: 'New Mission Name',
        inputValue: currentName,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter a mission name!';
          }
        }
      });

      if (newName) {
        const response = await axios.put(`http://localhost:3000/api/missions/${id}`, { 
          nama: newName 
        });

        if (response.status === 200) {
          setMissions((prevMissions) =>
            prevMissions.map((mission) =>
              mission.mission_id === id ? { ...mission, nama: newName } : mission
            )
          );
          
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Mission name has been updated.',
            showConfirmButton: false,
            timer: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error updating mission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update mission'
      });
    }
  };

  const handleDelete = async (id) => {
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
        const response = await axios.delete(`http://localhost:3000/api/missions/${id}`);
        
        if (response.status === 200) {
          setMissions((prevMissions) => 
            prevMissions.filter((mission) => mission.mission_id !== id)
          );
          
          Swal.fire(
            'Deleted!',
            'Your mission has been deleted.',
            'success'
          );
        }
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

  const handleLoadMission = (missionId) => {
    onMissionLoad(missionId);
    missionListClose(); 
  };

  return (
    <div className="listcomponent">
      <div className="listcontainer">
        <table>
          <thead>
            <tr>
              <th>Mission ID</th>
              <th>Nama</th>
              <th>Action</th>
              <th>Load</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.mission_id}>
                <td>{mission.mission_id}</td>
                <td>{mission.nama}</td>
                <td>
                  <button onClick={() => handleEdit(mission.mission_id, mission.nama)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(mission.mission_id)}>
                    Delete
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleLoadMission(mission.mission_id)}
                    className="load-btn"
                  >
                    Load
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-btn" onClick={missionListClose}>Close</button>
      </div>
    </div>
  );
}

export default MissionList;