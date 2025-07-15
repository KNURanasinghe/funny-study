// COMPLETE FIXED VERSION - Replace your entire component with this:

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://82.25.180.10:5000/api';

const TeacherAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    cityOrTown: '',
    profilePhoto: null
  });

  const cityInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
  const loadGoogleMapsAPI = () => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      return; // Don't load again
    }

    // Load without callback - simpler approach
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBRVAGSgYeCWuZW_Lhy5V_bdr_0Tv1Q5ys&libraries=places`;
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsGoogleMapsLoaded(true);
        }
      }, 100);
    };
    
    document.head.appendChild(script);
  };

  loadGoogleMapsAPI();
}, []);

  // 2. FIXED: Autocomplete initialization with better timing
  useEffect(() => {
    if (isGoogleMapsLoaded && cityInputRef.current && !autocompleteRef.current && !isLogin) {
      console.log('Attempting to initialize autocomplete...');
      
      // Add a longer delay to ensure everything is ready
      const initTimer = setTimeout(() => {
        if (cityInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            console.log('Creating autocomplete instance...');
            
            // Initialize autocomplete
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              cityInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components', 'place_id']
              }
            );

            // Listen for place selection
            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace();
              console.log('Place selected:', place);
              
              if (place && (place.name || place.formatted_address)) {
                let cityName = place.name || place.formatted_address;
                
                // Try to get better city name from address components
                if (place.address_components) {
                  const cityComponent = place.address_components.find(
                    component => 
                      component.types.includes('locality') || 
                      component.types.includes('administrative_area_level_2') ||
                      component.types.includes('sublocality_level_1')
                  );
                  if (cityComponent) {
                    cityName = cityComponent.long_name;
                  }
                }

                console.log('Setting city name:', cityName);
                
                // Update form data
                setFormData(prev => ({
                  ...prev,
                  cityOrTown: cityName
                }));
              }
            });

            console.log('Autocomplete initialized successfully');
          } catch (error) {
            console.error('Error creating autocomplete:', error);
          }
        } else {
          console.error('Google Maps API not ready yet');
        }
      }, 500); // Increased delay

      // Cleanup timer
      return () => {
        clearTimeout(initTimer);
      };
    }

    // Cleanup autocomplete
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded, isLogin]);

  useEffect(() => {
    setIsLogin(location.pathname.includes('/login'));
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      throw new Error('Please fill in all required fields');
    }

    const response = await axios.post(`${API_BASE_URL}/teachers/login`, {
      email: formData.email,
      password: formData.password
    });

    const userData = {
      id: response.data.teacher.id,
      teacherId: response.data.teacher.id,
      name: response.data.teacher.name,
      email: response.data.teacher.email,
      phoneNumber: response.data.teacher.phoneNumber,
      cityOrTown: response.data.teacher.cityOrTown,
      profilePhoto: response.data.teacher.profilePhoto,
      role: 'teacher'
    };

    await login(userData);
    return response.data;
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      throw new Error('Please fill in name, email and password');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const registerData = new FormData();
    registerData.append('name', formData.name);
    registerData.append('email', formData.email);
    registerData.append('password', formData.password);
    
    if (formData.phoneNumber) {
      registerData.append('phoneNumber', formData.phoneNumber);
    }
    if (formData.cityOrTown) {
      registerData.append('cityOrTown', formData.cityOrTown);
    }
    if (formData.profilePhoto) {
      registerData.append('profilePhoto', formData.profilePhoto);
    }

    const response = await axios.post(`${API_BASE_URL}/teachers/register`, registerData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const teacherResponse = await axios.get(`${API_BASE_URL}/teachers/${response.data.teacherId}`);
    const teacherData = teacherResponse.data;

    const userData = {
      id: teacherData.id,
      teacherId: teacherData.id,
      name: teacherData.name,
      email: teacherData.email,
      phoneNumber: teacherData.phoneNumber,
      cityOrTown: teacherData.cityOrTown,
      profilePhoto: teacherData.profilePhoto,
      role: 'teacher'
    };

    await login(userData);
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
      navigate('/dashboard/teacher');
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.response?.data?.error || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 3. FIXED: CSS styles using regular style tag instead of jsx
  const styles = `
    .auth-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
    }

    .auth-input-group-text {
      background-color: #f8f9fa;
      border-color: #dee2e6;
      color: #6c757d;
      border-radius: 8px 0 0 8px;
    }

    .auth-form-control {
      border-radius: 0 8px 8px 0;
      padding: 12px 15px;
      border-left: none;
    }

    .auth-form-control:focus {
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
      border-color: #86b7fe;
    }

    .auth-input-group:focus-within .auth-input-group-text {
      border-color: #86b7fe;
      background-color: #e7f1ff;
      color: #0d6efd;
    }

    .auth-btn-primary {
      border-radius: 8px;
      padding: 12px 20px;
      font-weight: 500;
      background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .auth-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
    }

    /* Google Places Autocomplete Dropdown Styling */
    .pac-container {
      background-color: white !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid #dee2e6 !important;
      margin-top: 2px !important;
      font-family: inherit !important;
      z-index: 9999 !important;
    }

    .pac-item {
      padding: 12px 15px !important;
      border-bottom: 1px solid #f1f3f4 !important;
      cursor: pointer !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }

    .pac-item:hover {
      background-color: #f8f9fa !important;
    }

    .pac-item-selected,
    .pac-item:hover {
      background-color: #e7f1ff !important;
    }

    .pac-matched {
      font-weight: 600 !important;
      color: #0d6efd !important;
    }

    .pac-item-query {
      color: #212529 !important;
      font-size: 14px !important;
    }

    .pac-icon {
      margin-right: 10px !important;
      margin-top: 2px !important;
    }

    .pac-logo::after {
      display: none !important;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 0 15px;
      }
      
      .auth-card-body {
        padding: 2rem !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="container mt-5 auth-container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow auth-card">
              <div className="card-body p-5 auth-card-body">
                <div className="text-center mb-4">
                  <i className="bi bi-person-workspace display-4 text-primary mb-3"></i>
                  <h2 className="fw-bold">
                    {isLogin ? 'Teacher Login' : 'Teacher Registration'}
                  </h2>
                  <p className="text-muted">
                    {isLogin 
                      ? 'Welcome back! Please login to your account.'
                      : 'Create your teacher account to start offering lessons'}
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
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group auth-input-group">
                      <span className="input-group-text auth-input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control auth-form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group auth-input-group">
                      <span className="input-group-text auth-input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control auth-form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                        required
                      />
                    </div>
                  </div>

                  {!isLogin && ( 
                    <>
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group auth-input-group">
                          <span className="input-group-text auth-input-group-text">
                            <i className="bi bi-lock-fill"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control auth-form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group auth-input-group">
                          <span className="input-group-text auth-input-group-text">
                            <i className="bi bi-person"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control auth-form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <div className="input-group auth-input-group">
                          <span className="input-group-text auth-input-group-text">
                            <i className="bi bi-telephone"></i>
                          </span>
                          <input
                            type="tel"
                            className="form-control auth-form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                      </div>

                      {/* FIXED: City input with proper autocomplete */}
                      <div className="mb-3">
                        <label htmlFor="cityOrTown" className="form-label">
                          City or Town <span className="text-danger">*</span>
                        </label>
                        <div className="input-group auth-input-group">
                          <span className="input-group-text auth-input-group-text">
                            <i className="bi bi-geo-alt"></i>
                          </span>
                          <input
                            ref={cityInputRef}
                            type="text"
                            className="form-control auth-form-control"
                            id="cityOrTown"
                            name="cityOrTown"
                            value={formData.cityOrTown}
                            onChange={handleChange}
                            placeholder="Start typing your city or town..."
                            required
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="profilePhoto" className="form-label">
                          Profile Photo <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="profilePhoto"
                          name="profilePhoto"
                          onChange={handleChange}
                          accept="image/*"
                          required
                        />
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Optional: Upload a profile picture (Max 5MB, JPG, PNG, GIF)
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 auth-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isLogin ? 'Logging in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isLogin ? 'bi-box-arrow-in-right' : 'bi-person-plus'} me-2`}></i>
                        {isLogin ? 'Login' : 'Create Account'}
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      className="btn btn-link p-0"
                      onClick={() => navigate(isLogin ? '/register/teacher' : '/login/teacher')}
                    >
                      {isLogin ? 'Register here' : 'Login here'}
                    </button>
                  </p>
                </div>

                <div className="mt-4">
                  <div className="alert alert-info" role="alert">
                    <div className="d-flex">
                      <i className="bi bi-lightbulb flex-shrink-0 me-2"></i>
                      <div>
                        <h6 className="alert-heading mb-1">For Teachers</h6>
                        <small>
                          {isLogin 
                            ? 'Login to access your teacher dashboard and manage your tutoring services.'
                            : 'Join our platform to offer tutoring services and connect with students looking for help.'
                          }
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherAuth;