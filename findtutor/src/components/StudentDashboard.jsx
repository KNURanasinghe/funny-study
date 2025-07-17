import React, { useState, useEffect } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    country: ''
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

  const API_BASE_URL = 'http://82.25.180.10:5000'; // Adjust this to match your backend URL
  const POCKETBASE_URL = 'http://127.0.0.1:8090';
  const STRIPE_SERVER_URL = 'http://82.25.180.10:4242';

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!user || user.role !== 'student') {
      navigate('/login/student');
      return;
    }
    
    // Debug: Log user object to see what's available
    console.log('User object:', user);
    
    // Initialize with user data if available
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        country: user.country || ''
      });
      
      // Initialize premium form with user email
      setPremiumData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
    
    // Only try to load profile data if we have a user ID
    if (user && (user.id || user.studentId)) {
      loadProfileData();
    }

    // Load student premium status
    if (user?.email) {
      loadStudentPremiumStatus();
    }
  }, [user, navigate]);

  const loadProfileData = async () => {
    // Get the correct user ID (could be id or studentId)
    const userId = user?.id || user?.studentId;
    
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/students/${userId}`);
      
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
    
    // Clear validation error for this field
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
    
    // Clear validation error for this field
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

    // Get the correct user ID
    const userId = user?.id || user?.studentId;
    
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for the request
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phoneNumber', profileData.phoneNumber);
      formData.append('location', profileData.location);
      formData.append('country', profileData.country);

      const response = await fetch(`${API_BASE_URL}/api/students/${userId}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        setIsEditing(false);
        
        // Show success message
        alert('Profile updated successfully!');
        
        // Reload profile data to ensure consistency
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
      
      // Use the exact same stripe key as teacher dashboard
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

      const headers = {
        "Content-Type": "application/json"
      };

      console.log('Sending student premium request:', body);

      const response = await fetch(`${STRIPE_SERVER_URL}/create-student-premium-checkout-session`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student premium checkout session');
      }

      const session = await response.json();
      console.log('Student checkout session created:', session.id);

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
    
    // Reset to user data if available, otherwise reload from API
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
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-person-fill text-white fs-1"></i>
          </div>
          <h5>{profileData.name || user?.name || 'Student Name'}</h5>
          <p className="text-muted">Student</p>
          {studentPremiumStatus.hasPremium && studentPremiumStatus.isPaid && (
            <span className="badge bg-warning text-dark">
              <i className="bi bi-star-fill me-1"></i>
              Premium Member
            </span>
          )}
        </div>

        <ul className="nav flex-column">
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
              className={`nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <i className="bi bi-star me-2"></i>
              Subscriptions
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
            {activeTab === 'profile' ? 'Profile Management' : 'Subscriptions'}
          </h1>
        </div>

        <div className="content-body">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Profile Information</h5>
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

                {/* Profile Information Form */}
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
                      />
                      {validationErrors.country && (
                        <div className="invalid-feedback">{validationErrors.country}</div>
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Profile Tips
                      </h6>
                      <ul className="mb-0 small text-muted">
                        <li>Keep your profile information up to date</li>
                        <li>Include your location to find nearby teachers</li>
                        <li>Provide a phone number for easier communication</li>
                        <li>Make sure your email is accurate for notifications</li>
                      </ul>
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="card">
              <div className="card-body">
                <div className="subscription-content">
                  {/* Premium Status Banner */}
                  {studentPremiumStatus.hasPremium && studentPremiumStatus.isPaid ? (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                      <i className="bi bi-check-circle-fill fs-3 me-3"></i>
                      <div>
                        <h5 className="alert-heading mb-1">🎉 You're a Premium Member!</h5>
                        <p className="mb-0">Enjoy 2 free lessons per month and access to premium teachers.</p>
                        {/* {studentPremiumStatus.premiumData && (
                          <small className="text-muted">
                            Premium since: {new Date(studentPremiumStatus.premiumData.paymentDate).toLocaleDateString()}
                          </small>
                        )} */}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="text-center mb-5">
                        <div className="subscription-icon mb-3">
                          <i className="bi bi-star-fill"></i>
                        </div>
                        <h3 className="subscription-title">Premium Learning Experience</h3>
                        <p className="subscription-subtitle text-muted">
                          Unlock the full potential of your learning journey
                        </p>
                      </div>

                      {/* Why Subscription Section */}
                      <div className="why-subscription mb-5">
                        <h4 className="section-title">
                          <i className="bi bi-question-circle me-2"></i>
                          Why subscription is a good choice?
                        </h4>
                        <div className="subscription-description">
                          <p>
                            Are you looking for the best teacher for <strong>maths, science, biology, chemistry, physics, or computer science?</strong> 
                            There are many teachers for the subjects you need support. Do you want to find the best match?
                          </p>
                          <p>
                            The student subscription allows you to join <strong>two free lessons per month</strong> which extend up to 
                            <strong> two hours</strong>. You will be able to choose the best matching teacher without a payment. 
                            If you are not satisfied with one teacher, you can join a free lesson with another teacher.
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
                              <i className="bi bi-calendar-check text-primary"></i>
                              <div>
                                <h6>2 Free Lessons Monthly</h6>
                                <p className="text-muted mb-0">Up to 2 hours of free tutoring each month</p>
                              </div>
                            </div>
                            <div className="benefit-item">
                              <i className="bi bi-people text-primary"></i>
                              <div>
                                <h6>Multiple Teacher Options</h6>
                                <p className="text-muted mb-0">Try different teachers until you find your perfect match</p>
                              </div>
                            </div>
                            <div className="benefit-item">
                              <i className="bi bi-shield-check text-primary"></i>
                              <div>
                                <h6>Quality Guarantee</h6>
                                <p className="text-muted mb-0">All teachers are verified and highly qualified</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="benefit-item">
                              <i className="bi bi-book text-primary"></i>
                              <div>
                                <h6>All Subjects Available</h6>
                                <p className="text-muted mb-0">Math, Science, Biology, Chemistry, Physics, Computer Science</p>
                              </div>
                            </div>
                            <div className="benefit-item">
                              <i className="bi bi-clock text-primary"></i>
                              <div>
                                <h6>Flexible Scheduling</h6>
                                <p className="text-muted mb-0">Book lessons at your convenient time</p>
                              </div>
                            </div>
                            <div className="benefit-item">
                              <i className="bi bi-chat-dots text-primary"></i>
                              <div>
                                <h6>Direct Communication</h6>
                                <p className="text-muted mb-0">Chat directly with your selected teachers</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Section */}
                      <div className="cta-section text-center">
                        <div className="premium-card">
                          <div className="premium-badge">
                            <i className="bi bi-gem"></i>
                            <span>PREMIUM</span>
                          </div>
                          <h5 className="premium-title">Ready to Get Started?</h5>
                          <p className="premium-text">
                            Join thousands of students who have found their perfect learning match
                          </p>
                          <div className="pricing-info mb-3">
                            <span className="price-amount">£29</span>
                            <span className="price-period">/month</span>
                          </div>
                          <button 
                            className="btn btn-premium"
                            onClick={() => setShowPremiumModal(true)}
                          >
                            <i className="bi bi-star-fill me-2"></i>
                            Get Premium Now
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
                <div className="premium-pricing-info text-center mb-4">
                  <div className="h2 text-primary">£29 <small className="text-muted fs-6">/month</small></div>
                  <p className="text-muted">Cancel anytime • 2 free lessons monthly</p>
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
                
                <div className="payment-security-info mt-3">
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-shield-check fs-4 me-3"></i>
                    <div>
                      <small className="fw-bold">Secure Payment</small>
                      <br />
                      <small className="text-muted">Your payment is processed securely by Stripe. We don't store your payment information.</small>
                    </div>
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
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 80px;
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
          transition: all 0.2s ease;
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

        .form-control:read-only {
          background-color: #f8f9fa;
          opacity: 1;
        }

        .is-invalid {
          border-color: #dc3545;
        }

        .invalid-feedback {
          display: block;
        }

        /* Subscription Styles */
        .subscription-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .subscription-icon {
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

        .subscription-title {
          color: #333;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .subscription-subtitle {
          font-size: 1.1rem;
        }

        .section-title {
          color: #333;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .subscription-description {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }

        .subscription-description p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .subscription-description p:last-child {
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

        .premium-title {
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .premium-text {
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .pricing-info {
          margin-bottom: 1.5rem;
        }

        .price-amount {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .price-period {
          font-size: 1rem;
          opacity: 0.8;
        }

        .btn-premium {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }

        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
          color: #667eea;
        }

        .btn-premium:disabled {
          opacity: 0.6;
          transform: none;
          cursor: not-allowed;
        }

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

        .premium-pricing-info {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .payment-security-info .alert {
          border-radius: 10px;
          margin-bottom: 0;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
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

          .subscription-content {
            padding: 1rem;
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

          .modal-body {
            padding: 1rem;
          }

          .modal-footer {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;