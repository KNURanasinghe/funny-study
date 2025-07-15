import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Contact = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Get in Touch</h1>
              <p className="lead mb-4">
                Have questions about our platform? We're here to help! Reach out to us and we'll get back to you as soon as possible.
              </p>
              <div className="d-flex gap-3">
                <Link to="/" className="btn btn-primary">
                  <i className="bi bi-house-door me-2"></i>
                  Back to Home
                </Link>
               
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-image">
                <img src="https://applytourism.org/dubai/img/contact-us.jpg" alt="Contact Us" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="contact-form-card">
                <h2 className="text-center mb-4">Send us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Your Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="subject" className="form-label">Subject</label>
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea
                          className="form-control"
                          id="message"
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-12 text-center">
                      <button type="submit" className="btn btn-primary btn-lg">
                        <i className="bi bi-send me-2"></i>
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="contact-info-card">
                <div className="icon-wrapper">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <h3>Our Location</h3>
                <p>1, Beechwood Road,<br />Dudley,<br /> DY2 7QA<br />United Kingdom</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-info-card">
                <div className="icon-wrapper">
                  <i className="bi bi-telephone"></i>
                </div>
                <h3>Message us at:</h3>
                <p>+1 (555) 123-4567<br /><br />+447949053333<br /><br /></p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-info-card">
                <div className="icon-wrapper">
                  <i className="bi bi-envelope"></i>
                </div>
                <h3>Email Address</h3>
                <p>support@edulink.com<br />info@edulink.com<br />funnystudynetwork@gmail.com<br /><br /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .contact-page {
          padding-top: 80px;
        }

        .contact-hero {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .contact-image {
          max-width: 100%;
          height: auto;
        }

        .contact-form-section {
          padding: 4rem 0;
        }

        .contact-form-card {
          background: white;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-control {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .contact-info-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .contact-info-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .contact-info-card:hover {
          transform: translateY(-5px);
        }

        .icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .icon-wrapper i {
          font-size: 1.5rem;
          color: white;
        }

        .contact-info-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .contact-info-card p {
          color: #64748b;
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 2rem 0;
          }

          .contact-form-section {
            padding: 2rem 0;
          }

          .contact-form-card {
            padding: 1.5rem;
          }

          .contact-info-section {
            padding: 2rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact; 