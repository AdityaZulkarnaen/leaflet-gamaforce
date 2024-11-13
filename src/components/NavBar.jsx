import React from "react";
import logoG from '../assets/logoG.png'
import '../App.css'
import arrow from '../assets/arrow.png'
import DropList from "./DropList"

function Navbar() {
    <button onClick={()=> DropList}></button>
    
    return(
    <>

    <div className="navbar">
        <div className="navbarLogo" ><img src={logoG} alt="logoG"></img></div>
        <div className="Menu">
            <div className="home"><a target='_blank' href="http://gamaforce.wg.ugm.ac.id/#home">HOME</a></div>
            <div className="about">ABOUT</div>
            <div className="contact">CONTACT US</div>
            <div className="list"><a >MISSION LIST</a></div>
            <img src={arrow} alt="arrow"></img>
        </div>
    </div>
    </>
);
}

export default Navbar