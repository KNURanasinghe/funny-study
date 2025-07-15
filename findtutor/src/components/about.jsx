import React, { useEffect}from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from './footer';


const About = () => {
  useEffect(() => { window.scrollTo(0, 0);},[])
  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: '/api/placeholder/300/300',
      bio: 'Passionate educator with 15+ years of experience in online learning platforms.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/300/300',
      bio: 'Tech innovator specializing in educational technology and platform development.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Head of Education',
      image: '/api/placeholder/300/300',
      bio: 'Former university professor with expertise in curriculum development.',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ];

  // Stats data
  const stats = [
    { number: '10,000+', label: 'Active Teachers' },
    { number: '50,000+', label: 'Happy Students' },
    { number: '100+', label: 'Subjects Covered' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero position-relative overflow-hidden">
        <div className="container py-5">
          <div className="row min-vh-50 align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">About Funny Study</h1>
              <p className="lead mb-4">
                We're on a mission to transform education by connecting passionate teachers with motivated students worldwide.
              </p>
              <div className="d-flex gap-3">
                <Link to="/find-teachers" className="btn btn-primary btn-lg">
                  Find a Teacher
                </Link>
              </div>
               <div className="d-flex gap-3 mt-3 ">
                <Link to="/student-posts" className="btn btn-primary btn-lg ">
                  Find Students
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img 
                src="https://criancasatortoeadireitos.wordpress.com/wp-content/uploads/2018/11/snews.png" 
                alt="Students collaborating" 
                className="img-fluid rounded-3 shadow-lg"
                style={{ 
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4">
                <div className="card-body text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i className="bi bi-lightbulb text-primary fs-1"></i>
                  </div>
                  <h3 className="h4 fw-bold mb-3">Our Vision</h3>
                  <p className="text-muted">
                    To create a world where quality education is accessible to everyone, regardless of their location or background.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4">
                <div className="card-body text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i className="bi bi-bullseye text-primary fs-1"></i>
                  </div>
                  <h3 className="h4 fw-bold mb-3">Our Mission</h3>
                  <p className="text-muted">
                    To connect passionate teachers with motivated students through an innovative, user-friendly platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4">
                <div className="card-body text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i className="bi bi-heart text-primary fs-1"></i>
                  </div>
                  <h3 className="h4 fw-bold mb-3">Our Values</h3>
                  <p className="text-muted">
                    Quality, accessibility, innovation, and community are at the heart of everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="text-center">
                  <h2 className="display-4 fw-bold text-primary mb-2">{stat.number}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <div className="company-story-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="section-title">Our Story</h2>
              <div className="company-story-content">
                <p className="story-paragraph">
                  Funny Study was born from a simple yet powerful vision: to bridge the gap between passionate educators and eager learners worldwide. 
                  We believe that education should be accessible, personalized, and transformative for everyone.
                </p>
                <p className="story-paragraph">
                  Our platform connects thousands of qualified teachers with students seeking knowledge, creating meaningful learning experiences 
                  that transcend geographical boundaries. Whether you're a student looking to expand your horizons or a teacher wanting to share 
                  your expertise, Funny Study provides the perfect environment for educational growth.
                </p>
                <div className="company-stats">
                  <div className="stat-item">
                    <span className="stat-number">10,000+</span>
                    <span className="stat-label">Active Teachers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50,000+</span>
                    <span className="stat-label">Happy Students</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Subjects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-4">Join Our Educational Revolution</h2>
              <p className="lead mb-5">
                Whether you're a teacher looking to share your knowledge or a student seeking to learn,
                Funny Study is your gateway to a world of educational opportunities.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/register/teacher" className="btn btn-light btn-lg">
                  Become a Teacher
                </Link>
                <Link to="/register/student" className="btn btn-outline-light btn-lg">
                  Join as Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <style jsx>{`
        .about-hero {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 6rem 0;
        }

        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .hover-text-primary:hover {
          color: #2563eb !important;
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: 4rem 0;
          }
        }

        .company-story-section {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%);
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }

        .company-story-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(37, 99, 235, 0.3) 50%, 
            transparent 100%
          );
        }

        .company-story-section::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(37, 99, 235, 0.3) 50%, 
            transparent 100%
          );
        }

        .company-story-content {
          color: #4a5568;
          font-size: 1.1rem;
          line-height: 1.8;
          margin-top: 2rem;
        }

        .story-paragraph {
          margin-bottom: 1.5rem;
        }

        .company-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
          min-width: 120px;
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          display: block;
          color: #1a365d;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #4a5568;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .company-story-section {
            padding: 3rem 0;
          }

          .company-story-content {
            font-size: 1rem;
          }

          .company-stats {
            gap: 2rem;
          }

          .stat-item {
            min-width: 100px;
            padding: 1rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default About; 