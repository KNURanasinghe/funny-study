import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from './footer';

const Pricing = () => {
  // Pricing plans data
  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for new teachers starting their online teaching journey',
      features: [
        'Create basic teacher profile',
        'List up to 3 subjects',
        'Basic student messaging',
        'Standard profile visibility',
        'Community support',
        'Basic analytics'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline-primary',
      popular: false
    },
    {
      id: 2,
      name: 'Professional',
      price: '$9.99',
      period: 'per month',
      description: 'Best for growing your teaching business',
      features: [
        'Everything in Starter',
        'List unlimited subjects',
        'Priority profile visibility',
        'Advanced student messaging',
        'Video call integration',
        'Advanced analytics',
        'Custom profile branding',
        'Priority support'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary',
      popular: true
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$29.99',
      period: 'per month',
      description: 'For established teachers and institutions',
      features: [
        'Everything in Professional',
        'Custom domain support',
        'Bulk student management',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced scheduling tools',
        'White-label options'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline-primary',
      popular: false
    }
  ];

  // Feature comparison table
  const features = [
    { name: 'Profile Creation', starter: true, professional: true, enterprise: true },
    { name: 'Subject Listings', starter: '3', professional: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Student Messaging', starter: 'Basic', professional: 'Advanced', enterprise: 'Advanced' },
    { name: 'Profile Visibility', starter: 'Standard', professional: 'Priority', enterprise: 'Priority' },
    { name: 'Video Calls', starter: false, professional: true, enterprise: true },
    { name: 'Analytics', starter: 'Basic', professional: 'Advanced', enterprise: 'Advanced' },
    { name: 'Custom Branding', starter: false, professional: true, enterprise: true },
    { name: 'Support', starter: 'Community', professional: 'Priority', enterprise: 'Dedicated' },
    { name: 'API Access', starter: false, professional: false, enterprise: true },
    { name: 'Custom Domain', starter: false, professional: false, enterprise: true }
  ];

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="container py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4">Choose Your Teaching Plan</h1>
              <p className="lead mb-5">
                Select the perfect plan to grow your teaching business and reach more students worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {plans.map((plan) => (
              <div key={plan.id} className="col-lg-4 col-md-6">
                <div className={`card pricing-card h-100 border-0 shadow-sm ${plan.popular ? 'popular' : ''}`}>
                  
                  <div className="card-body p-4">
                    <h3 className="plan-name h4 fw-bold text-center mb-3">{plan.name}</h3>
                    <div className="price text-center mb-4">
                      <span className="amount display-4 fw-bold">{plan.price}</span>
                      <span className="period text-muted ms-2">{plan.period}</span>
                    </div>
                    <p className="plan-description text-center text-muted mb-4">{plan.description}</p>
                    <ul className="features-list list-unstyled mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="d-flex align-items-center mb-3">
                          <i className="bi bi-check-circle-fill text-primary me-2"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to={plan.id === 1 ? '/register/teacher' : '/register/teacher?plan=' + plan.id}
                      className={`btn btn-${plan.buttonVariant} btn-lg w-100`}
                    >
                      {plan.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="feature-comparison py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Compare Features</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Starter</th>
                  <th>Professional</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index}>
                    <td>{feature.name}</td>
                    <td>
                      {typeof feature.starter === 'boolean' 
                        ? (feature.starter ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-muted"></i>)
                        : feature.starter}
                    </td>
                    <td>
                      {typeof feature.professional === 'boolean' 
                        ? (feature.professional ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-muted"></i>)
                        : feature.professional}
                    </td>
                    <td>
                      {typeof feature.enterprise === 'boolean' 
                        ? (feature.enterprise ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-muted"></i>)
                        : feature.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq py-5">
        <div className="container">
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      Can I switch plans later?
                    </button>
                  </h3>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      Is there a contract or commitment?
                    </button>
                  </h3>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      No, all plans are month-to-month with no long-term commitment. You can cancel anytime.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      What payment methods do you accept?
                    </button>
                  </h3>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <style jsx>{`
        .pricing-hero {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 6rem 0;
        }

        .pricing-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .pricing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .pricing-card.popular {
          border: 2px solid #2563eb;
        }

        .popular-badge {
          position: absolute;
          top: 1rem;
          right: -2rem;
          background: #2563eb;
          color: white;
          padding: 0.25rem 2rem;
          transform: rotate(45deg);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .plan-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .price {
          margin-bottom: 1.5rem;
        }

        .amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a365d;
        }

        .period {
          font-size: 1rem;
          color: #4a5568;
        }

        .plan-description {
          color: #4a5568;
          margin-bottom: 1.5rem;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }

        .features-list li {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: #4a5568;
        }

        .features-list li i {
          color: #2563eb;
          margin-right: 0.5rem;
        }

        .table {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
        }

        .table th {
          background: #f8f9fa;
          font-weight: 600;
          padding: 1rem;
        }

        .table td {
          padding: 1rem;
          vertical-align: middle;
        }

        .accordion-item {
          border: none;
          margin-bottom: 1rem;
          border-radius: 0.5rem !important;
          overflow: hidden;
        }

        .accordion-button {
          background: white;
          font-weight: 600;
          padding: 1rem;
        }

        .accordion-button:not(.collapsed) {
          color: #2563eb;
          background: rgba(37, 99, 235, 0.1);
        }

        .accordion-body {
          background: white;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .pricing-hero {
            padding: 4rem 0;
          }

          .price .amount {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Pricing; 