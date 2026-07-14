import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    upcomingAppointments: [],
    departmentCounts: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all appointments
        const response = await api.get('/');
        const appointments = response.data;
        
        // Calculate stats
        const scheduledAppointments = appointments.filter(app => app.status === 'scheduled');
        const completedAppointments = appointments.filter(app => app.status === 'completed');
        const cancelledAppointments = appointments.filter(app => app.status === 'cancelled');
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get upcoming appointments (scheduled for today or future)
        const upcomingAppointments = scheduledAppointments
          .filter(app => new Date(app.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5); // Get only the next 5 upcoming appointments
        
        // Count appointments by department
        const departmentCounts = {};
        appointments.forEach(app => {
          if (app.department) {
            departmentCounts[app.department] = (departmentCounts[app.department] || 0) + 1;
          }
        });
        
        setStats({
          totalAppointments: appointments.length,
          scheduledAppointments: scheduledAppointments.length,
          completedAppointments: completedAppointments.length,
          cancelledAppointments: cancelledAppointments.length,
          upcomingAppointments,
          departmentCounts
        });
        
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">Healthcare Appointment Dashboard</h2>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white mb-3">
            <div className="card-body text-center">
              <h5 className="card-title">Total</h5>
              <h2 className="card-text">{stats.totalAppointments}</h2>
              <p>Appointments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white mb-3">
            <div className="card-body text-center">
              <h5 className="card-title">Scheduled</h5>
              <h2 className="card-text">{stats.scheduledAppointments}</h2>
              <p>Appointments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white mb-3">
            <div className="card-body text-center">
              <h5 className="card-title">Completed</h5>
              <h2 className="card-text">{stats.completedAppointments}</h2>
              <p>Appointments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white mb-3">
            <div className="card-body text-center">
              <h5 className="card-title">Cancelled</h5>
              <h2 className="card-text">{stats.cancelledAppointments}</h2>
              <p>Appointments</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-7">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upcoming Appointments</h5>
            </div>
            <div className="card-body">
              {stats.upcomingAppointments.length === 0 ? (
                <p className="text-center text-muted">No upcoming appointments</p>
              ) : (
                <div className="list-group">
                  {stats.upcomingAppointments.map(appointment => (
                    <Link 
                      to={`/details/${appointment._id}`} 
                      key={appointment._id}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{appointment.patientName}</h6>
                        <small>{appointment.time}</small>
                      </div>
                      <p className="mb-1">
                        <strong>Doctor:</strong> {appointment.doctorName} ({appointment.department})
                      </p>
                      <small>{formatDate(appointment.date)}</small>
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="text-center mt-3">
                <Link to="/appointments" className="btn btn-primary">
                  View All Appointments
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Appointments by Department</h5>
            </div>
            <div className="card-body">
              {Object.keys(stats.departmentCounts).length === 0 ? (
                <p className="text-center text-muted">No department data available</p>
              ) : (
                <div className="list-group">
                  {Object.entries(stats.departmentCounts)
                    .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
                    .map(([department, count]) => (
                      <div key={department} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{department}</span>
                          <span className="badge bg-primary rounded-pill">{count}</span>
                        </div>
                        <div className="progress mt-2" style={{ height: '10px' }}>
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${(count / stats.totalAppointments) * 100}%` }}
                            aria-valuenow={count}
                            aria-valuemin="0" 
                            aria-valuemax={stats.totalAppointments}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <Link to="/add" className="btn btn-success">
                  <i className="bi bi-plus-circle me-2"></i>
                  New Appointment
                </Link>
                <Link to="/appointments" className="btn btn-info">
                  <i className="bi bi-calendar-check me-2"></i>
                  Manage Appointments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;