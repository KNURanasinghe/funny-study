import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://82.25.180.10:5000/api';

const StudentPosts = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    lessonType: '',
    subject: '',
    headline: '',
    description: '',
    townOrCity: '',
    grade: '' 
  });
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLessonType, setSelectedLessonType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // Purchase-related states
  const [purchasedPosts, setPurchasedPosts] = useState(new Set());
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState({});

  // Subjects list
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science',
    'Economics', 'Business Studies', 'Art', 'Music',
    'French', 'Spanish', 'German', 'Psychology',
    'Philosophy', 'Statistics', 'Accounting'
  ];

  const validateContactInfo = (text) => {
  // Email pattern - matches most common email formats
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  
  // Phone number patterns - matches various formats
  const phonePatterns = [
    /\b\d{10}\b/, // 1234567890
    /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, // 123-456-7890, 123.456.7890, 123 456 7890
    /\(\d{3}\)\s?\d{3}[-.\s]\d{4}/, // (123) 456-7890, (123)456-7890
    /\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/, // International formats
    /\b\d{3}[-.\s]\d{4}\b/, // 123-4567
    /\b\d{11,15}\b/ // Long number sequences (11-15 digits)
  ];
  
  // Check for email
  if (emailPattern.test(text)) {
    return 'Email addresses are not allowed in this field';
  }
  
  // Check for phone numbers
  for (let pattern of phonePatterns) {
    if (pattern.test(text)) {
      return 'Phone numbers are not allowed in this field';
    }
  }
  
  return null; // No validation error
};


const [validationErrors, setValidationErrors] = useState({
  subject: '',
  headline: '',
  description: ''
});

