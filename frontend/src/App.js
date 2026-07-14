import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppointmentList from './components/AppointmentList';
import AddAppointment from './components/AddAppointment';
import EditAppointment from './components/EditAppointment';
import AppointmentDetails from './components/AppointmentDetails';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router basename={`/${process.env.REACT_APP_HASH}/`}>
      <div className="app-container">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/add" element={<AddAppointment />} />
            <Route path="/edit/:id" element={<EditAppointment />} />
            <Route path="/details/:id" element={<AppointmentDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;