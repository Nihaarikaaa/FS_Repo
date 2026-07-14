import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        let response;
        
        // Filter by status
        if (filter !== 'all' && departmentFilter === 'all') {
          response = await api.get(`/status/${filter}`);
        } 
        // Filter by department
        else if (filter === 'all' && departmentFilter !== 'all') {
          response = await api.get(`/department/${departmentFilter}`);
        }
        // No filters
        else if (filter === 'all' && departmentFilter === 'all') {
          response = await api.get('/');
        }
        // This would require a custom endpoint or client-side filtering
        else {
          response = await api.get('/');
          response.data = response.data.filter(
            app => app.status === filter && app.department === departmentFilter
          );
        }
        
        setAppointments(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch appointments.');
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [filter, departmentFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/${id}`);
        setAppointments(appointments.filter((appointment) => appointment._id !== id));
      } catch (error) {
        setError('Failed to delete the appointment.');
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all appointments? This action cannot be undone.')) {
      try {
        await api.delete('/');
        setAppointments([]);
      } catch (error) {
        setError('Failed to delete all appointments.');
        console.error('Error deleting all appointments:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Appointments</h2>
        <div>
          <Link to="/add" className="btn btn-primary me-2">
            <i className="bi bi-plus-circle"></i> New Appointment
          </Link>
          <button 
            className="btn btn-danger" 
            onClick={handleDeleteAll}
            disabled={appointments.length === 0}
          >
            <i className="bi bi-trash"></i> Delete All
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
              <select 
                id="statusFilter" 
                className="form-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="departmentFilter" className="form-label">Filter by Department</label>
              <select 
                id="departmentFilter" 
                className="form-select" 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="alert alert-info text-center">
          No appointments found. Click on "New Appointment" to schedule one.
        </div>
      ) : (
        <div className="list-group">
          {appointments.map((appointment) => (
            <div 
              key={appointment._id} 
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">
                    {appointment.patientName} 
                    <span className={`badge ms-2 ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </h5>
                  <p className="mb-1">
                    <strong>Doctor:</strong> {appointment.doctorName} ({appointment.department})
                  </p>
                  <p className="mb-1">
                    <strong>Date & Time:</strong> {formatDate(appointment.date)} at {appointment.time}
                  </p>
                </div>
                <div>
                  <Link 
                    to={`/details/${appointment._id}`} 
                    className="btn btn-info btn-sm me-2"
                  >
                    View
                  </Link>
                  {appointment.status === 'scheduled' && (
                    <Link 
                      to={`/edit/${appointment._id}`} 
                      className="btn btn-warning btn-sm me-2"
                    >
                      Edit
                    </Link>
                  )}
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDelete(appointment._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;