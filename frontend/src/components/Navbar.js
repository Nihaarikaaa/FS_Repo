import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-hospital me-2"></i>
          HealthCare Scheduler
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"} 
                to="/"
                end
              >
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"} 
                to="/appointments"
              >
                <i className="bi bi-calendar-check me-1"></i> Appointments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"} 
                to="/add"
              >
                <i className="bi bi-plus-circle me-1"></i> New Appointment
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;