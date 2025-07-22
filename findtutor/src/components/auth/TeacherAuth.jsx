import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://82.25.180.10:5000/api';

// Country codes mapping
const countryPhoneCodes = {
  'United States': '+1',
  'United Kingdom': '+44',
  'Canada': '+1',
  'Australia': '+61',
  'Germany': '+49',
  'France': '+33',
  'Spain': '+34',
  'Italy': '+39',
  'Netherlands': '+31',
  'India': '+91',
  'Singapore': '+65',
  'Sri Lanka': '+94',
  'Afghanistan': '+93',
  'Albania': '+355',
  'Algeria': '+213',
  'Argentina': '+54',
  'Armenia': '+374',
  'Austria': '+43',
  'Bangladesh': '+880',
  'Belgium': '+32',
  'Brazil': '+55',
  'Bulgaria': '+359',
  'Cambodia': '+855',
  'Chile': '+56',
  'China': '+86',
  'Colombia': '+57',
  'Croatia': '+385',
  'Czech Republic': '+420',
  'Denmark': '+45',
  'Egypt': '+20',
  'Estonia': '+372',
  'Finland': '+358',
  'Ghana': '+233',
  'Greece': '+30',
  'Hungary': '+36',
  'Indonesia': '+62',
  'Iran': '+98',
  'Iraq': '+964',
  'Ireland': '+353',
  'Israel': '+972',
  'Japan': '+81',
  'Jordan': '+962',
  'Kazakhstan': '+7',
  'Kenya': '+254',
  'Kuwait': '+965',
  'Latvia': '+371',
  'Lebanon': '+961',
  'Lithuania': '+370',
  'Luxembourg': '+352',
  'Malaysia': '+60',
  'Maldives': '+960',
  'Mexico': '+52',
  'Morocco': '+212',
  'Myanmar': '+95',
  'Nepal': '+977',
  'New Zealand': '+64',
  'Nigeria': '+234',
  'Norway': '+47',
  'Pakistan': '+92',
  'Philippines': '+63',
  'Poland': '+48',
  'Portugal': '+351',
  'Qatar': '+974',
  'Romania': '+40',
  'Russia': '+7',
  'Saudi Arabia': '+966',
  'Serbia': '+381',
  'Slovakia': '+421',
  'Slovenia': '+386',
  'South Africa': '+27',
  'South Korea': '+82',
  'Sweden': '+46',
  'Switzerland': '+41',
  'Thailand': '+66',
  'Turkey': '+90',
  'Ukraine': '+380',
  'United Arab Emirates': '+971',
  'Uruguay': '+598',
  'Venezuela': '+58',
  'Vietnam': '+84',
  'Zimbabwe': '+263'
};

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
    country: '',
    profilePhoto: null
  });

  // New state for country code functionality
  const [countryCode, setCountryCode] = useState('');
  const [phoneWithoutCode, setPhoneWithoutCode] = useState('');

  const cityInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const countryInputRef = useRef(null);
  const countryAutocompleteRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Update country code when country changes
  useEffect(() => {
    if (formData.country) {
      const code = countryPhoneCodes[formData.country] || '';
      setCountryCode(code);
      
      // Update the full phone number in formData
      if (phoneWithoutCode) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: code + phoneWithoutCode
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          phoneNumber: code
        }));
      }
    }
  }, [formData.country, phoneWithoutCode]);

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

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

  // Initialize autocomplete for city
  useEffect(() => {
    if (isGoogleMapsLoaded && cityInputRef.current && !autocompleteRef.current && !isLogin) {
      console.log('Attempting to initialize city autocomplete...');
      
      const initTimer = setTimeout(() => {
        if (cityInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            console.log('Creating city autocomplete instance...');
            
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              cityInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components', 'place_id']
              }
            );

            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace();
              console.log('City place selected:', place);
              
              if (place && (place.name || place.formatted_address)) {
                let cityName = place.name || place.formatted_address;
                
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

                  // Auto-detect country from city selection
                  const countryComponent = place.address_components.find(
                    component => component.types.includes('country')
                  );
                  if (countryComponent) {
                    setFormData(prev => ({
                      ...prev,
                      cityOrTown: cityName,
                      country: countryComponent.long_name
                    }));
                    return;
                  }
                }

                console.log('Setting city name:', cityName);
                setFormData(prev => ({
                  ...prev,
                  cityOrTown: cityName
                }));
              }
            });

            console.log('City autocomplete initialized successfully');
          } catch (error) {
            console.error('Error creating city autocomplete:', error);
          }
        }
      }, 500);

      return () => clearTimeout(initTimer);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up city autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded, isLogin]);

  // Initialize autocomplete for country
  useEffect(() => {
    if (isGoogleMapsLoaded && countryInputRef.current && !countryAutocompleteRef.current && !isLogin) {
      const initTimer = setTimeout(() => {
        if (countryInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            countryAutocompleteRef.current = new window.google.maps.places.Autocomplete(
              countryInputRef.current,
              {
                types: ['country'],
                fields: ['name', 'address_components']
              }
            );

            countryAutocompleteRef.current.addListener('place_changed', () => {
              const place = countryAutocompleteRef.current.getPlace();
              
              if (place && place.name) {
                setFormData(prev => ({
                  ...prev,
                  country: place.name
                }));
              }
            });
          } catch (error) {
            console.error('Error creating country autocomplete:', error);
          }
        }
      }, 500);

      return () => clearTimeout(initTimer);
    }

    return () => {
      if (countryAutocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(countryAutocompleteRef.current);
          countryAutocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up country autocomplete:', error);
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

  // Handle phone number change with country code logic
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Remove any non-digit characters except + at the beginning
    const cleanedValue = value.replace(/[^\d+]/g, '');
    
    // If user manually types a country code, extract it
    if (cleanedValue.startsWith('+')) {
      const match = cleanedValue.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        const [, code, number] = match;
        setCountryCode(code);
        setPhoneWithoutCode(number);
        
        // Find the country that matches this code
        const matchingCountry = Object.entries(countryPhoneCodes).find(([, phoneCode]) => phoneCode === code);
        if (matchingCountry && matchingCountry[0] !== formData.country) {
          setFormData(prev => ({
            ...prev,
            country: matchingCountry[0],
            phoneNumber: cleanedValue
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            phoneNumber: cleanedValue
          }));
        }
      }
    } else {
      // If no country code, use the current country code
      setPhoneWithoutCode(cleanedValue);
      setFormData(prev => ({
        ...prev,
        phoneNumber: countryCode + cleanedValue
      }));
    }
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
      country: response.data.teacher.country,
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
    
    if (formData.phoneNumber && formData.phoneNumber !== countryCode) {
      registerData.append('phoneNumber', formData.phoneNumber);
    }
    if (formData.cityOrTown) {
      registerData.append('cityOrTown', formData.cityOrTown);
    }
    if (formData.country) {
      registerData.append('country', formData.country);
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
      country: teacherData.country,
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

    .country-code-display {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px 0 0 8px;
      padding: 12px 15px;
      color: #0d6efd;
      font-weight: 600;
      display: flex;
      align-items: center;
      min-width: 80px;
      justify-content: center;
    }

    .phone-input-with-code {
      border-radius: 0 8px 8px 0;
      border-left: none;
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
                        <label htmlFor="country" className="form-label">
                          Country <span className="text-danger">*</span>
                        </label>
                        <input
                          ref={countryInputRef}
                          type="text"
                          className="form-control mb-2"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Start typing your country..."
                          autoComplete="off"
                          required
                        />
                        <div className="form-text mb-2">
                          <i className="bi bi-info-circle me-1"></i>
                          Start typing or select from dropdown below
                        </div>
                        
                        <select
                          className="form-select"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
                        >
                          <option value="">Or select from popular countries</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Spain">Spain</option>
                          <option value="Italy">Italy</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="India">India</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          Phone Number <span className="text-danger">*</span>
                          {countryCode && (
                            <span className="text-muted ms-2">({countryCode})</span>
                          )}
                        </label>
                        <div className="input-group">
                          {countryCode ? (
                            <span className="country-code-display">
                              {countryCode}
                            </span>
                          ) : (
                            <span className="input-group-text auth-input-group-text">
                              <i className="bi bi-telephone"></i>
                            </span>
                          )}
                          <input
                            type="tel"
                            className={`form-control ${countryCode ? 'phone-input-with-code' : 'auth-form-control'}`}
                            id="phoneNumber"
                            name="phoneNumber"
                            value={countryCode ? phoneWithoutCode : formData.phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder={countryCode ? "Enter phone number" : "Select country first or enter with country code"}
                            required
                          />
                        </div>
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          {countryCode 
                            ? `Enter your phone number. Country code ${countryCode} will be added automatically.`
                            : "Select your country first to automatically add the country code, or enter the full number with country code."
                          }
                        </div>
                      </div>

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
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Start typing to see city suggestions
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
                          Upload a profile picture (Max 5MB, JPG, PNG, GIF)
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