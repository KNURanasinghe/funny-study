import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowLoginDropdown(false);
        setShowRegisterDropdown(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
     <header 
  className={`header position-fixed w-100 top-0 transition-all ${isScrolled ? 'scrolled' : ''}`}
  style={{
    zIndex: 1050,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  }}
>
        <nav className="navbar navbar-expand-lg py-3">
          <div className="container">
            {/* Beautiful Logo */}
           {/* Simple Professional Logo */}
<Link className="navbar-brand" to="/" style={{ textDecoration: 'none' }}>
  <div className="d-flex align-items-center">
    {/* Clean Logo Container */}
    <div 
      className="logo-container me-3 position-relative"
      style={{
        width: '50px',
        height: '50px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.25)';
      }}
    >
      {/* Main Icon */}
      <i 
        className="bi bi-mortarboard-fill text-white"
        style={{ 
          fontSize: '1.5rem'
        }}
      ></i>
    </div>
    
    {/* Professional Text Logo */}
    <div className="logo-text-container">
      <div 
        className="logo-main-text fw-bold"
        style={{
          fontSize: '1.5rem',
          color: '#2c3e50',
          letterSpacing: '-0.5px',
          lineHeight: '1.1',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          marginBottom: '2px'
        }}
      >
        Funny Study
      </div>
      
      <div 
        className="logo-subtitle"
        style={{
          color: '#667eea',
          fontSize: '0.75rem',
          fontWeight: '600',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          fontFamily: '"Inter", sans-serif'
        }}
      >
        Learning Academy
      </div>
    </div>
  </div>
</Link>

            {/* Enhanced Mobile Toggle */}
            <button
              className={`navbar-toggler border-0 p-2 ${isMenuOpen ? 'active' : ''}`}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: isScrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                border: isScrolled ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div 
                className="hamburger-lines"
                style={{
                  width: '20px',
                  height: '20px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <span 
                  style={{
                    width: '100%',
                    height: '2px',
                    background: isScrolled ? '#667eea' : '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    transform: isMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                  }}
                ></span>
                <span 
                  style={{
                    width: '100%',
                    height: '2px',
                    background: isScrolled ? '#667eea' : '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    opacity: isMenuOpen ? 0 : 1
                  }}
                ></span>
                <span 
                  style={{
                    width: '100%',
                    height: '2px',
                    background: isScrolled ? '#667eea' : '#fff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
                  }}
                ></span>
              </div>
            </button>

            {/* Enhanced Navigation */}
            <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
              <ul className="navbar-nav mx-auto">
                {[
                  { path: '/', label: 'Home', icon: 'house-fill' },
                  { path: '/find-teachers', label: 'Find Teachers', icon: 'search' },
                  { path: '/student-posts', label: 'Student Posts', icon: 'journal-text' },
                  { path: '/about', label: 'About', icon: 'info-circle' },
                  { path: '/contact', label: 'Contact', icon: 'envelope' }
                ].map((item) => (
                  <li key={item.path} className="nav-item mx-1">
                    <Link 
                      className={`nav-link position-relative px-3 py-2 rounded-pill transition-all ${isActive(item.path)}`}
                      to={item.path}
                    style={{
                      color: isScrolled 
                        ? (isActive(item.path) ? '#fff' : '#495057')
                        : (isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.9)'),
                      fontWeight: isActive(item.path) ? '600' : '500',
                      transition: 'all 0.3s ease',
                      background: isActive(item.path) 
                        ? (isScrolled 
                            ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                            : 'rgba(255, 255, 255, 0.25)')
                        : 'transparent',
                      border: isActive(item.path) && isScrolled 
                        ? 'none' 
                        : isActive(item.path) 
                          ? '1px solid rgba(255, 255, 255, 0.3)' 
                          : 'none'
                    }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.target.style.background = isScrolled 
                            ? 'rgba(102, 126, 234, 0.1)' 
                            : 'rgba(255, 255, 255, 0.2)';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.color = isScrolled ? '#667eea' : '#fff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.target.style.background = 'transparent';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.color = isScrolled ? '#495057' : 'rgba(255, 255, 255, 0.9)';
                        }
                      }}
                    >
                      <i className={`bi bi-${item.icon} me-2`}></i>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Enhanced Auth Section */}
              <div className="auth-buttons d-flex align-items-center gap-3">
                {user ? (
                  <div className="dropdown position-relative">
                    <button
                      className="btn d-flex align-items-center gap-2 border-0 bg-transparent"
                      onClick={() => setShowDropdown(!showDropdown)}
                      style={{
                        color: isScrolled ? '#495057' : '#fff',
                        background: isScrolled 
                          ? 'rgba(102, 126, 234, 0.1)' 
                          : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '25px',
                        padding: '8px 16px',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        border: isScrolled 
                          ? '1px solid rgba(102, 126, 234, 0.2)' 
                          : '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <div 
                        className="user-avatar rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="fw-medium">{user.name}</span>
                      <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'} small`}></i>
                    </button>
                    {showDropdown && (
                      <div 
                        className="dropdown-menu show position-absolute end-0 mt-2 border-0 shadow-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '12px',
                          minWidth: '180px'
                        }}
                      >
                        <Link 
                          className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                          to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                          style={{ margin: '4px 8px' }}
                        >
                          <i className="bi bi-speedometer2 text-primary"></i>
                          Dashboard
                        </Link>
                        <hr className="dropdown-divider my-2" />
                        <button 
                          className="dropdown-item text-danger rounded-2 d-flex align-items-center gap-2 py-2" 
                          onClick={handleLogout}
                          style={{ margin: '4px 8px' }}
                        >
                          <i className="bi bi-box-arrow-right"></i>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    {/* Login Dropdown */}
                    <div className="dropdown position-relative">
                      <button 
                        className="btn btn-primary rounded-pill px-4 py-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Login
                      </button>
                      {showLoginDropdown && (
                        <div 
                          className="dropdown-menu show position-absolute end-0 mt-2 border-0 shadow-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '12px',
                            minWidth: '160px'
                          }}
                        >
                          <Link 
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                            to="/login/student"
                            onClick={() => setShowLoginDropdown(false)}
                            style={{ margin: '4px 8px' }}
                          >
                            <i className="bi bi-person text-success"></i>
                            Student
                          </Link>
                          <Link 
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                            to="/login/teacher"
                            onClick={() => setShowLoginDropdown(false)}
                            style={{ margin: '4px 8px' }}
                          >
                            <i className="bi bi-person-workspace text-primary"></i>
                            Teacher
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Register Dropdown */}
                    <div className="dropdown position-relative">
                      <button 
                        className="btn rounded-pill px-4 py-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
                        style={{
                          borderColor: isScrolled ? '#667eea' : 'rgba(255, 255, 255, 0.7)',
                          color: isScrolled ? '#667eea' : '#fff',
                          background: isScrolled 
                            ? 'transparent' 
                            : 'rgba(255, 255, 255, 0.1)',
                          border: isScrolled 
                            ? '2px solid #667eea' 
                            : '2px solid rgba(255, 255, 255, 0.7)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = isScrolled 
                            ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                            : 'rgba(255, 255, 255, 0.2)';
                          e.target.style.color = '#fff';
                          e.target.style.borderColor = isScrolled ? '#667eea' : '#fff';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = isScrolled 
                            ? 'transparent' 
                            : 'rgba(255, 255, 255, 0.1)';
                          e.target.style.color = isScrolled ? '#667eea' : '#fff';
                          e.target.style.borderColor = isScrolled 
                            ? '#667eea' 
                            : 'rgba(255, 255, 255, 0.7)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <i className="bi bi-person-plus"></i>
                        Register
                      </button>
                      {showRegisterDropdown && (
                        <div 
                          className="dropdown-menu show position-absolute end-0 mt-2 border-0 shadow-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '12px',
                            minWidth: '160px'
                          }}
                        >
                          <Link 
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                            to="/register/student"
                            onClick={() => setShowRegisterDropdown(false)}
                            style={{ margin: '4px 8px' }}
                          >
                            <i className="bi bi-person text-success"></i>
                            Student
                          </Link>
                          <Link 
                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2"
                            to="/register/teacher"
                            onClick={() => setShowRegisterDropdown(false)}
                            style={{ margin: '4px 8px' }}
                          >
                            <i className="bi bi-person-workspace text-primary"></i>
                            Teacher
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Add spacing for fixed header */}
      <div style={{ height: '80px' }}></div>
    </>
  );
};

export default Header;