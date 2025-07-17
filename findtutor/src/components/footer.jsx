import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Newsletter subscription state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Quick links data
  const quickLinks = [
    { title: 'For Students', links: [
      { name: 'Find Teachers', path: '/find-teachers' },
      { name: 'Browse Subjects', path: '/subjects' },
      { name: 'Student Dashboard', path: '/dashboard/student' },
      { name: 'Learning Resources', path: '/resources' }
    ]},
    { title: 'For Teachers', links: [
      { name: 'Create Profile', path: '/register/teacher' },
      { name: 'Teacher Dashboard', path: '/dashboard/teacher' },
      { name: 'Teaching Resources', path: '/teacher-resources' },
      { name: 'Pricing Plans', path: '/pricing' }
    ]},
    { title: 'Company', links: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
      { name: 'Press', path: '/press' }
    ]},
    { title: 'Support', links: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ]}
  ];

  // Social media links
  const socialLinks = [
    { icon: 'bi-facebook', url: '#' },
    { icon: 'bi-twitter', url: '#' },
    { icon: 'bi-instagram', url: '#' },
    { icon: 'bi-linkedin', url: '#' },
    { icon: 'bi-youtube', url: '#' }
  ];

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setMessage('');
    setMessageType('');

    // Validate email
    if (!email.trim()) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

   try {
  const response = await fetch('http://82.25.180.10:4242/api/collections/findtutor_subcriptions/records/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      field: email.trim()  // Make sure this matches what your backend expects
    }),
  });


      if (response.ok) {
        const result = await response.json();
        setMessage('🎉 Thank you for subscribing! You\'ll receive amazing learning tips soon.');
        setMessageType('success');
        setEmail(''); // Clear the input
        console.log('Subscription successful:', result);
      } else {
        // Handle different error responses
        const errorData = await response.json();
        
        if (response.status === 400 && errorData.message?.includes('duplicate')) {
          setMessage('This email is already subscribed to our newsletter.');
          setMessageType('error');
        } else {
          setMessage('Something went wrong. Please try again later.');
          setMessageType('error');
        }
        
        console.error('Subscription failed:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Brand Column */}
            <div className="col-lg-4">
              <div className="footer-brand">
                <Link to="/" className="d-flex align-items-center mb-3">
                  <div className="logo-icon me-3">
                    <i className="bi bi-emoji-laughing-fill"></i>
                    <div className="academic-badge">
                      <i className="bi bi-mortarboard-fill"></i>
                    </div>
                  </div>
                  <div>
                    <span className="logo-text">Funny Study</span>
                    <div className="logo-subtitle">Learning Academy</div>
                  </div>
                </Link>
                <p className="footer-description">
                  Where learning meets fun! Connecting passionate teachers with motivated students worldwide. 
                  Join our community and transform education into an enjoyable journey of discovery.
                </p>
                <div className="fun-stats mb-4">
                  <div className="stat-item">
                    <i className="bi bi-people-fill"></i>
                    <span>50,000+ Happy Students</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-star-fill"></i>
                    <span>4.9/5 Average Rating</span>
                  </div>
                </div>
                <div className="social-links">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index}
                      href={social.url}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={`bi ${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links Columns */}
            {quickLinks.map((section, index) => (
              <div key={index} className="col-6 col-md-3 col-lg-2">
                <h5 className="footer-title">{section.title}</h5>
                <ul className="footer-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.path} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h4 className="newsletter-title">
                <i className="bi bi-envelope-heart me-2"></i>
                Stay Updated with Fun Learning Tips!
              </h4>
              <p className="newsletter-description">
                Get the latest study tips, fun learning methods, and educational resources delivered to your inbox.
              </p>
              
              {/* Message Display */}
              {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} newsletter-alert`}>
                  {message}
                </div>
              )}
              
              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="input-group">
                  <input 
                    type="email" 
                    className="form-control newsletter-input" 
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button 
                    className="btn newsletter-btn" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright">
                © {new Date().getFullYear()} Funny Study Learning Academy. All rights reserved. Made with 💙 for learners worldwide.
              </p>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
                <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
                <Link to="/cookies" className="footer-bottom-link">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: #ffffff;
          padding-top: 4rem;
        }

        .footer-main {
          padding-bottom: 3rem;
        }

        .footer-brand {
          max-width: 350px;
        }

        .logo-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          position: relative;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .academic-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }

        .logo-text {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: #a0aec0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 2px;
        }

        .footer-description {
          color: #cbd5e0;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .fun-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
        }

        .stat-item i {
          color: #667eea;
          font-size: 1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          color: #a0aec0;
          font-size: 1.25rem;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .social-link:hover {
          color: #667eea;
          transform: translateY(-2px);
          background: rgba(102, 126, 234, 0.1);
        }

        .footer-title {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          color: #cbd5e0;
          text-decoration: none;
          display: block;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .footer-link:hover {
          color: #ffffff;
          transform: translateX(5px);
        }

        .newsletter-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 2.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .newsletter-title {
          color: #ffffff;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .newsletter-description {
          color: #cbd5e0;
          margin-bottom: 2rem;
        }

        .newsletter-form {
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-alert {
          max-width: 500px;
          margin: 0 auto 1.5rem auto;
          border: none;
          border-radius: 10px;
          font-weight: 500;
        }

        .alert-success {
          background: rgba(40, 167, 69, 0.2);
          color: #90ee90;
          border: 1px solid rgba(40, 167, 69, 0.3);
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.2);
          color: #ffb3ba;
          border: 1px solid rgba(220, 53, 69, 0.3);
        }

        .newsletter-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 25px 0 0 25px;
          transition: all 0.3s ease;
        }

        .newsletter-input::placeholder {
          color: #a0aec0;
        }

        .newsletter-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          color: #ffffff;
        }

        .newsletter-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .newsletter-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 0 25px 25px 0;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 130px;
        }

        .newsletter-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .newsletter-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        .footer-bottom {
          padding: 1.5rem 0;
        }

        .copyright {
          color: #a0aec0;
          margin: 0;
          font-size: 0.875rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
          justify-content: flex-end;
        }

        .footer-bottom-link {
          color: #a0aec0;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .footer-bottom-link:hover {
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .footer {
            padding-top: 3rem;
          }

          .footer-bottom-links {
            justify-content: flex-start;
            margin-top: 1rem;
          }

          .footer-brand {
            max-width: 100%;
            margin-bottom: 2rem;
          }

          .fun-stats {
            flex-direction: column;
          }

          .newsletter-form .input-group {
            flex-direction: column;
          }

          .newsletter-input {
            border-radius: 25px;
            margin-bottom: 1rem;
          }

          .newsletter-btn {
            border-radius: 25px;
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;