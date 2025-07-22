import React, { useState, useEffect, useRef } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  
  // Post-related states
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postError, setPostError] = useState('');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    country: ''
  });

  const [postFormData, setPostFormData] = useState({
    lessonType: '',
    subject: '',
    headline: '',
    description: '',
    townOrCity: '',
    grade: ''
  });
  
  const [premiumData, setPremiumData] = useState({
    subject: '',
    email: '',
    mobile: '',
    topix: '',
    descripton: '',
    ispayed: false
  });

  const [studentPremiumStatus, setStudentPremiumStatus] = useState({
    hasPremium: false,
    isPaid: false,
    premiumData: null
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [premiumErrors, setPremiumErrors] = useState({});
  const [postValidationErrors, setPostValidationErrors] = useState({});

  const API_BASE_URL = 'http://82.25.180.10:5000/api';
  const POCKETBASE_URL = 'http://127.0.0.1:8090';
  const STRIPE_SERVER_URL = 'http://82.25.180.10:4242';

  // Contact validation function for posts
  const validateContactInfo = (text) => {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePatterns = [
      /\b\d{10}\b/,
      /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,
      /\(\d{3}\)\s?\d{3}[-.\s]\d{4}/,
      /\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
      /\b\d{3}[-.\s]\d{4}\b/,
      /\b\d{11,15}\b/
    ];
    
    if (emailPattern.test(text)) {
      return 'Email addresses are not allowed in this field';
    }
    
    for (let pattern of phonePatterns) {
      if (pattern.test(text)) {
        return 'Phone numbers are not allowed in this field';
      }
    }
    
    return null;
  };

  // Load Google Maps API
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

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && locationInputRef.current && !autocompleteRef.current && showPostForm) {
      const initTimer = setTimeout(() => {
        if (locationInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              locationInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components']
              }
            );

            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace();
              if (place && (place.name || place.formatted_address)) {
                let cityName = place.name || place.formatted_address;
                
                if (place.address_components) {
                  const cityComponent = place.address_components.find(
                    component => 
                      component.types.includes('locality') || 
                      component.types.includes('administrative_area_level_2')
                  );
                  if (cityComponent) {
                    cityName = cityComponent.long_name;
                  }
                }

                setPostFormData(prev => ({
                  ...prev,
                  townOrCity: cityName
                }));
              }
            });
          } catch (error) {
            console.error('Error creating autocomplete:', error);
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
          console.error('Error cleaning up autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded, showPostForm]);

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!user || user.role !== 'student') {
      navigate('/login/student');
      return;
    }
    
    // Initialize with user data if available
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        country: user.country || ''
      });
      
      setPremiumData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
    
    // Load data
    if (user && (user.id || user.studentId)) {
      loadProfileData();
      fetchMyPosts();
    }

    if (user?.email) {
      loadStudentPremiumStatus();
    }
  }, [user, navigate]);

  const loadProfileData = async () => {
    const userId = user?.id || user?.studentId;
    
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/students/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          location: data.location || '',
          country: data.country || ''
        });
      } else {
        console.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPremiumStatus = async () => {
    try {
      const response = await fetch(`${STRIPE_SERVER_URL}/check-student-premium-status/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setStudentPremiumStatus(data);
      }
    } catch (error) {
      console.error('Error loading student premium status:', error);
    }
  };

  // Fetch student's posts
  const fetchMyPosts = async () => {
    const studentId = user?.studentId || user?.id;
    if (!studentId) return;

    try {
      setPostsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts`);
      const userPosts = response.data.filter(post => post.studentId === studentId);
      setMyPosts(userPosts);
    } catch (error) {
      console.error('Error fetching my posts:', error);
      setPostError('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  // Handle post input changes with validation
  const handlePostInputChange = (field, value) => {
    setPostFormData({ ...postFormData, [field]: value });
    
    if (['subject', 'headline', 'description'].includes(field)) {
      const error = validateContactInfo(value);
      setPostValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Create new post
  const handleCreatePost = () => {
    setPostFormData({
      lessonType: '',
      subject: '',
      headline: '',
      description: '',
      townOrCity: '',
      grade: ''
    });
    setEditingPost(null);
    setPostValidationErrors({});
    setShowPostForm(true);
  };

  // Edit existing post
  const handleEditPost = (post) => {
    setPostFormData({
      lessonType: post.lessonType,
      subject: post.subject,
      headline: post.headline,
      description: post.description,
      townOrCity: post.townOrCity || '',
      grade: post.grade || ''
    });
    setEditingPost(post);
    setPostValidationErrors({});
    setShowPostForm(true);
  };

  // Submit post form
  const handlePostFormSubmit = async (e) => {
    e.preventDefault();

    // Validate contact info in restricted fields
    const errors = {
      subject: validateContactInfo(postFormData.subject),
      headline: validateContactInfo(postFormData.headline),
      description: validateContactInfo(postFormData.description)
    };
    
    setPostValidationErrors(errors);
    
    const hasErrors = Object.values(errors).some(error => error !== null);
    
    if (hasErrors) {
      return;
    }
    
    try {
      setPostsLoading(true);
      
      const payload = {
        studentId: user.studentId || user.id,
        lessonType: postFormData.lessonType,
        subject: postFormData.subject,
        headline: postFormData.headline,
        description: postFormData.description,
        townOrCity: postFormData.townOrCity,
        grade: postFormData.grade
      };
      
      if (editingPost) {
        await axios.put(`${API_BASE_URL}/posts/${editingPost.id}`, payload);
        alert('Post updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/posts`, payload);
        alert('Post created successfully!');
      }
      
      setShowPostForm(false);
      fetchMyPosts(); // Refresh posts
      
    } catch (error) {
      console.error('Error saving post:', error);
      alert(error.response?.data?.error || 'Failed to save post');
    } finally {
      setPostsLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      fetchMyPosts(); // Refresh posts
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setPostError('Failed to delete post');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Validation functions
  const validateForm = () => {
    const errors = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!profileData.country.trim()) {
      errors.country = 'Country is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePremiumForm = () => {
    const errors = {};
    
    if (!premiumData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!premiumData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(premiumData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!premiumData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    }
    
    if (!premiumData.topix.trim()) {
      errors.topix = 'Topic is required';
    }
    
    if (!premiumData.descripton.trim()) {
      errors.descripton = 'Description is required';
    }
    
    setPremiumErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePremiumInputChange = (e) => {
    const { name, value } = e.target;
    setPremiumData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (premiumErrors[name]) {
      setPremiumErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    const userId = user?.id || user?.studentId;
    
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phoneNumber', profileData.phoneNumber);
      formData.append('location', profileData.location);
      formData.append('country', profileData.country);

      const response = await fetch(`${API_BASE_URL}/students/${userId}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        await loadProfileData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumSubmit = async () => {
    if (!validatePremiumForm()) {
      return;
    }

    try {
      setPremiumLoading(true);
      
      const stripe = await loadStripe('pk_test_51RlPFJPLqHqCP926lPQTDC69S32MQE5V01FtJvFlSLeRGCRzkC3EsH5TGLFTD4UExjtnlUfWoHjUPzmgQaSl86lU00VX8NqTZa');
      
      const body = {
        studentData: {
          email: premiumData.email,
          subject: premiumData.subject,
          mobile: premiumData.mobile,
          topix: premiumData.topix,
          descripton: premiumData.descripton,
        }
      };

      const response = await fetch(`${STRIPE_SERVER_URL}/create-student-premium-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student premium checkout session');
      }

      const session = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (error) {
      console.error('Student premium payment error:', error);
      alert(error.message || 'Failed to initiate premium payment');
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationErrors({});
    
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        country: user.country || ''
      });
    } else {
      loadProfileData();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
    setPremiumErrors({});
    setPremiumData({
      subject: '',
      email: user?.email || '',
      mobile: '',
      topix: '',
      descripton: '',
      ispayed: false
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        position: 'fixed',
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        borderRight: '1px solid #dee2e6'
      }}>
        <div style={{
          textAlign: 'center',
          paddingBottom: '20px',
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#0d6efd',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            color: 'white',
            fontSize: '2rem'
          }}>
            <i className="bi bi-person-fill"></i>
          </div>
          <h5>{profileData.name || user?.name || 'Student Name'}</h5>
          <p style={{ color: '#6c757d', margin: 0 }}>Student</p>
          {studentPremiumStatus.hasPremium && studentPremiumStatus.isPaid && (
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px'
            }}>
              <i className="bi bi-star-fill"></i>
              Premium Member
            </span>
          )}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ margin: '5px 0' }}>
            <button
              style={{
                color: activeTab === 'profile' ? 'white' : '#333',
                padding: '10px 15px',
                borderRadius: '5px',
                width: '100%',
                background: activeTab === 'profile' ? '#0d6efd' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              Profile
            </button>
          </li>
          <li style={{ margin: '5px 0' }}>
            <button
              style={{
                color: activeTab === 'posts' ? 'white' : '#333',
                padding: '10px 15px',
                borderRadius: '5px',
                width: '100%',
                background: activeTab === 'posts' ? '#0d6efd' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setActiveTab('posts')}
            >
              <i className="bi bi-file-post me-2"></i>
              My Posts ({myPosts.length})
            </button>
          </li>
          <li style={{ margin: '5px 0' }}>
            <button
              style={{
                color: activeTab === 'subscriptions' ? 'white' : '#333',
                padding: '10px 15px',
                borderRadius: '5px',
                width: '100%',
                background: activeTab === 'subscriptions' ? '#0d6efd' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setActiveTab('subscriptions')}
            >
              <i className="bi bi-star me-2"></i>
              Subscriptions
            </button>
          </li>
          <li style={{ marginTop: '20px' }}>
            <button
              style={{
                color: '#dc3545',
                padding: '10px 15px',
                borderRadius: '5px',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '20px' }}>
        <div style={{
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h1>
            {activeTab === 'profile' ? 'Profile Management' : 
             activeTab === 'posts' ? 'My Posts' : 'Subscriptions'}
          </h1>
        </div>

        <div style={{ backgroundColor: 'white' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h5 style={{ margin: 0 }}>Profile Information</h5>
                {!isEditing ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div className="btn-group">
                    <button 
                      className="btn btn-success"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input 
                      type="text" 
                      className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={profileData.name} 
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ backgroundColor: !isEditing ? '#f8f9fa' : 'white' }}
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback">{validationErrors.name}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input 
                      type="email" 
                      className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={profileData.email} 
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      style={{ backgroundColor: !isEditing ? '#f8f9fa' : 'white' }}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">{validationErrors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="phoneNumber"
                      value={profileData.phoneNumber} 
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Enter your phone number"
                      style={{ backgroundColor: !isEditing ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Location/City</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="location"
                      value={profileData.location} 
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Enter your city or location"
                      style={{ backgroundColor: !isEditing ? '#f8f9fa' : 'white' }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Country *</label>
                    <input 
                      type="text" 
                      className={`form-control ${validationErrors.country ? 'is-invalid' : ''}`}
                      name="country"
                      value={profileData.country} 
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Enter your country"
                      style={{ backgroundColor: !isEditing ? '#f8f9fa' : 'white' }}
                    />
                    {validationErrors.country && (
                      <div className="invalid-feedback">{validationErrors.country}</div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <h6 style={{ marginBottom: '0.5rem' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Profile Tips
                  </h6>
                  <ul style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>
                    <li>Keep your profile information up to date</li>
                    <li>Include your location to find nearby teachers</li>
                    <li>Provide a phone number for easier communication</li>
                    <li>Make sure your email is accurate for notifications</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div style={{
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '2rem'
            }}>
              {/* Posts Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <div>
                  <h5 style={{ margin: 0 }}>My Learning Posts</h5>
                  <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>
                    Manage your tutoring requests and learning opportunities
                  </p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreatePost}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                  Create New Post
                </button>
              </div>

              {/* Error Alert */}
              {postError && (
                <div className="alert alert-danger alert-dismissible fade show" style={{ marginBottom: '1.5rem' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {postError}
                  <button type="button" className="btn-close" onClick={() => setPostError('')}></button>
                </div>
              )}

              {/* Posts List */}
              {postsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <div className="spinner-border text-primary"></div>
                  <p style={{ marginTop: '1rem' }}>Loading posts...</p>
                </div>
              ) : myPosts.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px'
                }}>
                  <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d', marginBottom: '1rem' }}></i>
                  <h4 style={{ color: '#6c757d' }}>No posts yet</h4>
                  <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                    You haven't created any learning posts yet. Click 'Create New Post' to get started!
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCreatePost}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {myPosts.map((post) => (
                    <div key={post.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e9ecef',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}>
                      {/* Post Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              background: post.lessonType === 'online' ? '#dbeafe' : 
                                        post.lessonType === 'in-person' ? '#dcfce7' : '#fef3c7',
                              color: post.lessonType === 'online' ? '#1d4ed8' : 
                                   post.lessonType === 'in-person' ? '#16a34a' : '#92400e'
                            }}>
                              <i className={`bi ${
                                post.lessonType === 'online' ? 'bi-laptop' : 
                                post.lessonType === 'in-person' ? 'bi-geo-alt' : 
                                'bi-hybrid'
                              } me-1`}></i>
                              {post.lessonType === 'online' ? 'Online' : 
                               post.lessonType === 'in-person' ? 'In-Person' : 
                               'Both'}
                            </span>
                            <span style={{
                              background: '#f3e8ff',
                              color: '#7c3aed',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {post.subject}
                            </span>
                            {post.grade && (
                              <span style={{
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                <i className="bi bi-mortarboard me-1"></i>
                                {post.grade === 'student' ? 'K-12' :
                                 post.grade === 'university-student' ? 'University' :
                                 'Adult Learner'}
                              </span>
                            )}
                          </div>
                          <small style={{ color: '#6c757d' }}>{formatDate(post.createdAt)}</small>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEditPost(post)}
                            title="Edit post"
                            style={{
                              width: '36px',
                              height: '36px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete post"
                            style={{
                              width: '36px',
                              height: '36px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      {/* Post Content */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '0.5rem'
                        }}>
                          {post.headline}
                        </h5>
                        <p style={{
                          color: '#475569',
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          lineHeight: '1.5'
                        }}>
                          {post.description}
                        </p>
                        
                        {post.townOrCity && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#64748b'
                          }}>
                            <i className="bi bi-geo-alt" style={{ color: '#2563eb' }}></i>
                            {post.townOrCity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div style={{
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '2rem'
            }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Premium Status Banner */}
                {studentPremiumStatus.hasPremium && studentPremiumStatus.isPaid ? (
                  <div style={{ margin: '2rem 0' }}>
                    <div style={{
                      padding: '2rem',
                      borderRadius: '15px',
                      border: '2px solid #10b981',
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          background: '#10b981',
                          color: 'white'
                        }}>
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <div>
                          <h5 style={{ margin: 0, fontWeight: '700' }}>
                            Premium Active 
                            <span style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              marginLeft: '0.5rem'
                            }}>
                              <i className="bi bi-patch-check-fill me-1"></i>
                              Verified
                            </span>
                          </h5>
                          <p style={{ margin: 0, opacity: 0.8 }}>
                            Your premium subscription is active with all features unlocked
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button className="btn btn-outline-primary me-2">
                          <i className="bi bi-calendar-plus me-2"></i>
                          Book Free Session
                        </button>
                        <button className="btn btn-outline-success">
                          <i className="bi bi-gear me-2"></i>
                          Manage Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '2rem'
                      }}>
                        <i className="bi bi-star-fill"></i>
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Premium Learning Experience
                      </h3>
                      <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                        Get verified, unlimited posts, and free trial sessions
                      </p>
                    </div>

                    {/* Premium Pricing */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '2rem',
                        borderRadius: '15px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                      }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                            Premium Subscription
                          </h4>
                          <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>£29</span>
                            <span style={{ fontSize: '1rem', opacity: 0.8 }}>per month</span>
                          </div>
                        </div>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          textAlign: 'left'
                        }}>
                          <li style={{
                            padding: '0.75rem 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '0.95rem'
                          }}>
                            <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                            Verified Student Badge
                          </li>
                          <li style={{
                            padding: '0.75rem 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '0.95rem'
                          }}>
                            <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                            Unlimited Posts
                          </li>
                          <li style={{
                            padding: '0.75rem 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '0.95rem'
                          }}>
                            <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                            Direct Contact Visibility
                          </li>
                          <li style={{
                            padding: '0.75rem 0',
                            fontSize: '0.95rem'
                          }}>
                            <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                            2 Free Trial Sessions/Month
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '2rem',
                        borderRadius: '15px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>
                          <i className="bi bi-gem"></i>
                          <span>PREMIUM</span>
                        </div>
                        <h5 style={{ marginBottom: '1rem', fontWeight: '700' }}>Ready to Get Started?</h5>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
                          Join thousands of verified students with unlimited learning opportunities
                        </p>
                        <button 
                          style={{
                            background: 'white',
                            color: '#667eea',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '25px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                            cursor: 'pointer'
                          }}
                          onClick={() => setShowPremiumModal(true)}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
                          }}
                        >
                          <i className="bi bi-credit-card me-2"></i>
                          Pay £29 & Get Premium
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Post Form Modal */}
      {showPostForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }} onClick={() => setShowPostForm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '15px 15px 0 0'
            }}>
              <h5 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: 0
              }}>
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h5>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  opacity: 0.8,
                  padding: 0
                }}
                onClick={() => setShowPostForm(false)}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.8'}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handlePostFormSubmit}>
              <div style={{ padding: '1.5rem' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Lesson Type *</label>
                    <select
                      className="form-select"
                      value={postFormData.lessonType}
                      onChange={(e) => setPostFormData({...postFormData, lessonType: e.target.value})}
                      required
                    >
                      <option value="">Select lesson type</option>
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grade Level *</label>
                    <select
                      className="form-select"
                      value={postFormData.grade}
                      onChange={(e) => setPostFormData({...postFormData, grade: e.target.value})}
                      required
                    >
                      <option value="">Select grade level</option>
                      <option value="student">Student (K-12)</option>
                      <option value="university-student">University Student</option>
                      <option value="adult">Adult Learner</option>
                    </select>
                  </div>
                  <div className="col-md-6"> 
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className={`form-control ${postValidationErrors.subject ? 'is-invalid' : ''}`}
                      value={postFormData.subject}
                      onChange={(e) => handlePostInputChange('subject', e.target.value)}
                      placeholder="Enter subject"
                      required
                    />
                    {postValidationErrors.subject && (
                      <div className="invalid-feedback">
                        {postValidationErrors.subject}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Headline *</label>
                    <input
                      type="text"
                      className={`form-control ${postValidationErrors.headline ? 'is-invalid' : ''}`}
                      value={postFormData.headline}
                      onChange={(e) => handlePostInputChange('headline', e.target.value)}
                      placeholder="e.g., Looking for Expert Math Tutor"
                      required
                    />
                    {postValidationErrors.headline && (
                      <div className="invalid-feedback">
                        {postValidationErrors.headline}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className={`form-control ${postValidationErrors.description ? 'is-invalid' : ''}`}
                      rows="4"
                      value={postFormData.description}
                      onChange={(e) => handlePostInputChange('description', e.target.value)}
                      placeholder="Describe what kind of tutoring you're looking for..."
                      required
                    ></textarea>
                    {postValidationErrors.description && (
                      <div className="invalid-feedback">
                        {postValidationErrors.description}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Town or City</label>
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="form-control"
                      value={postFormData.townOrCity}
                      onChange={(e) => setPostFormData({...postFormData, townOrCity: e.target.value})}
                      placeholder="Start typing your city..."
                      autoComplete="off"
                    />
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      <i className="bi bi-info-circle me-1"></i>
                      Start typing to see city suggestions
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowPostForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={postsLoading}
                >
                  {postsLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {editingPost ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${editingPost ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ border: 'none', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderBottom: 'none',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h5 style={{ fontWeight: '600', margin: 0 }}>
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  Get Premium Subscription
                </h5>
                <button 
                  type="button" 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                  onClick={handleClosePremiumModal}
                  disabled={premiumLoading}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{ fontSize: '2rem', color: '#0d6efd' }}>
                    £29 <small style={{ fontSize: '1rem', color: '#6c757d' }}>/month</small>
                  </div>
                  <p style={{ color: '#6c757d', margin: 0 }}>Cancel anytime • 2 free lessons monthly</p>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Subject *</label>
                      <select 
                        className={`form-control ${premiumErrors.subject ? 'is-invalid' : ''}`}
                        name="subject"
                        value={premiumData.subject}
                        onChange={handlePremiumInputChange}
                      >
                        <option value="">Select a subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Biology">Biology</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Other">Other</option>
                      </select>
                      {premiumErrors.subject && (
                        <div className="invalid-feedback">{premiumErrors.subject}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input 
                        type="email" 
                        className={`form-control ${premiumErrors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={premiumData.email}
                        onChange={handlePremiumInputChange}
                        placeholder="Enter your email"
                      />
                      {premiumErrors.email && (
                        <div className="invalid-feedback">{premiumErrors.email}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Mobile Number *</label>
                      <input 
                        type="text" 
                        className={`form-control ${premiumErrors.mobile ? 'is-invalid' : ''}`}
                        name="mobile"
                        value={premiumData.mobile}
                        onChange={handlePremiumInputChange}
                        placeholder="Enter your mobile number"
                      />
                      {premiumErrors.mobile && (
                        <div className="invalid-feedback">{premiumErrors.mobile}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Topic *</label>
                      <input 
                        type="text" 
                        className={`form-control ${premiumErrors.topix ? 'is-invalid' : ''}`}
                        name="topix"
                        value={premiumData.topix}
                        onChange={handlePremiumInputChange}
                        placeholder="Specific topic you need help with"
                      />
                      {premiumErrors.topix && (
                        <div className="invalid-feedback">{premiumErrors.topix}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea 
                        className={`form-control ${premiumErrors.descripton ? 'is-invalid' : ''}`}
                        name="descripton"
                        value={premiumData.descripton}
                        onChange={handlePremiumInputChange}
                        placeholder="Describe your learning goals and what you expect from the tutor"
                        rows="4"
                      />
                      {premiumErrors.descripton && (
                        <div className="invalid-feedback">{premiumErrors.descripton}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#e7f1ff',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: '#0d6efd', marginRight: '1rem' }}></i>
                  <div>
                    <small style={{ fontWeight: 'bold' }}>Secure Payment</small>
                    <br />
                    <small style={{ color: '#6c757d' }}>Your payment is processed securely by Stripe. We don't store your payment information.</small>
                  </div>
                </div>
              </div>
              <div style={{
                padding: '1rem 2rem',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClosePremiumModal}
                  disabled={premiumLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.375rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={handlePremiumSubmit}
                  disabled={premiumLoading}
                >
                  {premiumLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Pay £29 with Stripe
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .dashboard-container {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .post-card {
            padding: 1rem;
          }
          
          .post-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .post-actions {
            align-self: flex-end;
          }
          
          .modal-dialog {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
          
          .premium-card {
            padding: 1.5rem;
          }
          
          .modal-body {
            padding: 1rem;
          }
          
          .modal-footer {
            padding: 1rem;
            flex-direction: column;
          }
          
          .modal-footer .btn {
            width: 100%;
          }
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
          color: #2563eb !important;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          outline: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        .invalid-feedback {
          display: block;
        }

        .is-invalid {
          border-color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;