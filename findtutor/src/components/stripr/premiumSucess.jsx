import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const STRIPE_SERVER_URL = 'http://82.25.180.10:4242';
const POCKETBASE_URL = 'http://127.0.0.1:8090';

const PremiumSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);

  // Content form state
  const [contentForm, setContentForm] = useState({
    link_or_video: true,
    link1: '',
    link2: '',
    link3: '',
    video1: null,
    video2: null,
    video3: null
  });
  const [contentErrors, setContentErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const teacherEmail = searchParams.get('teacher_email');

      if (!sessionId || !teacherEmail) {
        setError('Missing payment information');
        setLoading(false);
        return;
      }

      try {
        // Verify the payment status with Stripe
        const paymentResponse = await axios.get(`${STRIPE_SERVER_URL}/check-payment/${sessionId}`);
        
        if (paymentResponse.data.paymentStatus !== 'paid') {
          setError('Payment not completed');
          setLoading(false);
          return;
        }

        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check premium status
        const premiumResponse = await axios.get(`${STRIPE_SERVER_URL}/check-premium-status/${encodeURIComponent(teacherEmail)}`);
        
        if (premiumResponse.data.hasPremium && premiumResponse.data.isPaid) {
          setPremiumData(premiumResponse.data.premiumData);
          setSuccess(true);
        } else {
          setError('Premium activation is still processing. Please check back in a few minutes.');
        }
      } catch (error) {
        console.error('Error processing premium payment:', error);
        setError(error.response?.data?.error || 'Failed to process premium payment');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate('/dashboard/teacher?tab=premium');
  };

  const handleAddContent = () => {
    setContentForm({
      link_or_video: true,
      link1: '',
      link2: '',
      link3: '',
      video1: null,
      video2: null,
      video3: null
    });
    setShowContentModal(true);
  };

  const validateContentForm = () => {
    const errors = {};
    
    if (contentForm.link_or_video) {
      // Validate YouTube links
      if (!contentForm.link1.trim()) {
        errors.link1 = 'Video link 1 is required';
      } else if (!isValidYouTubeUrl(contentForm.link1)) {
        errors.link1 = 'Please enter a valid YouTube URL';
      }
      
      if (!contentForm.link2.trim()) {
        errors.link2 = 'Video link 2 is required';
      } else if (!isValidYouTubeUrl(contentForm.link2)) {
        errors.link2 = 'Please enter a valid YouTube URL';
      }
      
      if (!contentForm.link3.trim()) {
        errors.link3 = 'Video link 3 is required';
      } else if (!isValidYouTubeUrl(contentForm.link3)) {
        errors.link3 = 'Please enter a valid YouTube URL';
      }
    } else {
      // Validate video uploads
      if (!contentForm.video1) {
        errors.video1 = 'Video 1 is required';
      }
      if (!contentForm.video2) {
        errors.video2 = 'Video 2 is required';
      }
      if (!contentForm.video3) {
        errors.video3 = 'Video 3 is required';
      }
    }
    
    setContentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
  };

  const handleContentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (contentErrors[name]) {
      setContentErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVideoUpload = (videoNumber, file) => {
    setContentForm(prev => ({
      ...prev,
      [`video${videoNumber}`]: file
    }));
    
    // Clear validation error
    if (contentErrors[`video${videoNumber}`]) {
      setContentErrors(prev => ({
        ...prev,
        [`video${videoNumber}`]: ''
      }));
    }
  };

  const handleContentSubmit = async () => {
    if (!validateContentForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (contentForm.link_or_video) {
        // Submit with YouTube links
        const response = await fetch(`${STRIPE_SERVER_URL}/update-premium-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherEmail: user?.email,
            contentData: {
              link_or_video: true,
              link1: contentForm.link1,
              link2: contentForm.link2,
              link3: contentForm.link3,
            }
          }),
        });

        if (response.ok) {
          setShowContentModal(false);
          // Refresh premium data
          const premiumResponse = await axios.get(`${STRIPE_SERVER_URL}/check-premium-status/${encodeURIComponent(user?.email)}`);
          setPremiumData(premiumResponse.data.premiumData);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to update content');
        }
      } else {
        // Submit with video files directly to PocketBase
        const formData = new FormData();
        formData.append('link_or_video', false);
        formData.append('video1', contentForm.video1);
        formData.append('video2', contentForm.video2);
        formData.append('video3', contentForm.video3);

        // First get the existing record ID
        const checkResponse = await fetch(`${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records?filter=(mail='${user?.email}')`);
        const checkData = await checkResponse.json();
        
        if (checkData.items && checkData.items.length > 0) {
          const recordId = checkData.items[0].id;
          
          const response = await fetch(`${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records/${recordId}`, {
            method: 'PATCH',
            body: formData,
          });

          if (response.ok) {
            setShowContentModal(false);
            // Refresh premium data
            const premiumResponse = await axios.get(`${STRIPE_SERVER_URL}/check-premium-status/${encodeURIComponent(user?.email)}`);
            setPremiumData(premiumResponse.data.premiumData);
          } else {
            setError('Failed to upload videos');
          }
        }
      }
    } catch (error) {
      console.error('Content submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideoPreview = (link, index) => {
    if (!link) return null;

    const videoId = extractYouTubeVideoId(link);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
      <div key={index} className="video-preview-item">
        <div className="video-frame">
          <iframe
            src={embedUrl}
            title={`Teaching Video ${index + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          />
        </div>
        <p className="video-title">Teaching Video {index + 1}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Processing your premium payment...</h4>
            <p className="text-muted">Please wait while we activate your premium subscription.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Premium Activation Error
                </h4>
              </div>
              <div className="card-body text-center">
                <p className="card-text mb-4">{error}</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={handleGoToDashboard}
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Go to Dashboard
                  </button>
                  <a href="mailto:support@example.com" className="btn btn-outline-secondary">
                    <i className="bi bi-envelope me-2"></i>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card border-success shadow-lg">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-star-fill me-2"></i>
                Premium Subscription Activated!
              </h4>
            </div>
            <div className="card-body">
              {/* Success Message */}
              <div className="text-center mb-4">
                <div className="success-icon mb-3">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="text-success">Welcome to Premium!</h3>
                <p className="text-muted">
                  Your premium subscription has been activated successfully. You can now showcase your teaching videos and connect directly with students.
                </p>
              </div>

              {/* Premium Features */}
              <div className="premium-features mb-4">
                <h5 className="text-center mb-4">
                  <i className="bi bi-gem me-2"></i>
                  Premium Features Unlocked
                </h5>
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <div className="feature-box">
                      <i className="bi bi-camera-video text-primary" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Video Showcase</h6>
                      <p className="text-muted small">Upload or link up to 3 teaching videos</p>
                    </div>
                  </div>
                  <div className="col-md-4 text-center mb-3">
                    <div className="feature-box">
                      <i className="bi bi-person-lines-fill text-primary" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Direct Contact</h6>
                      <p className="text-muted small">Share contact details in your videos</p>
                    </div>
                  </div>
                  <div className="col-md-4 text-center mb-3">
                    <div className="feature-box">
                      <i className="bi bi-graph-up-arrow text-primary" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Higher Visibility</h6>
                      <p className="text-muted small">Premium badge and priority listing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Content Status */}
              <div className="content-status mb-4">
                <h5>
                  <i className="bi bi-collection-play me-2"></i>
                  Your Teaching Videos
                </h5>
                
                {premiumData && (premiumData.link1 || premiumData.link2 || premiumData.link3) ? (
                  <div className="row">
                    {[1, 2, 3].map((num) => {
                      const link = premiumData[`link${num}`];
                      return link ? (
                        <div key={num} className="col-md-4 mb-3">
                          {renderVideoPreview(link, num)}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-camera-video-off text-muted" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-3 text-muted">No videos added yet</h6>
                    <p className="text-muted">Add your teaching videos to start attracting students!</p>
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="next-steps mb-4">
                <h5>
                  <i className="bi bi-list-check me-2"></i>
                  Next Steps
                </h5>
                <div className="alert alert-info">
                  <ul className="mb-0">
                    <li>Add your teaching videos using the button below</li>
                    <li>Include your contact details in your videos for direct student contact</li>
                    <li>Update your profile and create teaching posts</li>
                    <li>Your premium badge will appear on your profile automatically</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center">
                <button 
                  className="btn btn-primary btn-lg me-3"
                  onClick={handleAddContent}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Teaching Videos
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleGoToDashboard}
                >
                  <i className="bi bi-house-door me-2"></i>
                  Go to Dashboard
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-4 text-center">
                <small className="text-muted">
                  Need help with your premium features? Contact us at{' '}
                  <a href="mailto:support@example.com" className="text-decoration-none">
                    support@example.com
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Modal */}
      {showContentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-camera-video me-2"></i>
                  Add Your Teaching Videos
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowContentModal(false)}
                  disabled={submitting}
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
                        checked={contentForm.link_or_video}
                        onChange={() => setContentForm(prev => ({ ...prev, link_or_video: true }))}
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
                        checked={!contentForm.link_or_video}
                        onChange={() => setContentForm(prev => ({ ...prev, link_or_video: false }))}
                      />
                      <label className="form-check-label" htmlFor="uploadVideos">
                        <strong>Upload Videos</strong> - Upload new video files
                      </label>
                    </div>
                  </div>
                </div>

                {/* YouTube Links Section */}
                {contentForm.link_or_video ? (
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
                          className={`form-control ${contentErrors[`link${num}`] ? 'is-invalid' : ''}`}
                          name={`link${num}`}
                          value={contentForm[`link${num}`]}
                          onChange={handleContentInputChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {contentErrors[`link${num}`] && (
                          <div className="invalid-feedback">{contentErrors[`link${num}`]}</div>
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
                          className={`form-control ${contentErrors[`video${num}`] ? 'is-invalid' : ''}`}
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(num, e.target.files[0])}
                        />
                        {contentForm[`video${num}`] && (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            {contentForm[`video${num}`].name}
                          </small>
                        )}
                        {contentErrors[`video${num}`] && (
                          <div className="invalid-feedback">{contentErrors[`video${num}`]}</div>
                        )}
                        <small className="form-text text-muted">
                          Supported formats: MP4, AVI, MOV (Max 50MB)
                        </small>
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructions */}
                <div className="content-instructions mt-4">
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
                  onClick={() => setShowContentModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleContentSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Save Videos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .success-icon {
          animation: bounce 1s ease-in-out;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .feature-box {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          height: 100%;
        }

        .content-status {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .video-preview-item {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .video-frame {
          position: relative;
          width: 100%;
          height: 200px;
          background: #000;
        }

        .video-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-title {
          padding: 0.75rem;
          margin: 0;
          text-align: center;
          font-weight: 500;
          color: #374151;
          background: #f9fafb;
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

        .content-instructions .alert {
          border-radius: 10px;
        }

        .modal-content {
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }

        .modal-header {
          border-bottom: none;
        }

        .modal-footer {
          border-top: 1px solid #f0f0f0;
        }

        .next-steps {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #bae6fd;
        }

        .premium-features {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default PremiumSuccess;