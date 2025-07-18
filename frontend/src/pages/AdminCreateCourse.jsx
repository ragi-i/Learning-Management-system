import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../authContext';
import { useNavigate } from 'react-router-dom';
import '../Style/AdminCreateCourse.css';

const AdminCreateCourse = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: '',
    price: '',
    thumbnail: ''
  });

  if (!user || user.role !== 'admin') return <p>Access denied</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/courses', form);
      alert('Course created successfully!');
      navigate(`/admin/lesson/${res.data.course._id}`);
    } catch (error) {
      alert('Failed to create course.');
    }
  };

  // ✅ Cancel and go back to Admin Home
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel creating this course?')) {
      navigate('/admin/home'); // Admin home route
    }
  };

  return (
    <div className="create-course-container">
      <div className="form-box">
        <h2>Create New Course</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="Course Title" onChange={handleChange} required />
          <textarea name="description" placeholder="Description" onChange={handleChange} required />
          <input name="instructor" placeholder="Instructor Name" onChange={handleChange} required />
          <input name="price" placeholder="Price" type="number" onChange={handleChange} required />
          <input name="thumbnail" placeholder="Thumbnail Image URL" onChange={handleChange} required />

          <div className="form-buttons">
            <button type="submit" className="btn-green">Create Course</button>
            <button type="button" className="btn-gray" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateCourse;
