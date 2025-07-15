import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://82.25.180.10:5000';
const POCKETBASE_URL = 'http://127.0.0.1:8090';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Connection requests states
  const [requests, setRequests] = useState([]);
  const [requestsCount, setRequestsCount] = useState({ 
    totalRequests: 0, 
    pendingRequests: 0, 
    purchasedRequests: 0 
  });
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Posts state
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Premium states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumData, setPremiumData] = useState({
    link_or_video: true,
    link1: '',
    link2: '',
    link3: '',
    video1: null,
    video2: null,
    video3: null,
    ispaid: false,
    mail: user?.email || ''
  });
  const [premiumErrors, setPremiumErrors] = useState({});
  const [teacherPremiumStatus, setTeacherPremiumStatus] = useState(null);

  // Google Maps state
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const locationAutocompleteRef = useRef(null);
  const profileLocationInputRef = useRef(null);
  const profileLocationAutocompleteRef = useRef(null);

  // Post form state
  const [postForm, setPostForm] = useState({
    headline: '',
    subject: '',
    location: '',
    description: '',
    lessonType: 'in-person',
    distanceFromLocation: 5,
    townOrDistrict: '',
    price: '',
    priceType: 'hourly'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    cityOrTown: user?.cityOrTown || '',
    profilePhoto: null
  });

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

  useEffect(() => {
    // Check if user is logged in and is a teacher
    if (!user || user.role !== 'teacher') {
      navigate('/login/teacher');
    }
  }, [user, navigate]);

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

  // Load teacher posts
  useEffect(() => {
    const teacherId = user?.teacherId || user?.id;
    if (teacherId && activeTab === 'posts') {
      fetchPosts();
    }
  }, [user, activeTab]);

  // Fetch requests when requests tab is active
  useEffect(() => {
    const teacherId = user?.teacherId || user?.id;
    if (teacherId && activeTab === 'requests') {
      fetchRequests();
      fetchRequestsCount();
    }
  }, [user, activeTab]);

  // Load premium status when profile tab is active
  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'premium') {
      fetchPremiumStatus();
    }
  }, [activeTab, user]);

  const fetchPremiumStatus = async () => {
    try {
      const teacherEmail = user?.email;
      if (!teacherEmail) return;

      const response = await fetch(`${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records?filter=(mail='${teacherEmail}')`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setTeacherPremiumStatus(data.items[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const teacherId = user?.teacherId || user?.id;
      
      if (!teacherId) {
        setError('Teacher ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/post/teachers/${teacherId}/posts`);
        setPosts(response.data);
        return;
      } catch (mainError) {
        console.error('Main route failed:', mainError);
        
        try {
          const fallbackResponse = await axios.get(`${API_BASE_URL}/post/teachers/${teacherId}/posts-simple`);
          setPosts(fallbackResponse.data);
          return;
        } catch (fallbackError) {
          console.error('Fallback route failed:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Failed to load posts: ${error.response?.data?.error || error.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const teacherId = user?.teacherId || user?.id;
      const response = await axios.get(`${API_BASE_URL}/connect/requests/teacher/${teacherId}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsCount = async () => {
    try {
      const teacherId = user?.teacherId || user?.id;
      const response = await axios.get(`${API_BASE_URL}/connect/requests/teacher/${teacherId}/count`);
      setRequestsCount(response.data);
    } catch (error) {
      console.error('Error fetching requests count:', error);
    }
  };

  const validatePremiumForm = () => {
    const errors = {};
    
    if (!premiumData.mail.trim()) {
      errors.mail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(premiumData.mail)) {
      errors.mail = 'Email is invalid';
    }
    
    if (premiumData.link_or_video) {
      // Validate YouTube links
      if (!premiumData.link1.trim()) {
        errors.link1 = 'Video link 1 is required';
      } else if (!isValidYouTubeUrl(premiumData.link1)) {
        errors.link1 = 'Please enter a valid YouTube URL';
      }
      
      if (!premiumData.link2.trim()) {
        errors.link2 = 'Video link 2 is required';
      } else if (!isValidYouTubeUrl(premiumData.link2)) {
        errors.link2 = 'Please enter a valid YouTube URL';
      }
      
      if (!premiumData.link3.trim()) {
        errors.link3 = 'Video link 3 is required';
      } else if (!isValidYouTubeUrl(premiumData.link3)) {
        errors.link3 = 'Please enter a valid YouTube URL';
      }
    } else {
      // Validate video uploads
      if (!premiumData.video1) {
        errors.video1 = 'Video 1 is required';
      }
      if (!premiumData.video2) {
        errors.video2 = 'Video 2 is required';
      }
      if (!premiumData.video3) {
        errors.video3 = 'Video 3 is required';
      }
    }
    
    setPremiumErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePremiumInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPremiumData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (premiumErrors[name]) {
      setPremiumErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVideoUpload = (videoNumber, file) => {
    setPremiumData(prev => ({
      ...prev,
      [`video${videoNumber}`]: file
    }));
    
    // Clear validation error
    if (premiumErrors[`video${videoNumber}`]) {
      setPremiumErrors(prev => ({
        ...prev,
        [`video${videoNumber}`]: ''
      }));
    }
  };

  const handlePremiumSubmit = async () => {
    if (!validatePremiumForm()) {
      return;
    }

    try {
      setPremiumLoading(true);
      
      if (premiumData.link_or_video) {
        // Submit with YouTube links
        const response = await fetch(`${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            link_or_video: true,
            link1: premiumData.link1,
            link2: premiumData.link2,
            link3: premiumData.link3,
            ispaid: true,
            mail: premiumData.mail
          }),
        });

        if (response.ok) {
          setSuccess('🎉 Premium subscription with video links submitted successfully!');
          handleClosePremiumModal();
          fetchPremiumStatus();
        } else {
          const errorData = await response.json();
          setError('Failed to submit premium subscription. Please try again.');
        }
      } else {
        // Submit with video files
        const formData = new FormData();
        formData.append('link_or_video', false);
        formData.append('video1', premiumData.video1);
        formData.append('video2', premiumData.video2);
        formData.append('video3', premiumData.video3);
        formData.append('ispaid', true);
        formData.append('mail', premiumData.mail);

        const response = await fetch(`${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setSuccess('🎉 Premium subscription with videos submitted successfully!');
          handleClosePremiumModal();
          fetchPremiumStatus();
        } else {
          const errorData = await response.json();
          setError('Failed to submit premium subscription. Please try again.');
        }
      }
    } catch (error) {
      console.error('Premium submission error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
    setPremiumErrors({});
    setPremiumData({
      link_or_video: true,
      link1: '',
      link2: '',
      link3: '',
      video1: null,
      video2: null,
      video3: null,
      ispaid: false,
      mail: user?.email || ''
    });
  };

  const renderVideoPreview = (videoData, index) => {
    if (!teacherPremiumStatus) return null;

    const isPremium = teacherPremiumStatus.ispaid;
    const isBlurred = !isPremium;

    if (teacherPremiumStatus.link_or_video) {
      // YouTube links
      const link = teacherPremiumStatus[`link${index + 1}`];
      if (!link) return null;

      const videoId = extractYouTubeVideoId(link);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      return (
        <div key={index} className={`video-preview-container ${isBlurred ? 'blurred' : ''}`}>
          <div className="video-frame">
            <iframe
              src={embedUrl}
              title={`Teaching Video ${index + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            />
            {isBlurred && (
              <div className="video-overlay">
                <div className="premium-message">
                  <i className="bi bi-lock-fill"></i>
                  <h6>Premium Content</h6>
                  <p>Upgrade to Premium to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Uploaded videos
      const videoField = `video${index + 1}`;
      const videoUrl = teacherPremiumStatus[videoField];
      if (!videoUrl) return null;

      return (
        <div key={index} className={`video-preview-container ${isBlurred ? 'blurred' : ''}`}>
          <div className="video-frame">
            <video
              controls
              className="video-player"
              poster="/api/placeholder/300/200"
            >
              <source src={`${POCKETBASE_URL}/api/files/findtutor_premium_teachers/${teacherPremiumStatus.id}/${videoUrl}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {isBlurred && (
              <div className="video-overlay">
                <div className="premium-message">
                  <i className="bi bi-lock-fill"></i>
                  <h6>Premium Content</h6>
                  <p>Upgrade to Premium to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const handlePurchaseContact = async (requestId) => {
    if (!window.confirm('Purchase student contact information for $5.00?')) return;

    try {
      setLoading(true);
      const teacherId = user?.teacherId || user?.id;
      
      const response = await axios.post(`${API_BASE_URL}/connect/requests/${requestId}/purchase`, {
        teacherId: teacherId
      });
      
      setSuccess('Contact information purchased successfully!');
      
      // Show contact details
      alert(`Student Contact Info:\nName: ${response.data.contactInfo.studentName}\nEmail: ${response.data.contactInfo.email}\nPhone: ${response.data.contactInfo.phoneNumber}`);
      
      // Refresh requests
      fetchRequests();
      fetchRequestsCount();
      
    } catch (error) {
      console.error('Error purchasing contact:', error);
      setError(error.response?.data?.error || 'Failed to purchase contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const formatRequestDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const postData = {
        ...postForm,
        teacherId: user.teacherId || user.id,
        price: parseFloat(postForm.price)
      };

      let response;
      if (editingPost) {
        response = await axios.put(`${API_BASE_URL}/post/teachers/posts/${editingPost.id}`, postData);
        setSuccess('Post updated successfully!');
      } else {
        response = await axios.post(`${API_BASE_URL}/post/teachers/posts`, postData);
        setSuccess('Post created successfully!');
      }

      setShowPostModal(false);
      resetPostForm();
      fetchPosts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error.response?.data?.error || 'Failed to save post');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/post/teachers/posts/${postId}`);
      setSuccess('Post deleted successfully!');
      fetchPosts();
    } catch (error) {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      headline: post.headline || '',
      subject: post.subject || '',
      location: post.location || '',
      description: post.description || '',
      lessonType: post.lessonType || 'in-person',
      distanceFromLocation: post.distanceFromLocation || 5,
      townOrDistrict: post.townOrDistrict || '',
      price: post.price ? post.price.toString() : '',
      priceType: post.priceType || 'hourly'
    });
    setShowPostModal(true);
  };

  const resetPostForm = () => {
    setPostForm({
      headline: '',
      subject: '',
      location: '',
      description: '',
      lessonType: 'in-person',
      distanceFromLocation: 5,
      townOrDistrict: '',
      price: '',
      priceType: 'hourly'
    });
    setEditingPost(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
      formData.append('phoneNumber', profileForm.phoneNumber);
      formData.append('cityOrTown', profileForm.cityOrTown);
      
      if (profileForm.profilePhoto) {
        formData.append('profilePhoto', profileForm.profilePhoto);
      }

      const response = await axios.put(`${API_BASE_URL}/api/teachers/${user.teacherId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUserData = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        cityOrTown: profileForm.cityOrTown,
        profilePhoto: response.data.profilePhoto || user.profilePhoto
      };

      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setSuccess('Profile updated successfully!');
      setShowProfileModal(false);
      window.location.reload();
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
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

  const profileData = {
    name: user?.name || 'Teacher Name',
    email: user?.email || 'teacher@example.com',
    subjects: ['Mathematics', 'Physics'],
    experience: '10 years',
    rating: 4.8,
    totalStudents: 50,
    phoneNumber: user?.phoneNumber || 'Not provided',
    cityOrTown: user?.cityOrTown || 'Not provided'
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="profile-image-container">
            {user?.profilePhoto ? (
              <img
                src={`${API_BASE_URL}${user.profilePhoto}`}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-placeholder">
                <i className="bi bi-person-fill"></i>
              </div>
            )}
          </div>
          <h5>{user?.name || 'Teacher Name'}</h5>
          <p className="text-muted">Teacher</p>
          
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{requestsCount.pendingRequests}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{requestsCount.purchasedRequests}</span>
              <span className="stat-label">Purchased</span>
            </div>
          </div>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <i className="bi bi-envelope me-2"></i>
              Connection Requests
              {requestsCount.pendingRequests > 0 && (
                <span className="badge bg-warning ms-2">
                  {requestsCount.pendingRequests}
                </span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <i className="bi bi-book me-2"></i>
              My Posts
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
              className={`nav-link ${activeTab === 'premium' ? 'active' : ''}`}
              onClick={() => setActiveTab('premium')}
            >
              <i className="bi bi-star me-2"></i>
              Premium
              {teacherPremiumStatus?.ispaid && (
                <span className="badge bg-success ms-2">
                  <i className="bi bi-check-lg"></i>
                </span>
              )}
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
            {activeTab === 'requests' && 'Connection Requests'}
            {activeTab === 'posts' && 'My Posts'}
            {activeTab === 'profile' && 'Profile Management'}
            {activeTab === 'premium' && 'Premium Subscription'}
          </h1>
          
          {/* Action buttons */}
          <div className="header-actions">
            {activeTab === 'posts' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetPostForm();
                  setShowPostModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Create New Post
              </button>
            )}
            {activeTab === 'profile' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    phoneNumber: user?.phoneNumber || '',
                    cityOrTown: user?.cityOrTown || '',
                    profilePhoto: null
                  });
                  setShowProfileModal(true);
                }}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            )}
            {activeTab === 'premium' && !teacherPremiumStatus?.ispaid && (
              <button
                className="btn btn-premium"
                onClick={() => {
                  setPremiumData(prev => ({
                    ...prev,
                    mail: user?.email || ''
                  }));
                  setShowPremiumModal(true);
                }}
              >
                <i className="bi bi-star-fill me-2"></i>
                Get Premium
              </button>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        <div className="content-body">
          {/* Premium Tab */}
          {activeTab === 'premium' && (
            <div className="card">
              <div className="card-body">
                <div className="premium-content">
                  {/* Header */}
                  <div className="text-center mb-5">
                    <div className="premium-icon mb-3">
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <h3 className="premium-title">Premium Teaching Experience</h3>
                    <p className="premium-subtitle text-muted">
                      Showcase your teaching skills and connect directly with students
                    </p>
                  </div>

                  {/* Why Premium Section */}
                  <div className="why-premium mb-5">
                    <h4 className="section-title">
                      <i className="bi bi-question-circle me-2"></i>
                      Why subscription is a good choice?
                    </h4>
                    <div className="premium-description">
                      <p>
                        The students reaching your profile can see your <strong>live teaching</strong>. It makes them get a good understanding 
                        of your teaching and the impact of your lessons that can have on them.
                      </p>
                      <p>
                        We allow you to <strong>share your contact details directly through the videos</strong>. So that any student who visits 
                        your profile can contact you directly without any delay.
                      </p>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="benefits-section mb-5">
                    <h4 className="section-title">
                      <i className="bi bi-check-circle me-2"></i>
                      Premium Benefits
                    </h4>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="benefit-item">
                          <i className="bi bi-camera-video text-primary"></i>
                          <div>
                            <h6>Live Teaching Showcase</h6>
                            <p className="text-muted mb-0">Let students see your actual teaching style</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="bi bi-person-lines-fill text-primary"></i>
                          <div>
                            <h6>Direct Contact Sharing</h6>
                            <p className="text-muted mb-0">Share contact details through your videos</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="bi bi-lightning-charge text-primary"></i>
                          <div>
                            <h6>Instant Connections</h6>
                            <p className="text-muted mb-0">Students can contact you immediately</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="benefit-item">
                          <i className="bi bi-graph-up-arrow text-primary"></i>
                          <div>
                            <h6>Increased Visibility</h6>
                            <p className="text-muted mb-0">Stand out from other teachers</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="bi bi-heart text-primary"></i>
                          <div>
                            <h6>Build Trust</h6>
                            <p className="text-muted mb-0">Show your personality and teaching method</p>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <i className="bi bi-currency-dollar text-primary"></i>
                          <div>
                            <h6>More Students</h6>
                            <p className="text-muted mb-0">Attract more students to your classes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  {teacherPremiumStatus ? (
                    <div className="current-status mb-5">
                      <div className={`status-card ${teacherPremiumStatus.ispaid ? 'premium-active' : 'premium-pending'}`}>
                        <div className="status-header">
                          <div className="status-icon">
                            <i className={`bi ${teacherPremiumStatus.ispaid ? 'bi-check-circle-fill' : 'bi-clock-fill'}`}></i>
                          </div>
                          <div>
                            <h5 className="status-title">
                              {teacherPremiumStatus.ispaid ? 'Premium Active' : 'Premium Pending'}
                            </h5>
                            <p className="status-subtitle">
                              {teacherPremiumStatus.ispaid 
                                ? 'Your premium subscription is active and videos are visible to students'
                                : 'Your premium request is pending approval'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Show videos preview */}
                        <div className="videos-preview mt-4">
                          <h6 className="videos-title">Your Teaching Videos</h6>
                          <div className="row">
                            {[0, 1, 2].map((index) => (
                              <div key={index} className="col-md-4 mb-3">
                                {renderVideoPreview(teacherPremiumStatus, index)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="cta-section text-center">
                      <div className="premium-card">
                        <div className="premium-badge">
                          <i className="bi bi-gem"></i>
                          <span>PREMIUM</span>
                        </div>
                        <h5 className="premium-card-title">Ready to Get Started?</h5>
                        <p className="premium-text">
                          Join thousands of teachers who showcase their skills with premium videos
                        </p>
                        <button 
                          className="btn btn-premium"
                          onClick={() => {
                            setPremiumData(prev => ({
                              ...prev,
                              mail: user?.email || ''
                            }));
                            setShowPremiumModal(true);
                          }}
                        >
                          <i className="bi bi-star-fill me-2"></i>
                          Get Premium
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connection Requests Tab */}
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    Student Connection Requests
                  </h5>
                  <div className="d-flex gap-3">
                    <div className="text-center">
                      <div className="h5 text-primary mb-0">{requestsCount.totalRequests}</div>
                      <small className="text-muted">Total</small>
                    </div>
                    <div className="text-center">
                      <div className="h5 text-warning mb-0">{requestsCount.pendingRequests}</div>
                      <small className="text-muted">Pending</small>
                    </div>
                    <div className="text-center">
                      <div className="h5 text-success mb-0">{requestsCount.purchasedRequests}</div>
                      <small className="text-muted">Purchased</small>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Loading requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-envelope display-1 text-muted"></i>
                    <h5 className="mt-3">No Requests Yet</h5>
                    <p className="text-muted">When students are interested in your posts, their connection requests will appear here.</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {requests.map((request) => (
                      <div key={request.id} className="request-card mb-3">
                        <div className="row align-items-center">
                          <div className="col-md-2 text-center">
                            <div className="student-avatar">
                              {request.studentPhoto ? (
                                <img 
                                  src={`${API_BASE_URL}${request.studentPhoto}`} 
                                  alt={request.studentName}
                                  className="avatar-img"
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  <i className="bi bi-person-fill"></i>
                                </div>
                              )}
                              <span className={`status-badge ${request.status}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <div className="request-info">
                              <h6 className="student-name">
                                <strong>{request.studentName}</strong>
                                <span className="request-date">{formatRequestDate(request.requestDate)}</span>
                              </h6>
                              
                              <p className="post-info">
                                <i className="bi bi-book me-1"></i>
                                Interested in: <strong>{request.postHeadline}</strong>
                              </p>
                              
                              <p className="subject-info">
                                <i className="bi bi-tag me-1"></i>
                                Subject: {request.postSubject}
                              </p>
                              
                              {request.message && (
                                <div className="message-preview">
                                  <p className="message-text">
                                    <i className="bi bi-chat-quote me-1"></i>
                                    <em>"{request.message.length > 100 ? request.message.substring(0, 100) + '...' : request.message}"</em>
                                  </p>
                                </div>
                              )}
                              
                              {request.studentLocation && (
                                <p className="location-info">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {request.studentLocation}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="request-actions">
                              {request.status === 'pending' && (
                                <div className="action-buttons">
                                  <button 
                                    className="btn btn-success mb-2"
                                    onClick={() => handlePurchaseContact(request.id)}
                                    disabled={loading}
                                  >
                                    <i className="bi bi-credit-card me-2"></i>
                                    Purchase Contact (£7.00)
                                  </button>
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleViewRequestDetails(request)}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    View Details
                                  </button>
                                </div>
                              )}
                              
                              {request.status === 'purchased' && (
                                <div className="contact-info">
                                  <h6 className="contact-title">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    Contact Information
                                  </h6>
                                  <div className="contact-details">
                                    <p className="contact-item">
                                      <i className="bi bi-envelope me-2"></i>
                                      <a href={`mailto:${request.studentEmail}`}>{request.studentEmail}</a>
                                    </p>
                                    {request.studentPhone && (
                                      <p className="contact-item">
                                        <i className="bi bi-telephone me-2"></i>
                                        <a href={`tel:${request.studentPhone}`}>{request.studentPhone}</a>
                                      </p>
                                    )}
                                    <small className="purchase-date">
                                      Purchased: {new Date(request.purchaseDate).toLocaleDateString()}
                                    </small>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">My Teaching Posts</h5>
                
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-book display-1 text-muted"></i>
                    <h5 className="mt-3">No Posts Yet</h5>
                    <p className="text-muted">Create your first teaching post to start attracting students!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        resetPostForm();
                        setShowPostModal(true);
                      }}
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {posts.map(post => (
                      <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="post-card">
                          <div className="post-header">
                            <span className={`lesson-type-badge ${post.lessonType}`}>
                              {post.lessonType === 'online' ? 'Online' : post.lessonType === 'in-person' ? 'In-Person' : 'Both'}
                            </span>
                          </div>
                          
                          <h6 className="post-title">{post.headline}</h6>
                          <p className="post-subject">
                            <i className="bi bi-book me-1"></i>
                            {post.subject}
                          </p>
                          
                          {post.location && (
                            <p className="post-location">
                              <i className="bi bi-geo-alt me-1"></i>
                              {post.location}
                              {post.distanceFromLocation && (
                                <span className="distance">({post.distanceFromLocation}km radius)</span>
                              )}
                            </p>
                          )}
                          
                          <p className="post-description">
                            {post.description?.substring(0, 100)}{post.description?.length > 100 ? '...' : ''}
                          </p>
                          
                          <div className="post-footer">
                            <span className="post-price">
                              ${post.price}/{post.priceType}
                            </span>
                            <small className="post-date">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          
                          <div className="post-actions">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditPost(post)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Profile Information</h5>
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    <div className="profile-section">
                      <div className="large-avatar">
                        {user?.profilePhoto ? (
                          <img 
                            src={`${API_BASE_URL}${user.profilePhoto}`} 
                            alt="Profile" 
                            className="large-avatar-img"
                          />
                        ) : (
                          <div className="large-avatar-placeholder">
                            <i className="bi bi-person-fill"></i>
                          </div>
                        )}
                      </div>
                      <h5 className="mt-3">{profileData.name}</h5>
                      <p className="text-muted">{profileData.email}</p>
                    </div>

                    {/* Premium Videos Section in Profile */}
                    {teacherPremiumStatus && (
                      <div className="premium-videos-section mt-4">
                        <h6 className="videos-section-title">
                          <i className="bi bi-camera-video me-2"></i>
                          Teaching Videos
                          {teacherPremiumStatus.ispaid && (
                            <span className="badge bg-success ms-2">Premium</span>
                          )}
                        </h6>
                        <div className="teaching-videos">
                          {[0, 1, 2].map((index) => (
                            <div key={index} className="mb-3">
                              {renderVideoPreview(teacherPremiumStatus, index)}
                            </div>
                          ))}
                        </div>
                        {!teacherPremiumStatus.ispaid && (
                          <div className="upgrade-prompt mt-3">
                            <button 
                              className="btn btn-premium btn-sm"
                              onClick={() => setActiveTab('premium')}
                            >
                              <i className="bi bi-unlock me-2"></i>
                              Upgrade to Premium
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-8">
                    <div className="profile-details">
                      <div className="info-section">
                        <h6 className="section-title">
                          <i className="bi bi-info-circle me-2"></i>
                          Contact Information
                        </h6>
                        <div className="row">
                          <div className="col-sm-6 mb-3">
                            <label className="form-label">Name</label>
                            <input type="text" className="form-control" value={profileData.name} readOnly />
                          </div>
                          <div className="col-sm-6 mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" value={profileData.email} readOnly />
                          </div>
                          <div className="col-sm-6 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input type="text" className="form-control" value={profileData.phoneNumber} readOnly />
                          </div>
                          <div className="col-sm-6 mb-3">
                            <label className="form-label">Location</label>
                            <input type="text" className="form-control" value={profileData.cityOrTown} readOnly />
                          </div>
                        </div>
                      </div>
                      
                      <div className="info-section mt-4">
                        <h6 className="section-title">
                          <i className="bi bi-graph-up me-2"></i>
                          Teaching Statistics
                        </h6>
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="stat-box">
                              <h4 className="text-primary">{posts.length}</h4>
                              <small className="text-muted">Active Posts</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="stat-box">
                              <h4 className="text-success">{requestsCount.totalRequests}</h4>
                              <small className="text-muted">Total Requests</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="stat-box">
                              <h4 className="text-warning">{teacherPremiumStatus?.ispaid ? 'Premium' : 'Basic'}</h4>
                              <small className="text-muted">Account Type</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  Get Premium Subscription
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleClosePremiumModal}
                  disabled={premiumLoading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Video Type Selection */}
                <div className="mb-4">
                  <h6 className="form-label fw-bold">
                    <i className="bi bi-camera-video me-2"></i>
                    How would you like to add your teaching videos?
                  </h6>
                  <div className="video-type-selection">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="videoType" 
                        id="youtubeLinks"
                        checked={premiumData.link_or_video}
                        onChange={() => setPremiumData(prev => ({ ...prev, link_or_video: true }))}
                      />
                      <label className="form-check-label" htmlFor="youtubeLinks">
                        <strong>YouTube Links</strong> - Share existing YouTube videos
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="videoType" 
                        id="uploadVideos"
                        checked={!premiumData.link_or_video}
                        onChange={() => setPremiumData(prev => ({ ...prev, link_or_video: false }))}
                      />
                      <label className="form-check-label" htmlFor="uploadVideos">
                        <strong>Upload Videos</strong> - Upload new video files
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Email *</label>
                  <input 
                    type="email" 
                    className={`form-control ${premiumErrors.mail ? 'is-invalid' : ''}`}
                    name="mail"
                    value={premiumData.mail}
                    onChange={handlePremiumInputChange}
                    placeholder="Enter your email"
                  />
                  {premiumErrors.mail && (
                    <div className="invalid-feedback">{premiumErrors.mail}</div>
                  )}
                </div>

                {/* YouTube Links Section */}
                {premiumData.link_or_video ? (
                  <div className="youtube-links-section">
                    <h6 className="form-label fw-bold mb-3">
                      <i className="bi bi-youtube me-2"></i>
                      YouTube Video Links
                    </h6>
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="mb-3">
                        <label className="form-label">Teaching Video {num} *</label>
                        <input 
                          type="url" 
                          className={`form-control ${premiumErrors[`link${num}`] ? 'is-invalid' : ''}`}
                          name={`link${num}`}
                          value={premiumData[`link${num}`]}
                          onChange={handlePremiumInputChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {premiumErrors[`link${num}`] && (
                          <div className="invalid-feedback">{premiumErrors[`link${num}`]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Video Upload Section */
                  <div className="video-upload-section">
                    <h6 className="form-label fw-bold mb-3">
                      <i className="bi bi-cloud-upload me-2"></i>
                      Upload Teaching Videos
                    </h6>
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="mb-3">
                        <label className="form-label">Teaching Video {num} *</label>
                        <input 
                          type="file" 
                          className={`form-control ${premiumErrors[`video${num}`] ? 'is-invalid' : ''}`}
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(num, e.target.files[0])}
                        />
                        {premiumData[`video${num}`] && (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            {premiumData[`video${num}`].name}
                          </small>
                        )}
                        {premiumErrors[`video${num}`] && (
                          <div className="invalid-feedback">{premiumErrors[`video${num}`]}</div>
                        )}
                        <small className="form-text text-muted">
                          Supported formats: MP4, AVI, MOV (Max 50MB)
                        </small>
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructions */}
                <div className="premium-instructions mt-4">
                  <div className="alert alert-info">
                    <h6 className="alert-heading">
                      <i className="bi bi-info-circle me-2"></i>
                      Video Guidelines
                    </h6>
                    <ul className="mb-0 small">
                      <li>Show your actual teaching style and methodology</li>
                      <li>Include your contact details in the video for direct student contact</li>
                      <li>Keep videos engaging and demonstrate your expertise</li>
                      <li>Ensure good audio and video quality</li>
                      <li>Each video should be 2-5 minutes long</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
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
                  className="btn btn-premium"
                  onClick={handlePremiumSubmit}
                  disabled={premiumLoading}
                >
                  {premiumLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-star-fill me-2"></i>
                      Submit Premium Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing modals continue here... */}
      {/* (Post Modal, Profile Modal, Request Details Modal - keeping the existing code) */}

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 80px;
          background-color: #f8f9fa;
        }

        .sidebar {
          width: 300px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          padding: 25px;
          position: fixed;
          left: 0;
          top: 80px;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid #e9ecef;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
          z-index: 999;
        }

        .sidebar-header {
          text-align: center;
          padding-bottom: 25px;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 25px;
        }

        .profile-image-container {
          position: relative;
          display: inline-block;
          margin-bottom: 15px;
        }

        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .profile-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .quick-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding: 15px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 10px;
          border: 1px solid #bae6fd;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e40af;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-link {
          color: #374151;
          padding: 12px 18px;
          border-radius: 10px;
          margin: 5px 0;
          text-align: left;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-link:hover {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          transform: translateX(5px);
          color: #1e40af;
        }

        .nav-link.active {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }

        .nav-link .badge {
          font-size: 0.7rem;
          padding: 4px 8px;
        }

        .main-content {
          flex: 1;
          margin-left: 300px;
          padding: 30px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e9ecef;
        }

        .content-header h1 {
          margin: 0;
          color: #1f2937;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .content-body {
          background-color: white;
        }

        .card {
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 15px;
          overflow: hidden;
        }

        .card-body {
          padding: 30px;
        }

        .card-title {
          color: #1f2937;
          font-weight: 700;
          margin-bottom: 25px;
          font-size: 1.25rem;
        }

        /* Premium Styles */
        .premium-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .premium-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 2rem;
        }

        .premium-title {
          color: #333;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .premium-subtitle {
          font-size: 1.1rem;
        }

        .section-title {
          color: #333;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .premium-description {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }

        .premium-description p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .premium-description p:last-child {
          margin-bottom: 0;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
        }

        .benefit-item i {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .benefit-item h6 {
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
        }

        .current-status {
          margin: 2rem 0;
        }

        .status-card {
          padding: 2rem;
          border-radius: 15px;
          border: 2px solid #e5e7eb;
        }

        .status-card.premium-active {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #10b981;
        }

        .status-card.premium-pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #f59e0b;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .status-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .premium-active .status-icon {
          background: #10b981;
          color: white;
        }

        .premium-pending .status-icon {
          background: #f59e0b;
          color: white;
        }

        .status-title {
          margin: 0;
          font-weight: 700;
        }

        .status-subtitle {
          margin: 0;
          opacity: 0.8;
        }

        .videos-preview {
          margin-top: 1.5rem;
        }

        .videos-title {
          color: #333;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .video-preview-container {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .video-preview-container.blurred .video-frame {
          filter: blur(8px);
        }

        .video-frame {
          position: relative;
          width: 100%;
          height: 200px;
          background: #000;
          border-radius: 10px;
          overflow: hidden;
        }

        .video-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .premium-message {
          text-align: center;
          color: white;
        }

        .premium-message i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .premium-message h6 {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .premium-message p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .premium-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          position: relative;
          overflow: hidden;
        }

        .premium-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .premium-card-title {
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .premium-text {
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .btn-premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          color: white;
        }

        .btn-premium:disabled {
          opacity: 0.6;
          transform: none;
          cursor: not-allowed;
        }

        /* Premium Videos in Profile */
        .premium-videos-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 15px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .videos-section-title {
          color: #333;
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .teaching-videos .video-preview-container {
          height: 150px;
        }

        .teaching-videos .video-frame {
          height: 150px;
        }

        .upgrade-prompt {
          text-align: center;
        }

        /* Modal Styles */
        .modal-content {
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }

        .modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: none;
        }

        .modal-header .btn-close {
          filter: invert(1);
          opacity: 0.8;
        }

        .modal-header .btn-close:hover {
          opacity: 1;
        }

        .modal-title {
          font-weight: 600;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-footer {
          border-top: 1px solid #f0f0f0;
          padding: 1rem 2rem;
        }

        .video-type-selection {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        .video-type-selection .form-check {
          margin-bottom: 0.5rem;
        }

        .video-type-selection .form-check:last-child {
          margin-bottom: 0;
        }

        .youtube-links-section,
        .video-upload-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .premium-instructions .alert {
          border-radius: 10px;
        }

        /* Request, Post, and Profile styles continue from original... */
        .requests-list {
          max-height: 70vh;
          overflow-y: auto;
        }

        .request-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }

        .request-card:hover {
          border-left-color: #2563eb;
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .student-avatar {
          position: relative;
          display: inline-block;
        }

        .avatar-img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .avatar-placeholder {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.8rem;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          font-size: 0.6rem;
          padding: 3px 6px;
          border-radius: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.pending {
          background-color: #f59e0b;
          color: #92400e;
        }

        .status-badge.purchased {
          background-color: #10b981;
          color: #065f46;
        }

        .request-info {
          padding-left: 15px;
        }

        .student-name {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .request-date {
          font-size: 0.8rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 6px;
          margin-left: 10px;
        }

        .post-info, .subject-info, .location-info {
          margin: 5px 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .message-preview {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 3px solid #3b82f6;
          padding: 10px;
          margin: 8px 0;
          border-radius: 6px;
        }

        .message-text {
          font-style: italic;
          color: #374151;
          margin: 0;
          font-size: 0.9rem;
        }

        .request-actions {
          text-align: center;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          padding: 15px;
          border-radius: 10px;
        }

        .contact-title {
          color: #065f46;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .contact-details {
          font-size: 0.85rem;
        }

        .contact-item {
          margin: 5px 0;
        }

        .contact-item a {
          color: #0369a1;
          text-decoration: none;
          font-weight: 500;
        }

        .contact-item a:hover {
          text-decoration: underline;
        }

        .purchase-date {
          color: #6b7280;
          font-style: italic;
        }

        /* Post Styles */
        .post-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          height: 100%;
          transition: all 0.3s ease;
        }

        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .lesson-type-badge {
          font-size: 0.75rem;
          padding: 5px 10px;
          border-radius: 15px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lesson-type-badge.online {
          background-color: #d1fae5;
          color: #065f46;
        }

        .lesson-type-badge.in-person {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .lesson-type-badge.both {
          background-color: #e0e7ff;
          color: #5b21b6;
        }

        .post-title {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .post-subject, .post-location {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 5px 0;
        }

        .distance {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .post-description {
          color: #374151;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 10px 0;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
        }

        .post-price {
          color: #059669;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .post-date {
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .post-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .post-actions .btn {
          flex: 1;
          font-size: 0.85rem;
        }

        /* Profile Styles */
        .profile-section {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }

        .large-avatar {
          position: relative;
          display: inline-block;
        }

        .large-avatar-img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid #ffffff;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .large-avatar-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 4rem;
          border: 5px solid #ffffff;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .profile-details {
          padding-left: 20px;
        }

        .info-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
          margin-bottom: 20px;
        }

        .stat-box {
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        /* Button Styles */
        .btn {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .btn-outline-primary {
          color: #2563eb;
          border-color: #2563eb;
        }

        .btn-outline-primary:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .btn-outline-danger {
          color: #dc2626;
          border-color: #dc2626;
        }

        .btn-outline-danger:hover {
          background-color: #dc2626;
          border-color: #dc2626;
        }

        /* Alert Styles */
        .alert {
          border-radius: 10px;
          border: none;
          padding: 15px 20px;
          margin-bottom: 20px;
        }

        .alert-success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .alert-danger {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .alert-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border-left: 4px solid #3b82f6;
        }

        /* Loading States */
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        /* Form Styles */
        .form-control:focus,
        .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }

        .is-invalid {
          border-color: #dc3545;
        }

        .invalid-feedback {
          display: block;
        }

        /* Badge Styles */
        .badge {
          font-size: 0.75rem;
          padding: 6px 10px;
          border-radius: 6px;
        }

        .badge.bg-warning {
          background-color: #f59e0b !important;
          color: #92400e;
        }

        .badge.bg-success {
          background-color: #10b981 !important;
          color: #065f46;
        }

        .badge.bg-primary {
          background-color: #2563eb !important;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .sidebar {
            width: 250px;
          }

          .main-content {
            margin-left: 250px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            flex-direction: column;
            padding-top: 60px;
          }

          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
            padding: 15px;
          }

          .main-content {
            margin-left: 0;
            padding: 15px;
          }

          .content-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .request-card .row {
            flex-direction: column;
          }

          .request-card .col-md-2,
          .request-card .col-md-6,
          .request-card .col-md-4 {
            margin-bottom: 15px;
          }

          .modal-dialog {
            width: 95%;
            margin: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .quick-stats {
            flex-direction: column;
            gap: 10px;
          }

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .benefit-item {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }

          .benefit-item i {
            margin-top: 0;
          }

          .premium-card {
            padding: 1.5rem;
          }

          .video-frame {
            height: 150px;
          }

          .teaching-videos .video-frame {
            height: 120px;
          }
        }

        @media (max-width: 576px) {
          .card-body {
            padding: 20px;
          }

          .post-actions {
            flex-direction: column;
            gap: 8px;
          }

          .action-buttons {
            gap: 8px;
          }

          .action-buttons .btn {
            font-size: 0.8rem;
            padding: 8px 12px;
          }

          .premium-content {
            padding: 1rem;
          }
        }

        /* Scrollbar Styling */
        .requests-list::-webkit-scrollbar,
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .requests-list::-webkit-scrollbar-track,
        .sidebar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .requests-list::-webkit-scrollbar-thumb,
        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .requests-list::-webkit-scrollbar-thumb:hover,
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Animation Classes */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .request-card {
          animation: slideIn 0.3s ease-out;
        }

        .post-card {
          animation: slideIn 0.3s ease-out;
        }

        .video-preview-container {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;