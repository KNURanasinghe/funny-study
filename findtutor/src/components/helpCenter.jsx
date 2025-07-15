import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ Data
  const faqCategories = {
    'getting-started': {
      title: 'Getting Started',
      icon: 'bi-play-circle',
      faqs: [
        {
          id: 1,
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Sign Up" button in the top right corner. Choose whether you\'re a student or teacher, fill in your details, and verify your email address.'
        },
        {
          id: 2,
          question: 'What\'s the difference between student and teacher accounts?',
          answer: 'Student accounts can search for teachers, send connection requests, and access learning materials. Teacher accounts can create teaching posts, receive student requests, and manage their teaching profile.'
        },
        {
          id: 3,
          question: 'How do I find teachers?',
          answer: 'Use the "Find Teachers" page to search by subject, location, price range, and lesson type. You can filter results to find the perfect match for your learning needs.'
        },
        {
          id: 4,
          question: 'How do I connect with a teacher?',
          answer: 'Once you find a teacher you like, click "View Profile" to see their details and sample videos. Then click "Connect Now" to send a connection request with an optional message.'
        }
      ]
    },
    'account': {
      title: 'Account Management',
      icon: 'bi-person-gear',
      faqs: [
        {
          id: 5,
          question: 'How do I update my profile?',
          answer: 'Go to your dashboard and click on "Profile Settings". You can update your personal information, profile picture, and preferences.'
        },
        {
          id: 6,
          question: 'How do I change my password?',
          answer: 'In your dashboard, go to "Account Settings" and select "Change Password". Enter your current password and your new password twice.'
        },
        {
          id: 7,
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account from the Account Settings page. Please note that this action is permanent and cannot be undone.'
        },
        {
          id: 8,
          question: 'How do I verify my account?',
          answer: 'Check your email for a verification link after signing up. Click the link to verify your account. If you didn\'t receive it, check your spam folder or request a new verification email.'
        }
      ]
    },
    'teachers': {
      title: 'For Teachers',
      icon: 'bi-mortarboard',
      faqs: [
        {
          id: 9,
          question: 'How do I create a teaching post?',
          answer: 'In your teacher dashboard, click "Create New Post". Fill in your subject, description, pricing, location preferences, and lesson type. Add sample videos if you have them.'
        },
        {
          id: 10,
          question: 'How do students find me?',
          answer: 'Students can find you through the search filters on the "Find Teachers" page. Having a complete profile with sample videos increases your visibility.'
        },
        {
          id: 11,
          question: 'How do I manage student requests?',
          answer: 'Student connection requests appear in your dashboard. You can view student profiles and choose to accept or decline requests.'
        },
        {
          id: 12,
          question: 'How do I upload sample videos?',
          answer: 'You can upload sample videos through the premium teacher system. Contact support to upgrade your account and add video content to showcase your teaching style.'
        }
      ]
    },
    'students': {
      title: 'For Students',
      icon: 'bi-book',
      faqs: [
        {
          id: 13,
          question: 'How do I search for teachers?',
          answer: 'Use the search filters on the "Find Teachers" page. You can filter by subject, location, price range, lesson type (online/in-person), and more.'
        },
        {
          id: 14,
          question: 'Can I see teacher videos before connecting?',
          answer: 'Yes! Many teachers have sample videos available. Click "View Profile" to see their information and any available sample teaching videos.'
        },
        {
          id: 15,
          question: 'How does the connection process work?',
          answer: 'Send a connection request to a teacher with an optional message. Once the teacher accepts, you\'ll get access to their contact information to arrange lessons.'
        },
        {
          id: 16,
          question: 'What if a teacher doesn\'t respond to my request?',
          answer: 'Teachers have different response times. If you don\'t hear back within a few days, you can try connecting with other teachers or send a follow-up message.'
        }
      ]
    },
    'pricing': {
      title: 'Pricing & Payments',
      icon: 'bi-credit-card',
      faqs: [
        {
          id: 17,
          question: 'How much does it cost to use the platform?',
          answer: 'Basic registration and searching is free for students. Teachers can create basic profiles for free. Premium features like video uploads may require a subscription.'
        },
        {
          id: 18,
          question: 'How do I pay teachers?',
          answer: 'Payment arrangements are made directly between students and teachers. The platform facilitates the connection, but payment terms are agreed upon between both parties.'
        },
        {
          id: 19,
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees! We\'re transparent about all costs. Basic usage is free, and any premium features are clearly outlined in our pricing section.'
        },
        {
          id: 20,
          question: 'Can I get a refund?',
          answer: 'Refund policies depend on the specific service. For platform subscriptions, contact our support team. For lesson payments, discuss refund terms directly with your teacher.'
        }
      ]
    },
    'technical': {
      title: 'Technical Support',
      icon: 'bi-gear',
      faqs: [
        {
          id: 21,
          question: 'Why can\'t I see teacher videos?',
          answer: 'Make sure your browser supports video playback and check your internet connection. Some teachers may not have uploaded sample videos yet.'
        },
        {
          id: 22,
          question: 'The website is loading slowly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If problems persist, contact our technical support.'
        },
        {
          id: 23,
          question: 'I\'m having trouble with the search filters.',
          answer: 'Try clearing all filters and searching again. Make sure your location services are enabled if you\'re using location-based search.'
        },
        {
          id: 24,
          question: 'How do I report a bug or technical issue?',
          answer: 'Use the contact form below or email our technical support team. Please include details about your browser, device, and what you were doing when the issue occurred.'
        }
      ]
    }
  };

  // Filter FAQs based on search query
  const getFilteredFaqs = () => {
    if (!searchQuery) {
      return faqCategories[activeCategory].faqs;
    }
    
    const allFaqs = Object.values(faqCategories).flatMap(category => category.faqs);
    return allFaqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="help-center-page">
      {/* Hero Section */}
      <section className="help-hero">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-4">
                <i className="bi bi-question-circle me-3"></i>
                Help Center
              </h1>
              <p className="lead mb-5">
                Find answers to common questions and get the help you need to make the most of our platform.
              </p>
              
              {/* Search Bar */}
              <div className="search-container">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="help-content">
        <div className="container">
          <div className="row">
            {/* Sidebar Categories */}
            <div className="col-lg-3">
              <div className="categories-sidebar">
                <h5 className="sidebar-title">Categories</h5>
                <div className="list-group list-group-flush">
                  {Object.entries(faqCategories).map(([key, category]) => (
                    <button
                      key={key}
                      className={`list-group-item list-group-item-action d-flex align-items-center ${
                        activeCategory === key ? 'active' : ''
                      }`}
                      onClick={() => {
                        setActiveCategory(key);
                        setSearchQuery('');
                        setExpandedFaq(null);
                      }}
                    >
                      <i className={`${category.icon} me-3`}></i>
                      <span>{category.title}</span>
                      <span className="badge bg-light text-dark ms-auto">
                        {category.faqs.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="col-lg-9">
              <div className="faq-content">
                {searchQuery ? (
                  <div className="mb-4">
                    <h4>
                      <i className="bi bi-search me-2"></i>
                      Search Results for "{searchQuery}"
                    </h4>
                    <p className="text-muted">
                      Found {getFilteredFaqs().length} result(s)
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h4>
                      <i className={`${faqCategories[activeCategory].icon} me-2`}></i>
                      {faqCategories[activeCategory].title}
                    </h4>
                    <p className="text-muted">
                      {faqCategories[activeCategory].faqs.length} articles in this category
                    </p>
                  </div>
                )}

                {/* FAQ Items */}
                <div className="faq-items">
                  {getFilteredFaqs().length > 0 ? (
                    getFilteredFaqs().map((faq) => (
                      <div key={faq.id} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={expandedFaq === faq.id}
                        >
                          <span>{faq.question}</span>
                          <i className={`bi bi-chevron-${expandedFaq === faq.id ? 'up' : 'down'}`}></i>
                        </button>
                        <div className={`faq-answer ${expandedFaq === faq.id ? 'show' : ''}`}>
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-search display-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">No results found</h5>
                      <p className="text-muted">
                        Try adjusting your search terms or browse through our categories.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="contact-support">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="support-card">
                <div className="text-center mb-4">
                  <i className="bi bi-headset display-4 text-primary"></i>
                  <h3 className="mt-3">Still need help?</h3>
                  <p className="text-muted">
                    Can't find what you're looking for? Our support team is here to help!
                  </p>
                </div>
                
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <div className="support-option">
                      <i className="bi bi-envelope-fill text-primary mb-2"></i>
                      <h6>Email Support</h6>
                      <p className="small text-muted">support@findtutor.com</p>
                      <a href="mailto:support@findtutor.com" className="btn btn-outline-primary btn-sm">
                        Send Email
                      </a>
                    </div>
                  </div>
                  
                  <div className="col-md-4 text-center mb-3">
                    <div className="support-option">
                      <i className="bi bi-chat-dots-fill text-success mb-2"></i>
                      <h6>Live Chat</h6>
                      <p className="small text-muted">Available 9 AM - 6 PM</p>
                      <button className="btn btn-outline-success btn-sm">
                        Start Chat
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-4 text-center mb-3">
                    <div className="support-option">
                      <i className="bi bi-telephone-fill text-info mb-2"></i>
                      <h6>Phone Support</h6>
                      <p className="small text-muted">+1 (555) 123-4567</p>
                      <a href="tel:+15551234567" className="btn btn-outline-info btn-sm">
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .help-center-page {
          padding-top: 80px;
          min-height: 100vh;
        }

        .help-hero {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .search-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .input-group-text {
          border-color: #dee2e6;
        }

        .form-control {
          border-color: #dee2e6;
          font-size: 1rem;
          padding: 0.75rem 1rem;
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .help-content {
          padding: 3rem 0;
        }

        .categories-sidebar {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 100px;
        }

        .sidebar-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .list-group-item {
          border: none;
          border-radius: 0.5rem !important;
          margin-bottom: 0.25rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .list-group-item:hover {
          background-color: #f8fafc;
          transform: translateX(5px);
        }

        .list-group-item.active {
          background-color: #2563eb;
          color: white;
          transform: translateX(5px);
        }

        .list-group-item.active .badge {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        .faq-content {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .faq-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          width: 100%;
          background: white;
          border: none;
          padding: 1.25rem 1.5rem;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .faq-question:hover {
          background-color: #f8fafc;
        }

        .faq-question i {
          font-size: 1.2rem;
          color: #2563eb;
          transition: transform 0.3s ease;
        }

        .faq-answer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-answer.show {
          max-height: 200px;
          padding: 1.25rem 1.5rem;
        }

        .faq-answer p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
        }

        .contact-support {
          padding: 3rem 0;
          background-color: #f8fafc;
        }

        .support-card {
          background: white;
          border-radius: 1rem;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .support-option {
          padding: 1.5rem;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }

        .support-option:hover {
          background-color: #f8fafc;
          transform: translateY(-2px);
        }

        .support-option i {
          font-size: 2rem;
          display: block;
        }

        .support-option h6 {
          font-weight: 600;
          margin: 0.75rem 0 0.5rem 0;
        }

        .support-option p {
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .help-hero {
            padding: 2rem 0;
          }

          .help-content {
            padding: 2rem 0;
          }

          .categories-sidebar {
            position: static;
            margin-bottom: 2rem;
          }

          .faq-question {
            padding: 1rem;
            font-size: 0.9rem;
          }

          .faq-answer.show {
            padding: 1rem;
          }

          .support-card {
            padding: 1.5rem;
          }

          .support-option {
            padding: 1rem;
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 576px) {
          .display-4 {
            font-size: 2rem;
          }

          .lead {
            font-size: 1rem;
          }

          .search-container {
            padding: 0 1rem;
          }

          .categories-sidebar,
          .faq-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;