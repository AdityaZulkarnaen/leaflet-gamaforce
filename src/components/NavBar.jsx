import React from "react";
import {useState} from "react"
import logoG from '../assets/logoG.png'
import '../App.css'
import arrow from '../assets/arrow.png'
import MissionList from "./MissionList";

function Navbar({ onMissionLoad }) {
    const [showMissionList, setShowMissionList] = useState(false);

    const missionListClick = () => {
        setShowMissionList(true);
    }
    
    const missionListClose = () => {
        setShowMissionList(false);
    }
    
    return(
        <>
        <div className="navbar">
            <div className="navbarLogo" ><img src={logoG} alt="logoG"></img></div>
            <div className="Menu">
                <div className="home"><a target='_blank' href="http://gamaforce.wg.ugm.ac.id/#home">HOME</a></div>
                <div className="about">ABOUT</div>
                <div className="contact">CONTACT US</div>
                <div className="list"><a className="missionlist" onClick={missionListClick}>MISSION LIST</a></div>
            </div>
        </div>
        {showMissionList && 
            <MissionList 
                missionListClose={missionListClose}
                onMissionLoad={onMissionLoad}
            />
        }
        </>
    );
}

export default Navbar;