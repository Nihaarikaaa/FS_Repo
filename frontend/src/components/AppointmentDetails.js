import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/${id}`);
        setAppointment(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

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

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.put(`/${id}`, {
        ...appointment,
        status: newStatus
      });
      setAppointment(response.data);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/${id}`);
        navigate('/appointments');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment');
      }
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="alert alert-warning" role="alert">
        Appointment not found
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Appointment Details</h3>
          <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Patient Information</h5>
              <p><strong>Name:</strong> {appointment.patientName}</p>
              <p><strong>Email:</strong> {appointment.patientEmail}</p>
            </div>
            <div className="col-md-6">
              <h5>Appointment Information</h5>
              <p><strong>Doctor:</strong> {appointment.doctorName}</p>
              <p><strong>Department:</strong> {appointment.department}</p>
              <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
              <p><strong>Time:</strong> {appointment.time}</p>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-4">
              <h5>Notes</h5>
              <p>{appointment.notes}</p>
            </div>
          )}

          <div className="mb-4">
            <h5>Manage Appointment</h5>
            <div className="btn-group" role="group">
              {appointment.status === 'scheduled' && (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Mark as Completed
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {appointment.status === 'cancelled' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusChange('scheduled')}
                >
                  Reschedule Appointment
                </button>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <Link to="/appointments" className="btn btn-secondary">
              Back to List
            </Link>
            <div>
              {appointment.status === 'scheduled' && (
                <Link to={`/edit/${appointment._id}`} className="btn btn-warning me-2">
                  Edit Appointment
                </Link>
              )}
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;