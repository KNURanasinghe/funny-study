import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@school.com',
  password: 'admin123', // Change this to a secure password
  role: 'admin'
};

const AdminAuth = () => {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Auto-navigate when user state changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('Admin logged in, navigating to admin panel...');
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminLogin = async () => {
    if (!formData.email || !formData.password) {
      throw new Error('Please enter email and password');
    }

    // Check admin credentials
    if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
      const userData = {
        id: 'admin-1',
        adminId: 'admin-1',
        name: 'Super Administrator',
        email: ADMIN_CREDENTIALS.email,
        role: 'admin'
      };
      
      await login(userData);
      return userData;
    } else {
      throw new Error('Invalid admin credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting admin login...');
      await handleAdminLogin();
      console.log('Admin login successful');
    } catch (error) {
      console.error('Admin auth error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if AuthContext is still loading
  if (authLoading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock display-4 text-primary mb-3"></i>
                <h2 className="fw-bold">Admin Login</h2>
                <p className="text-muted">
                  Access the admin dashboard to manage the platform.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@school.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login as Admin
                    </>
                  )}
                </button>
              </form>

              <div className="alert alert-info mt-3" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                <small>
                  Use your admin credentials to access the administration panel.
                </small>
              </div>

              {/* Quick access links */}
              <div className="text-center mt-4">
                <p className="mb-2 text-muted">Not an admin?</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/login/student')}
                  >
                    <i className="bi bi-mortarboard me-1"></i>
                    Student Login
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/login/teacher')}
                  >
                    <i className="bi bi-person-workspace me-1"></i>
                    Teacher Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 15px;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }

        .form-control {
          border-radius: 8px;
          padding: 12px 15px;
          border: 1px solid #dee2e6;
        }

        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
          border-color: #86b7fe;
        }

        .input-group .form-control {
          border-radius: 0 8px 8px 0;
          border-left: none;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-color: #dee2e6;
          color: #6c757d;
          border-radius: 8px 0 0 8px;
        }

        .input-group:focus-within .input-group-text {
          border-color: #86b7fe;
          background-color: #e7f1ff;
          color: #0d6efd;
        }

        .btn-primary {
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 500;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        }

        .btn-outline-primary {
          border-radius: 6px;
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary:hover {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }

        .alert {
          border-radius: 8px;
        }

        .form-text {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        .display-4 {
          color: #dc3545 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminAuth;