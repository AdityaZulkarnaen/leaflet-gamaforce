import { useState } from 'react'
import './App.css'
import Navbar from './components/NavBar'
import MapComponents from './components/MapComponents'

function App() {
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  const handleMissionLoad = (missionId) => {
    setSelectedMissionId(missionId);
  };

  return (
    <>
      <Navbar onMissionLoad={handleMissionLoad} />
      <MapComponents selectedMissionId={selectedMissionId} />
    </>
  );
}

export default App