// Helper function to handle input changes with validation
const handleInputChange = (field, value) => {
  // Update form data
  setFormData({ ...formData, [field]: value });
  
  // Validate the field if it's one of the restricted fields
  if (['subject', 'headline', 'description'].includes(field)) {
    const error = validateContactInfo(value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }
};

  useEffect(() => {
     window.scrollTo(0, 0);
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

                setFormData(prev => ({
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
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      window.location.href = '/login/student';
      return;
    }
    setCurrentUser(userData);
    
    fetchAllPosts();
    
    // Only fetch user's posts if they are a student
    if (userData.role === 'student' && userData.studentId) {
      fetchMyPosts(userData.studentId);
    }
    
    // If user is a teacher, fetch their purchases
    if (userData.role === 'teacher' && userData.teacherId) {
      fetchTeacherPurchases(userData.teacherId);
    }
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setAllPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      const userPosts = response.data.filter(post => post.studentId === studentId);
      setMyPosts(userPosts);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  };

  const fetchTeacherPurchases = async (teacherId) => {
    try {
      const response = await axios.get(`http://82.25.180.10:5000/buy/teacher-purchases/teacher/${teacherId}`);
      const purchasedPostIds = new Set(response.data.map(purchase => purchase.studentPostId));
      setPurchasedPosts(purchasedPostIds);
    } catch (error) {
      console.error('Error fetching teacher purchases:', error);
    }
  };

  const handlePurchaseAccess = async (post) => {
    if (!currentUser?.teacherId) {
      setError('Only teachers can purchase access');
      return;
    }

    console.log('Purchase attempt for post:', post); // Debug log
    console.log('Current user:', currentUser); // Debug log

    setPurchaseLoading(prev => ({ ...prev, [post.id]: true }));

    try {
      const purchaseData = {
        studentPostId: post.id,
        teacherId: currentUser.teacherId,
        studentId: post.studentId  // Make sure this exists in the post object
      };
      
      console.log('Sending purchase data:', purchaseData); // Debug log
      
      // Validate data before sending
      if (!purchaseData.studentPostId || !purchaseData.teacherId || !purchaseData.studentId) {
        throw new Error(`Missing required data: ${JSON.stringify(purchaseData)}`);
      }

      const response = await axios.post(`http://82.25.180.10:5000/buy/teacher-purchases/purchase`, purchaseData);

      // Update purchased posts
      setPurchasedPosts(prev => new Set([...prev, post.id]));
      
      // Show success message
      alert('Purchase successful! You can now view the student\'s contact information.');
      
    } catch (error) {
      console.error('Error purchasing access:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || error.message || 'Failed to purchase access');
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [post.id]: false }));
    }
  };

  const handleViewContact = async (post) => {
    if (!currentUser?.teacherId) {
      setError('Only teachers can view contact information');
      return;
    }

    try {
      const response = await axios.get(`http://82.25.180.10:5000/buy/posts/${post.id}/contact/${currentUser.teacherId}`);
      setSelectedContact(response.data);
      setShowContactModal(true);
    } catch (error) {
      console.error('Error fetching contact:', error);
      if (error.response?.status === 403) {
        setError('You need to purchase access to view contact information');
      } else {
        setError('Failed to fetch contact information');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      lessonType: '',
      subject: '',
      headline: '',
      description: '',
      townOrCity: '',
      grade: ''
      
    });
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    resetForm();
    setShowPostForm(true);
  };

  const handleEditPost = (post) => {
    setFormData({
      lessonType: post.lessonType,
      subject: post.subject,
      headline: post.headline,
      description: post.description,
      townOrCity: post.townOrCity || ''
    });
    setEditingPost(post);
    setShowPostForm(true);
  };

 const handleFormSubmit = async (e) => {
  e.preventDefault();

  // Validate contact info in restricted fields
  const errors = {
    subject: validateContactInfo(formData.subject),
    headline: validateContactInfo(formData.headline),
    description: validateContactInfo(formData.description)
  };
  
  setValidationErrors(errors);
  
  // Check if there are any validation errors
  const hasErrors = Object.values(errors).some(error => error !== null);
  
  if (hasErrors) {
    return; // Don't submit if there are validation errors
  }
  
  try {
    setLoading(true);
    
    const payload = {
      studentId: currentUser.studentId || currentUser.id,
      lessonType: formData.lessonType,
      subject: formData.subject,
      headline: formData.headline,
      description: formData.description,
      townOrCity: formData.townOrCity,
      grade: formData.grade // Add this line
    };
    
    if (editingPost) {
      await axios.put(`${API_BASE_URL}/posts/${editingPost.id}`, payload);
      alert('Post updated successfully!');
    } else {
      await axios.post(`${API_BASE_URL}/posts`, payload);
      alert('Post created successfully!');
    }
    
    setShowPostForm(false);
    resetForm();
    
    // Fix: Call the correct functions instead of fetchPosts()
    fetchAllPosts(); // Refresh all posts
    if (currentUser?.role === 'student' && currentUser?.studentId) {
      fetchMyPosts(currentUser.studentId); // Refresh user's posts
    }
    
  } catch (error) {
    console.error('Error saving post:', error);
    alert(error.response?.data?.error || 'Failed to save post');
  } finally {
    setLoading(false);
  }
};


  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      fetchAllPosts();
      fetchMyPosts(currentUser.studentId);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const getFilteredPosts = () => {
    const posts = activeTab === 'all' ? allPosts : myPosts;
    
    return posts.filter(post => {
      const matchesSubject = !selectedSubject || post.subject === selectedSubject;
      const matchesLessonType = !selectedLessonType || post.lessonType === selectedLessonType;
      const matchesSearch = !searchQuery || 
        post.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.townOrCity?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSubject && matchesLessonType && matchesSearch;
    });
  };

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

  const renderContactButton = (post) => {
    if (currentUser?.role !== 'teacher') return null;
    
    const hasPurchased = purchasedPosts.has(post.id);
    const isLoading = purchaseLoading[post.id];
    
    if (hasPurchased) {
      return (
        <button 
          className="btn btn-success btn-sm"
          onClick={() => handleViewContact(post)}
        >
          <i className="bi bi-telephone me-1"></i>
          View Contact
        </button>
      );
    }
    
    return (
      <button 
        className="btn btn-primary btn-sm"
        onClick={() => handlePurchaseAccess(post)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-1"></span>
            Purchasing...
          </>
        ) : (
          <>
            <i className="bi bi-credit-card me-1"></i>
            Purchase Access ($5)
          </>
        )}
      </button>
    );
  };

  return (
    <div className="student-posts-page">
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-md-8">
              <h2 className="page-title">
                {currentUser?.role === 'student' ? 'Tutoring Posts' : 'Student Tutoring Requests'}
              </h2>
              <p className="page-subtitle">
                {currentUser?.role === 'student' 
                  ? 'Browse tutoring opportunities or manage your posts'
                  : 'Browse student requests for tutoring services'
                }
              </p>
            </div>
            {currentUser?.role === 'student' && (
              <div className="col-md-4 text-end">
                <button 
                  className="btn btn-primary"
                  onClick={handleCreatePost}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Post
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="tabs-section">
        <div className="container">
          <div className="nav-tabs-container">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  <i className="bi bi-grid me-2"></i>
                  All Posts ({allPosts.length})
                </button>
              </li>
              {currentUser?.role === 'student' && (
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my')}
                  >
                    <i className="bi bi-person me-2"></i>
                    My Posts ({myPosts.length})
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <div className="row g-3">
              {/* <div className="col-md-4">
                <label className="form-label">Filter by Subject</label>
                <select
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="col-md-4">
                <label className="form-label">Filter by Lesson Type</label>
                <select
                  className="form-select"
                  value={selectedLessonType}
                  onChange={(e) => setSelectedLessonType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="container">
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        </div>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
  <div className="modal-backdrop" onClick={() => setShowPostForm(false)}>
    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h3>
          <button 
            className="btn-close"
            onClick={() => setShowPostForm(false)}
          ></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Lesson Type *</label>
                <select
                  className="form-select"
                  value={formData.lessonType}
                  onChange={(e) => setFormData({...formData, lessonType: e.target.value})}
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
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
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
                  className={`form-control ${validationErrors.subject ? 'is-invalid' : ''}`}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter subject"
                  required
                />
                {validationErrors.subject && (
                  <div className="invalid-feedback">
                    {validationErrors.subject}
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label">Headline *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.headline ? 'is-invalid' : ''}`}
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="e.g., Looking for Expert Math Tutor"
                  required
                />
                {validationErrors.headline && (
                  <div className="invalid-feedback">
                    {validationErrors.headline}
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label">Description *</label>
                <textarea
                  className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                  rows="4"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what kind of tutoring you're looking for..."
                  required
                ></textarea>
                {validationErrors.description && (
                  <div className="invalid-feedback">
                    {validationErrors.description}
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label">Town or City</label>
                <input
                  ref={locationInputRef}
                  type="text"
                  className="form-control"
                  value={formData.townOrCity}
                  onChange={(e) => setFormData({...formData, townOrCity: e.target.value})}
                  placeholder="Start typing your city..."
                  autoComplete="off"
                />
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  Start typing to see city suggestions
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPostForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
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
  </div>
)}

      {/* Contact Information Modal */}
      {showContactModal && selectedContact && (
        <div className="modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Student Contact Information
                </h3>
                <button 
                  className="btn-close"
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="contact-info">
                  <div className="contact-item">
                    <label><i className="bi bi-person me-2"></i>Student Name:</label>
                    <span>{selectedContact.name}</span>
                  </div>
                  <div className="contact-item">
                    <label><i className="bi bi-envelope me-2"></i>Email:</label>
                    <span>{selectedContact.email}</span>
                  </div>
                  <div className="contact-item">
                    <label><i className="bi bi-telephone me-2"></i>Phone Number:</label>
                    <span>{selectedContact.phoneNumber}</span>
                  </div>
                  <div className="contact-item">
                    <label><i className="bi bi-book me-2"></i>Subject:</label>
                    <span>{selectedContact.subject}</span>
                  </div>
                  <div className="contact-item">
                    <label><i className="bi bi-card-text me-2"></i>Post:</label>
                    <span>{selectedContact.headline}</span>
                  </div>
                </div>
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle me-2"></i>
                  You have purchased access to this student's contact information. Please contact them directly to discuss tutoring arrangements.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </button>
                <a 
                  href={`tel:${selectedContact.phoneNumber}`}
                  className="btn btn-success"
                >
                  <i className="bi bi-telephone me-2"></i>
                  Call Now
                </a>
                <a 
                  href={`mailto:${selectedContact.email}`}
                  className="btn btn-primary"
                >
                  <i className="bi bi-envelope me-2"></i>
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

   {/* Posts Section */}
<section className="posts-section">
  <div className="container">
    {loading && !showPostForm ? (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading posts...</p>
      </div>
    ) : (
      <div className="posts-list">
        {getFilteredPosts().length === 0 ? (
          <div className="no-posts-card">
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <h4 className="text-muted">No posts found</h4>
              <p className="text-muted">
                {activeTab === 'my' 
                  ? "You haven't created any posts yet. Click 'Create Post' to get started!"
                  : "No posts match your current filters."
                }
              </p>
            </div>
          </div>
        ) : (
          getFilteredPosts().map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="student-info">
                  {post.profilePhoto && (
                    <img 
                      src={`http://82.25.180.10:5000${post.profilePhoto}`} 
                      alt={post.studentName} 
                      className="profile-avatar"
                    />
                  )}
                  <div className="student-details">
                    <h6 className="student-name">{post.studentName || 'Anonymous'}</h6>
                    <small className="post-date">{formatDate(post.createdAt)}</small>
                  </div>
                </div>
                
                <div className="post-meta">
                  <div className="post-badges">
                    <span className={`lesson-type-badge ${post.lessonType}`}>
                      <i className={`bi ${
                        post.lessonType === 'online' ? 'bi-laptop' : 
                        post.lessonType === 'in-person' ? 'bi-geo-alt' : 
                        'bi-hybrid'
                      } me-1`}></i>
                      {post.lessonType === 'online' ? 'Online' : 
                       post.lessonType === 'in-person' ? 'In-Person' : 
                       'Both online and In Person'}
                    </span>
                    <span className="subject-badge">{post.subject}</span>
                    {post.grade && (
                      <span className="grade-badge">
                        <i className="bi bi-mortarboard me-1"></i>
                        {post.grade === 'student' ? 'K-12 Student' :
                         post.grade === 'university-student' ? 'University' :
                         'Adult Learner'}
                      </span>
                    )}
                    {purchasedPosts.has(post.id) && currentUser?.role === 'teacher' && (
                      <span className="purchased-badge">
                        <i className="bi bi-check-circle me-1"></i>
                        Purchased
                      </span>
                    )}
                  </div>
                  
                  {currentUser?.role === 'student' && activeTab === 'my' && (
                    <div className="post-actions">
                      {/* <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEditPost(post)}
                        title="Edit post"
                      >
                        <i className="bi bi-pencil"></i>
                      </button> */}
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete post"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="post-content">
                <h5 className="post-headline">{post.headline}</h5>
                <p className="post-description">{post.description}</p>
                
                <div className="post-details">
                  {post.townOrCity && (
                    <span><i className="bi bi-geo-alt"></i> {post.townOrCity}</span>
                  )}
                  {currentUser?.role === 'teacher' && !purchasedPosts.has(post.id) && (
                    <span className="contact-locked">
                      <i className="bi bi-lock"></i> Contact info requires purchase
                    </span>
                  )}
                </div>
              </div>
              
              {activeTab === 'all' && post.studentId !== currentUser?.studentId && (
                <div className="post-footer">
                  {renderContactButton(post)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )}
  </div>
</section>

      <style jsx>{`

      .grade-badge {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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

        .form-text {
          font-size: 0.875rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .student-posts-page {
          padding-top: 80px;
        }

        .page-header {
          padding: 2rem 0;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #6c757d;
          margin-bottom: 0;
        }

        .tabs-section {
          padding: 1rem 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .nav-tabs-container {
          background: #f8f9fa;
          border-radius: 0.5rem;
          padding: 0.25rem;
        }

        .nav-tabs {
          border: none;
        }

        .search-section {
          padding: 1.5rem 0;
          background: white;
        }

        .search-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }

        .modal-dialog {
          background: white;
          border-radius: 0.75rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .contact-info {
          display: grid;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 0.5rem;
        }

        .contact-item label {
          font-weight: 600;
          color: #374151;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .contact-item span {
          color: #1f2937;
          font-weight: 500;
        }

        .posts-section {
          padding: 1.5rem 0 4rem;
          background: #f8f9fa;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-card, .no-posts-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .post-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .student-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .post-date {
          color: #64748b;
          font-size: 0.875rem;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .post-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .lesson-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .lesson-type-badge.online {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .lesson-type-badge.in-person {
          background: #dcfce7;
          color: #16a34a;
        }

        .lesson-type-badge.both {
  background: #fef3c7;
  color: #92400e;
}

.lesson-type-badge.both i {
  background: linear-gradient(45deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

        .subject-badge {
          background: #f3e8ff;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .purchased-badge {
          background: #ecfdf5;
          color: #059669;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .post-actions {
          display: flex;
          gap: 0.5rem;
        }

        .post-actions .btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
        }

        .post-content {
          margin-bottom: 1rem;
        }

        .post-headline {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .post-description {
          color: #475569;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .post-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .post-details i {
          color: #2563eb;
          margin-right: 0.25rem;
        }

        .contact-locked {
          color: #f59e0b !important;
          font-weight: 500;
        }

        .contact-locked i {
          color: #f59e0b !important;
        }

        .post-footer {
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-control,
        .form-select {
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          outline: none;
        }

        @media (max-width: 768px) {
          .page-header .row {
            flex-direction: column;
            gap: 1rem;
          }

          .page-header .text-end {
            text-align: start !important;
          }

          .post-header {
            flex-direction: column;
            gap: 1rem;
          }

          .post-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .post-actions {
            align-self: flex-end;
          }

          .post-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-dialog {
            margin: 1rem;
            width: calc(100% - 2rem);
          }

          .contact-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .modal-footer {
            flex-direction: column;
          }

          .modal-footer .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentPosts;