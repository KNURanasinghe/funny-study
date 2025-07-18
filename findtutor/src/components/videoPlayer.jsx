import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const VideoPlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get video ID from URL params, default to a demo video
  const videoUrl = searchParams.get('url') || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Add escape key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  if (!embedUrl) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center text-white">
          <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
          <h3>Invalid Video URL</h3>
          <p className="text-white-50 mb-4">Sorry, we couldn't load the video. Please try again.</p>
          <button 
            className="btn btn-primary"
            onClick={handleClose}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-vh-100 position-relative"
      style={{
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Close Button */}
      <button
        className="btn position-fixed top-0 end-0 m-4 z-3"
        onClick={handleClose}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          zIndex: 1050,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        <i className="bi bi-x-lg text-white fs-5"></i>
      </button>

      {/* Back Button */}
      <button
        className="btn position-fixed top-0 start-0 m-4 z-3"
        onClick={handleClose}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '25px',
          zIndex: 1050,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'translateX(0)';
        }}
      >
        <i className="bi bi-arrow-left text-white me-2"></i>
        <span className="text-white">Back to Home</span>
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1040, background: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div className="text-center text-white">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="fw-light">Loading Demo Video...</h4>
            <p className="text-white-50">Please wait while we prepare your video</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-fluid h-100 d-flex align-items-center justify-content-center p-4">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-xl-10 col-xxl-8">
            {/* Video Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center bg-primary bg-opacity-25 rounded-pill px-4 py-2 mb-3">
                <i className="bi bi-play-circle-fill text-primary me-2 fs-5"></i>
                <span className="text-white fw-medium">Platform Demo</span>
              </div>
              <h1 className="display-6 fw-bold text-white mb-3">
                See Funny Study Learning in Action
              </h1>
              <p className="lead text-white-50 mb-0">
                Discover how our platform connects students and teachers for amazing learning experiences
              </p>
            </div>

            {/* Video Container */}
            <div 
              className="position-relative mx-auto"
              style={{
                maxWidth: '1200px',
                aspectRatio: '16/9',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Video Frame */}
              <iframe
                src={embedUrl}
                className="w-100 h-100"
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Funny Study Learning Demo"
                onLoad={() => setIsLoading(false)}
              />
              
              {/* Overlay for styling */}
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                  mixBlendMode: 'overlay'
                }}
              ></div>
            </div>

            {/* Video Controls Info */}
            <div className="row mt-4 text-center">
              <div className="col-md-4">
                <div 
                  className="p-3 rounded-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <i className="bi bi-fullscreen text-primary fs-4 mb-2"></i>
                  <div className="text-white small">
                    <div className="fw-semibold">Full Screen</div>
                    <div className="text-white-50">Click the fullscreen icon</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="p-3 rounded-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <i className="bi bi-gear text-primary fs-4 mb-2"></i>
                  <div className="text-white small">
                    <div className="fw-semibold">Quality Settings</div>
                    <div className="text-white-50">Adjust video quality</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="p-3 rounded-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <i className="bi bi-keyboard text-primary fs-4 mb-2"></i>
                  <div className="text-white small">
                    <div className="fw-semibold">Keyboard Shortcuts</div>
                    <div className="text-white-50">Press ESC to exit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-5">
              <div 
                className="d-inline-block p-4 rounded-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h4 className="text-white fw-bold mb-3">Ready to Get Started?</h4>
                <p className="text-white-50 mb-4">Join thousands of students and teachers already using our platform</p>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <button 
                    className="btn btn-primary btn-lg rounded-pill px-4"
                    onClick={() => navigate('/find-teachers')}
                    style={{
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <i className="bi bi-search me-2"></i>
                    Find Teachers
                  </button>
                  <button 
                    className="btn btn-primary btn-lg rounded-pill px-4"
                    onClick={() => navigate('/find-teachers')}
                    style={{
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <i className="bi bi-people me-2"></i>
                    Find Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: -1 }}>
        <div className="position-absolute" style={{
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div className="position-absolute" style={{
          top: '60%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse'
        }}></div>
        <div className="position-absolute" style={{
          bottom: '20%',
          left: '15%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;