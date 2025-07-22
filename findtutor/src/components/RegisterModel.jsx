import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const RegistrationSelectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelection = (userType) => {
    setSelectedType(userType);
    setIsAnimating(true);
    
    // Add animation delay before navigation
    setTimeout(() => {
      if (userType === 'student') {
        navigate('/register/student');
      } else if (userType === 'teacher') {
        navigate('/register/teacher');
      }
      onClose();
      setIsAnimating(false);
      setSelectedType('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px',
          padding: '3rem',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1.2rem'
          }}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Background Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
            color: 'white',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          
          <h2 style={{
            color: 'white',
            fontWeight: '700',
            marginBottom: '0.75rem',
            fontSize: '2.2rem',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            Join Our Community
          </h2>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            margin: 0,
            textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)'
          }}>
            Choose how you'd like to get started with Funny Study Learning
          </p>
        </div>

        {/* Registration Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Student Registration */}
          <div
            style={{
              background: selectedType === 'student' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedType === 'student' ? 'scale(1.05)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => handleSelection('student')}
            onMouseEnter={(e) => {
              if (selectedType !== 'student') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'student') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Student Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.8rem',
              color: 'white',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
            }}>
              <i className="bi bi-person-workspace"></i>
            </div>
            
            <h4 style={{
              color: 'white',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.3rem'
            }}>
              I'm a Student
            </h4>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              margin: 0
            }}>
              Find qualified teachers, post learning requests, and get personalized tutoring
            </p>

            {/* Features List */}
            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                Browse qualified teachers
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                Post learning requests
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#10b981' }}></i>
                Get personalized help
              </div>
            </div>
          </div>

          {/* Teacher Registration */}
          <div
            style={{
              background: selectedType === 'teacher' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedType === 'teacher' ? 'scale(1.05)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => handleSelection('teacher')}
            onMouseEnter={(e) => {
              if (selectedType !== 'teacher') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'teacher') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Teacher Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.8rem',
              color: 'white',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
            }}>
              <i className="bi bi-mortarboard"></i>
            </div>
            
            <h4 style={{
              color: 'white',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1.3rem'
            }}>
              I'm a Teacher
            </h4>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              margin: 0
            }}>
              Share your expertise, connect with students, and earn money teaching
            </p>

            {/* Features List */}
            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#3b82f6' }}></i>
                Create teacher profile
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#3b82f6' }}></i>
                Connect with students
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="bi bi-check-circle-fill me-2" style={{ color: '#3b82f6' }}></i>
                Earn money teaching
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <i className="bi bi-shield-check" style={{ color: '#10b981' }}></i>
            100% Free to get started • No credit card required
          </p>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }

          @media (max-width: 768px) {
            .registration-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .modal-content {
              padding: 2rem 1.5rem !important;
              margin: 1rem !important;
            }
            
            .modal-title {
              font-size: 1.8rem !important;
            }
            
            .option-card {
              padding: 1.5rem 1rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// Example usage component showing how to integrate with your existing code
const ExampleUsage = () => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleGetStartedClick = () => {
    setShowRegistrationModal(true);
  };

  const handleCloseModal = () => {
    setShowRegistrationModal(false);
  };

  return (
    <div>
      {/* Your existing Get Started button */}
      <button 
        className="btn btn-light btn-lg rounded-pill px-4 fw-semibold"
        style={{
          boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease'
        }}
        onClick={handleGetStartedClick}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(255,255,255,0.2)';
        }}
      >
        <i className="bi bi-person-plus me-2"></i>
        Get Started Now
      </button>

      {/* Registration Selection Modal */}
      <RegistrationSelectionModal 
        isOpen={showRegistrationModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default RegistrationSelectionModal;