import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    notes: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/${id}`);
        const appointment = response.data;
        
        // Format date for the input field (YYYY-MM-DD)
        const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
        
        setFormData({
          patientName: appointment.patientName,
          patientEmail: appointment.patientEmail,
          doctorName: appointment.doctorName,
          department: appointment.department,
          date: formattedDate,
          time: appointment.time,
          notes: appointment.notes || '',
          status: appointment.status
        });
        
        setError('');
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const { patientName, patientEmail, doctorName, department, date, time } = formData;
    
    if (!patientName || !patientEmail || !doctorName || !department || !date || !time) {
      setError('All fields except notes are required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Date validation - ensure it's not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Appointment date cannot be in the past');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.put(`/${id}`, formData);
      setSuccess('Appointment updated successfully!');
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update appointment. Please try again.');
      }
    } finally {
      setSubmitting(false);
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
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h3 className="mb-0">Edit Appointment</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="patientName" className="form-label">Patient Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="patientEmail" className="form-label">Patient Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="patientEmail"
                      name="patientEmail"
                      value={formData.patientEmail}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="doctorName" className="form-label">Doctor Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="doctorName"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="department" className="form-label">Department</label>
                    <select
                      className="form-select"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
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
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">Appointment Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label">Appointment Time</label>
                    <select
                      className="form-select"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                    >
                      <option value="">Select Time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/appointments')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : 'Update Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointment;