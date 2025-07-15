import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    // Check if user is logged in and is a teacher
    if (!user || user.role !== 'teacher') {
      navigate('/login/teacher');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mock data for student requests
  const studentRequests = [
    {
      id: 1,
      studentName: 'John Doe',
      subject: 'Mathematics',
      level: 'Advanced',
      requestDate: '2024-03-15',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      subject: 'Physics',
      level: 'Intermediate',
      requestDate: '2024-03-14',
      status: 'accepted'
    }
  ];

  // Mock data for classes
  const classes = [
    {
      id: 1,
      subject: 'Mathematics',
      students: 5,
      schedule: 'Mon, Wed 10:00 AM',
      status: 'active'
    },
    {
      id: 2,
      subject: 'Physics',
      students: 3,
      schedule: 'Tue, Thu 2:00 PM',
      status: 'active'
    }
  ];

  // Mock data for locations
  const locations = [
    {
      id: 1,
      name: 'Main Teaching Center',
      address: '123 Education St, City',
      capacity: 10,
      status: 'active'
    },
    {
      id: 2,
      name: 'Online Sessions',
      platform: 'Zoom',
      status: 'active'
    }
  ];

  // Profile data
  const profileData = {
    name: user?.name || 'Teacher Name',
    email: user?.email || 'teacher@example.com',
    subjects: ['Mathematics', 'Physics'],
    experience: '10 years',
    rating: 4.8,
    totalStudents: 50
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src={user?.profile_picture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="profile-image"
          />
          <h5>{user?.name || 'Teacher Name'}</h5>
          <p className="text-muted">Teacher</p>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <i className="bi bi-envelope me-2"></i>
              Student Requests
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <i className="bi bi-book me-2"></i>
              Classes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <i className="bi bi-geo-alt me-2"></i>
              Location
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className="nav-link text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === 'requests' && 'Student Requests'}
            {activeTab === 'profile' && 'Profile Management'}
            {activeTab === 'classes' && 'Class Management'}
            {activeTab === 'location' && 'Location Management'}
          </h1>
        </div>

        <div className="content-body">
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Student Requests</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Level</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.studentName}</td>
                          <td>{request.subject}</td>
                          <td>{request.level}</td>
                          <td>{request.requestDate}</td>
                          <td>
                            <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Accept</button>
                            <button className="btn btn-sm btn-danger">Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Profile Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={profileData.name} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={profileData.email} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Subjects</label>
                      <input type="text" className="form-control" value={profileData.subjects.join(', ')} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Experience</label>
                      <input type="text" className="form-control" value={profileData.experience} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Rating</label>
                      <input type="text" className="form-control" value={profileData.rating} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Total Students</label>
                      <input type="text" className="form-control" value={profileData.totalStudents} readOnly />
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Edit Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Class Management</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Students</th>
                        <th>Schedule</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(cls => (
                        <tr key={cls.id}>
                          <td>{cls.subject}</td>
                          <td>{cls.students}</td>
                          <td>{cls.schedule}</td>
                          <td>
                            <span className="badge bg-success">{cls.status}</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Edit</button>
                            <button className="btn btn-sm btn-danger">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary mt-3">Add New Class</button>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Location Management</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address/Platform</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map(location => (
                        <tr key={location.id}>
                          <td>{location.name}</td>
                          <td>{location.address || location.platform}</td>
                          <td>{location.capacity || 'N/A'}</td>
                          <td>
                            <span className="badge bg-success">{location.status}</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Edit</button>
                            <button className="btn btn-sm btn-danger">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary mt-3">Add New Location</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 80px; /* Height of the header */
        }

        .sidebar {
          width: 280px;
          background-color: #f8f9fa;
          padding: 20px;
          position: fixed;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid #dee2e6;
        }

        .sidebar-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
        }

        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .nav-link {
          color: #333;
          padding: 10px 15px;
          border-radius: 5px;
          margin: 5px 0;
          text-align: left;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: #e9ecef;
        }

        .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 20px;
        }

        .content-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
        }

        .content-body {
          background-color: white;
        }

        .card {
          border: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .table {
          margin-bottom: 0;
        }

        .badge {
          padding: 5px 10px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
          }

          .main-content {
            margin-left: 0;
          }

          .dashboard-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard; 