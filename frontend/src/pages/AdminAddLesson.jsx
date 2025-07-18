import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../authContext';
import '../Style/AdminAddLesson.css';

const AdminAddLesson = () => {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', videoUrl: '', resources: '' });

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/lessons/${courseId}`, {
        ...form,
        resources: form.resources.split(',').map(link => link.trim()).filter(Boolean)
      });
      alert('Lesson added successfully!');
      setForm({ title: '', videoUrl: '', resources: '' });
    } catch {
      alert('Failed to add lesson.');
    }
  };

  const handleSkip = () => {
    navigate('/admin/home');
  };

  return (
    <div className="add-lesson-container">
      <div className="form-box">
        <h2>
          <i className="fa fa-chalkboard-teacher" style={{ color: "#5bc0be", marginRight: "0.5rem" }}></i>
          Add New Lesson
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-wrapper">
            <span className="input-icon">
              <i className="fa fa-heading"></i>
            </span>
            <input
              name="title"
              placeholder="Lesson Title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <i className="fa fa-video"></i>
            </span>
            <input
              name="videoUrl"
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              value={form.videoUrl}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <i className="fa fa-link"></i>
            </span>
            <input
              name="resources"
              placeholder="Resource Links (comma separated)"
              value={form.resources}
              onChange={handleChange}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="add-btn">
              <i className="fa fa-plus-circle"></i> Add Lesson
            </button>
            <button type="button" className="skip-btn" onClick={handleSkip}>
              <i className="fa fa-arrow-right"></i> Let's Do It Later
            </button>
          </div>
        </form>
      </div>
    
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
};

export default AdminAddLesson;