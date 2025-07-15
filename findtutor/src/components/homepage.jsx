import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from './header';
import Footer from './footer';


const EduLink = () => {
  const [isOpen, setIsOpen] =
   useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();

    useEffect(() => { window.scrollTo(0, 0); }, []);
// Add this state at the top of your component
const [selectedUserType, setSelectedUserType] = useState('');
const [showOptions, setShowOptions] = useState(false);

// Add this function to handle navigation
const handleUserTypeSelect = (userType) => {
  setSelectedUserType(userType);
  setShowOptions(false);
  
  // Add a small delay for animation effect
  setTimeout(() => {
    if (userType === 'student') {
      navigate("/find-teachers");
    } else if (userType === 'teacher') {
      navigate("/student-posts");
    }
  }, 300);
};

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
 const navigateFindteachers = ()=>{
   navigate("/find-teachers");
 }
  // Navigation links
  const navLinks = [
    { id: 'home', name: 'Home', href: '#' },
    { id: 'teachers', name: 'Find Teachers', href: '#' },
    { id: 'students', name: 'For Students', href: '#' },
    { id: 'about', name: 'About Us', href: '#' },
    { id: 'contact', name: 'Contact', href: '#' }
  ];

  // Popular subjects data
  const popularSubjects = [
    { name: 'Mathematics', icon: '📐', students: 24500 },
    { name: 'English', icon: '📚', students: 21800 },
    { name: 'Science', icon: '🔬', students: 19200 },
    { name: 'Computer Science', icon: '💻', students: 18700 },
    { name: 'History', icon: '🏛️', students: 15300 },
    { name: 'Languages', icon: '🌎', students: 14200 }
  ];

  // Featured teachers data
  const featuredTeachers = [
    {
      id: 1,
      name: 'Dr. Emily Johnson',
      subject: 'Mathematics',
      price: '$35/hr',
      location: 'New York, USA',
      rating: 4.9,
      reviews: 236,
      image: '/api/placeholder/300/300'
    },
    {
      id: 2,
      name: 'Prof. David Chen',
      subject: 'Physics',
      price: '$40/hr',
      location: 'Boston, USA',
      rating: 4.8,
      reviews: 195,
      image: '/api/placeholder/300/300'
    },
    {
      id: 3,
      name: 'Sarah Williams',
      subject: 'English Literature',
      price: '$30/hr',
      location: 'London, UK',
      rating: 4.7,
      reviews: 168,
      image: '/api/placeholder/300/300'
    },
    {
      id: 4,
      name: 'Michael Rodriguez',
      subject: 'Computer Science',
      price: '$45/hr',
      location: 'San Francisco, USA',
      rating: 4.9,
      reviews: 218,
      image: '/api/placeholder/300/300'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      author: 'Sophia Garcia',
      role: 'Student, Psychology',
      content: 'EduLink completely transformed my learning experience. I found a perfect tutor who helped me improve my grades dramatically in just two months!',
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      author: 'James Wilson',
      role: 'Math Teacher',
      content: 'As a teacher, EduLink has allowed me to connect with motivated students and share my passion for mathematics. The platform is intuitive and professional.',
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      author: 'Emma Thompson',
      role: 'Parent',
      content: 'Finding a qualified tutor for my daughter was so easy with EduLink. The verification process gave me confidence, and the results speak for themselves!',
      image: '/api/placeholder/100/100'
    }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Replace old header with new Header component */}
    
      
    {/* Hero Section */}
<section className="position-relative overflow-hidden" style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  minHeight: '100vh'
}}>
  {/* Animated Background Elements */}
  <div className="position-absolute top-0 start-0 end-0 bottom-0">
    {/* Floating Circles */}
    <div className="position-absolute" style={{
      top: '10%',
      left: '10%',
      width: '300px',
      height: '300px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite'
    }}></div>
    <div className="position-absolute" style={{
      top: '60%',
      right: '15%',
      width: '200px',
      height: '200px',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite reverse'
    }}></div>
    <div className="position-absolute" style={{
      bottom: '20%',
      left: '20%',
      width: '150px',
      height: '150px',
      background: 'rgba(255, 255, 255, 0.06)',
      borderRadius: '50%',
      animation: 'float 7s ease-in-out infinite'
    }}></div>
    
    {/* Geometric Shapes */}
    <div className="position-absolute" style={{
      top: '30%',
      right: '10%',
      width: '80px',
      height: '80px',
      background: 'rgba(255, 255, 255, 0.1)',
      transform: 'rotate(45deg)',
      animation: 'rotate 20s linear infinite'
    }}></div>
    <div className="position-absolute" style={{
      bottom: '40%',
      left: '5%',
      width: '60px',
      height: '60px',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      animation: 'float 9s ease-in-out infinite'
    }}></div>
  </div>
  
  {/* Main Content */}
  <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
    <div className="row align-items-center min-vh-100">
      <div className="col-lg-6 mb-5 mb-lg-0">
        {/* Badge */}
        <div className="mb-4">
          <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-semibold shadow-sm">
            <i className="bi bi-star-fill me-2 text-warning"></i>
            #1 Education Platform
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="display-3 fw-bold text-white mb-4 lh-1">
          Connect with the 
          <span className="d-block position-relative">
            Perfect Teacher
            <svg className="position-absolute bottom-0 start-0" width="100%" height="20" viewBox="0 0 300 20">
              <path d="M5,15 Q150,5 295,15" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
          for Your Journey
        </h1>
        
        {/* Subtitle */}
        <p className="lead text-white mb-5 opacity-90" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
          Funny Study Learning brings students and teachers together for personalized learning experiences that inspire academic success and unlock your full potential.
        </p>
        
        {/* CTA Buttons - Simple */}
        <div className="mb-4">
          {/* <p className="text-white opacity-90 mb-3 fw-medium">I'm looking for:</p> */}
           <h4 
              className="text-white fw-bold mb-2"
              style={{
                fontSize: '1.3rem',
                textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4)',
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              Always 100% FREE
              <i className="bi bi-check-circle-fill text-success ms-2"></i>
            </h4>
            <p className="text-white opacity-90 mb-2">No hidden fees • No credit card required</p>
          
          <div className="d-flex flex-wrap gap-3">
            <button 
              className="btn btn-light btn-lg px-4 py-3 rounded-pill fw-semibold"
              onClick={() => navigate("/find-teachers")}
              style={{
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255,255,255,0.2)';
              }}
            >
              <i className="bi bi-mortarboard me-2"></i>
              Find Teachers
            </button>
            
            <button 
              className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-semibold"
              onClick={() => navigate("/student-posts")}
              style={{
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              <i className="bi bi-person-workspace me-2"></i>
              Find Students
            </button>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="d-flex align-items-center gap-4 text-white opacity-80">
          <div className="d-flex align-items-center">
            <div className="d-flex me-2">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="bi bi-star-fill text-warning me-1"></i>
              ))}
            </div>
            <span className="small">4.9/5 rating</span>
          </div>
          <div className="vr opacity-50"></div>
          <div className="small">
            <i className="bi bi-people-fill me-2"></i>
            50,000+ students
          </div>
        </div>
      </div>
      
      {/* Right Side - Image/Visual */}
      <div className="col-lg-6">
        <div className="position-relative">
          {/* Main Image Container */}
          <div className="position-relative">
            {/* Background Glow */}
            <div className="position-absolute top-50 start-50 translate-middle" style={{
              width: '120%',
              height: '120%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>
            
            {/* Image */}
            <img 
              src="https://www.twigscience.com/wp-content/uploads/2022/05/GettyImages-974018398-RF-scaled.jpg" 
              alt="Students and teacher collaborating" 
              className="img-fluid shadow-lg position-relative"
              style={{
                borderRadius: '24px',
                transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                filter: 'brightness(1.1) contrast(1.1)'
              }}
            />
            
            {/* Floating Subject Cards - Multiple Subjects */}
            {/* <div className="position-absolute top-0 start-0 translate-middle" style={{
              animation: 'float 6s ease-in-out infinite'
              }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-success rounded-circle p-2 me-3">
                    <i className="bi bi-calculator text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Mathematics</div>
                    <div className="text-muted small">Expert Available</div>
                  </div>
                </div>
              </div>
            </div> */}
            
            {/* <div className="position-absolute" style={{
              top: '15%',
              right: '-10%',
              animation: 'float 7s ease-in-out infinite delay-1s'
             }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-primary rounded-circle p-2 me-3">
                    <i className="bi bi-flask text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Chemistry</div>
                    <div className="text-muted small">5 Teachers Online</div>
                  </div>
                </div>
              </div>
              </div>
            
              <div className="position-absolute" style={{
              top: '45%',
              left: '-15%',
              animation: 'float 8s ease-in-out infinite delay-2s'
             }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-warning rounded-circle p-2 me-3">
                    <i className="bi bi-book text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">English</div>
                    <div className="text-muted small">Native Speakers</div>
                  </div>
                </div>
              </div>
              </div>
            
              <div className="position-absolute bottom-0 end-0 translate-middle" style={{
              animation: 'float 8s ease-in-out infinite reverse'
              }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-info rounded-circle p-2 me-3">
                    <i className="bi bi-laptop text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Computer Science</div>
                    <div className="text-muted small">Programming & More</div>
                  </div>
                </div>
              </div>
             </div>
            
             <div className="position-absolute" style={{
              bottom: '15%',
              left: '-5%',
              animation: 'float 9s ease-in-out infinite delay-3s'
             }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-danger rounded-circle p-2 me-3">
                    <i className="bi bi-heart-pulse text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Biology</div>
                    <div className="text-muted small">Life Sciences</div>
                  </div>
                </div>
              </div>
              </div>
            
              <div className="position-absolute" style={{
              top: '70%',
              right: '0%',
              animation: 'float 7s ease-in-out infinite delay-4s'
            }}>
              <div className="bg-white rounded-3 shadow-lg p-3" style={{ 
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="d-flex align-items-center">
                  <div className="bg-dark rounded-circle p-2 me-3">
                    <i className="bi bi-globe text-white"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Geography</div>
                    <div className="text-muted small">World Experts</div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
    
    {/* Stats Section */}
    <div className="row mt-5 g-4">
      {[
        { number: '10,000+', label: 'Expert Teachers', icon: 'person-check' },
        { number: '50,000+', label: 'Active Students', icon: 'people' },
        { number: '100+', label: 'Subjects', icon: 'book' },
        { number: '4.9/5', label: 'Average Rating', icon: 'star-fill' }
      ].map((stat, index) => (
        <div key={index} className="col-6 col-md-3">
          <div 
            className="text-center p-4 rounded-4 border-0 h-100"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div className="mb-3">
              <i className={`bi bi-${stat.icon} text-white opacity-75`} style={{ fontSize: '2rem' }}></i>
            </div>
            <h3 className="fw-bold text-white mb-2">{stat.number}</h3>
            <p className="text-white opacity-75 mb-0 small">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
  
  {/* Custom CSS for Animations */}
  <style jsx>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes rotate {
      0% { transform: rotate(45deg); }
      100% { transform: rotate(405deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slidePattern {
      0% { background-position: 0 0; }
      100% { background-position: 40px 40px; }
    }
  `}</style>
</section>
      
      {/* How It Works */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">How Funny Study Works</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our platform makes it simple to connect with teachers or students in just a few steps
            </p>
          </div>
          
          <div className="row g-4">
            {/* Step 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center position-relative transition" onClick={() => navigate('/find-teachers')} style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-search fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Find or Request</h3>
                <p className="text-muted">
                  Search for teachers by subject or post a specific request. Browse profiles, credentials, and reviews.
                </p>
                <div className="position-absolute end-0 top-50 translate-middle-y d-none d-md-block">
                  <i className="bi bi-chevron-right text-primary fs-3"></i>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center position-relative transition" onClick={() => navigate('/find-teachers')} style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Connect</h3>
                <p className="text-muted">
                  Message teachers or students directly, discuss your learning goals, and schedule lessons.
                </p>
                <div className="position-absolute end-0 top-50 translate-middle-y d-none d-md-block">
                  <i className="bi bi-chevron-right text-primary fs-3"></i>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center transition" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-award-fill fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Learn & Succeed</h3>
                <p className="text-muted">
                  Receive personalized education, track your progress, and achieve your academic goals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 text-center">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register/teacher')}>
              Get Started Now
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>
      
      {/* Popular Subjects */}
      {/* <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Popular Subjects</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Discover the most sought-after subjects on our platform
            </p>
          </div>
          
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-4">
            {popularSubjects.map((subject, index) => (
              <div key={index} className="col">
                <div className="card h-100 border-0 shadow-sm rounded-3 p-3 text-center hover-shadow">
                  <div className="fs-1 mb-2">{subject.icon}</div>
                  <h3 className="fs-5 fw-bold mb-1">{subject.name}</h3>
                  <p className="small text-muted mb-0">{subject.students.toLocaleString()} students</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="btn btn-link text-primary fw-bold">
              View All Subjects
              <i className="bi bi-arrow-right ms-1"></i>
            </a>
          </div>
        </div>
      </section> */}
      
      {/* Featured Teachers */}
      {/* <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Featured Teachers</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Learn from our top-rated experienced educators
            </p>
          </div>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {featuredTeachers.map((teacher) => (
              <div key={teacher.id} className="col">
                <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden hover-shadow">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="card-img-top"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  />
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h3 className="card-title fs-5 fw-bold mb-0">{teacher.name}</h3>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">
                        {teacher.price}
                      </span>
                    </div>
                    <p className="text-primary fw-medium">{teacher.subject}</p>
                    <div className="d-flex align-items-center mt-2 text-muted small">
                      <i className="bi bi-geo-alt me-1"></i>
                      {teacher.location}
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <div className="text-warning d-flex align-items-center">
                        <i className="bi bi-star-fill"></i>
                        <span className="ms-1 fw-medium">{teacher.rating}</span>
                      </div>
                      <span className="mx-2 text-muted">•</span>
                      <span className="text-muted small">{teacher.reviews} reviews</span>
                    </div>
                    <button className="btn btn-primary w-100 mt-3">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="btn btn-outline-primary">
              Browse All Teachers
              <i className="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </section> */}
      
      {/* Testimonials */}
      <section className="py-5" style={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Background decoration */}
  <div className="position-absolute w-100 h-100" style={{
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    backgroundSize: '30px 30px'
  }}></div>
  
  <div className="container py-5 position-relative">
    <div className="text-center mb-5">
      <div className="d-inline-flex align-items-center bg-white bg-opacity-25 rounded-pill px-3 py-2 mb-3">
        <i className="bi bi-chat-heart-fill text-white me-2"></i>
        <span className="text-white fw-medium">Testimonials</span>
      </div>
      <h2 className="display-4 fw-bold text-white mb-4" style={{ 
        textShadow: '0 2px 20px rgba(0,0,0,0.3)' 
      }}>
        Stories of Success
      </h2>
      <p className="lead text-white text-opacity-90 mx-auto" style={{ 
        maxWidth: '650px',
        textShadow: '0 1px 10px rgba(0,0,0,0.2)' 
      }}>
        Discover how Funny Study transforms learning experiences and connects passionate educators with eager learners worldwide
      </p>
    </div>
    
    <div className="row g-4">
      {testimonials.map((testimonial, index) => (
        <div key={testimonial.id} className="col-lg-4 col-md-6">
          <div 
            className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden position-relative"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              transform: `translateY(${index % 2 === 0 ? '0' : '20px'})`,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `translateY(-10px) scale(1.02)`;
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `translateY(${index % 2 === 0 ? '0' : '20px'}) scale(1)`;
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
          >
            {/* Gradient overlay */}
            <div 
              className="position-absolute top-0 start-0 w-100"
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)'
              }}
            ></div>
            
            <div className="card-body p-4 pb-0">
              {/* Quote icon */}
              <div className="d-flex justify-content-center mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <i className="bi bi-quote text-white fs-4"></i>
                </div>
              </div>
              
              <blockquote className="text-center mb-4">
                <p className="text-muted lh-base mb-0" style={{ fontSize: '0.95rem' }}>
                  "{testimonial.content}"
                </p>
              </blockquote>
            </div>
            
            {/* Author section */}
            <div 
              className="card-footer border-0 p-4 pt-0"
              style={{ background: 'rgba(248, 249, 250, 0.5)' }}
            >
              <div className="d-flex align-items-center">
                <div className="position-relative">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author} 
                    className="rounded-circle border border-3 border-white shadow-sm"
                    width="56"
                    height="56"
                    style={{ objectFit: 'cover' }}
                  />
                  <div 
                    className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                    style={{
                      width: '20px',
                      height: '20px',
                      background: testimonial.role.includes('Student') ? '#28a745' : '#007bff'
                    }}
                  >
                    <i className={`bi ${testimonial.role.includes('Student') ? 'bi-mortarboard' : 'bi-person-workspace'} text-white`} style={{ fontSize: '10px' }}></i>
                  </div>
                </div>
                <div className="ms-3 flex-grow-1">
                  <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>
                    {testimonial.author}
                  </h5>
                  <p className="text-muted mb-0 small">
                    {testimonial.role}
                  </p>
                  {testimonial.location && (
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {testimonial.location}
                    </p>
                  )}
                </div>
                {/* Rating stars */}
                <div className="text-end">
                  <div className="text-warning mb-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="bi bi-star-fill" style={{ fontSize: '0.8rem' }}></i>
                    ))}
                  </div>
                  <small className="text-muted">5.0</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Call to action */}
    <div className="text-center mt-5 pt-4">
      <div className="d-inline-block bg-white bg-opacity-10 rounded-4 p-4 backdrop-blur">
        <h4 className="text-white fw-bold mb-3">Join Thousands of Happy Users</h4>
        <p className="text-white text-opacity-90 mb-4">
          Start your learning journey today and become our next success story
        </p>
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <button 
            className="btn btn-light btn-lg rounded-pill px-4 fw-semibold"
            style={{
              boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255,255,255,0.2)';
            }}
            onClick={() => navigate('/register/student')}
          >
            <i className="bi bi-person-plus me-2"></i>
            Get Started Now
          </button>
          <button 
            className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold"
            style={{
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={()=>navigate('/video-demo')}
          >
            <i className="bi bi-play-circle me-2"></i>
            Watch Demo
          </button>
        </div>
      </div>
    </div>
  </div>
  
  {/* Floating elements */}
  <div className="position-absolute" style={{ top: '10%', left: '5%', opacity: '0.1' }}>
    <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '4rem' }}></i>
  </div>
  <div className="position-absolute" style={{ top: '20%', right: '8%', opacity: '0.1' }}>
    <i className="bi bi-book-fill text-white" style={{ fontSize: '3rem' }}></i>
  </div>
  <div className="position-absolute" style={{ bottom: '15%', left: '3%', opacity: '0.1' }}>
    <i className="bi bi-lightbulb-fill text-white" style={{ fontSize: '3.5rem' }}></i>
  </div>
</section>
      
      {/* CTA Section */}
      {/* <section className="py-5 bg-primary text-white position-relative overflow-hidden">
        
        <div className="position-absolute top-0 start-0 end-0 bottom-0 opacity-10">
          <div className="position-absolute top-0 start-0 end-0 bottom-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container py-5 text-center position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Learning Experience?</h2>
              <p className="lead text-white-50 mb-5">
                Join thousands of students and teachers who are already using EduLink to achieve their educational goals.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button className="btn btn-light btn-lg text-primary fw-medium">
                  Join as a Student
                </button>
                <button className="btn btn-outline-light btn-lg fw-medium">
                  Join as a Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Footer */}
     
    </div>
  );
};

export default EduLink;