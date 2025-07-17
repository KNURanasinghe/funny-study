import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://82.25.180.10:5000';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const requestId = searchParams.get('request_id');
      const teacherId = searchParams.get('teacher_id');

      if (!sessionId || !requestId || !teacherId) {
        setError('Missing payment information');
        setLoading(false);
        return;
      }

      try {
        // First, verify the payment status with Stripe
        const paymentResponse = await axios.get(`http://82.25.180.10:4242/check-payment/${sessionId}`);
        
        if (paymentResponse.data.paymentStatus !== 'paid') {
          setError('Payment not completed');
          setLoading(false);
          return;
        }

        setPaymentDetails(paymentResponse.data);

        // Wait a moment for webhook to process (if needed)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the updated request details (should now include contact info)
        const requestResponse = await axios.get(`${API_BASE_URL}/connect/requests/${requestId}`);
        
        if (requestResponse.data.contactRevealed) {
          // Contact info was successfully revealed by webhook
          setContactInfo({
            studentName: requestResponse.data.studentName,
            email: requestResponse.data.studentEmail,
            phoneNumber: requestResponse.data.studentPhone,
            location: requestResponse.data.studentLocation
          });
          setSuccess(true);
        } else {
          // Webhook might not have processed yet, try manual purchase as fallback
          console.log('Webhook not processed yet, attempting manual purchase...');
          
          const purchaseResponse = await axios.post(`${API_BASE_URL}/connect/requests/${requestId}/purchase`, {
            teacherId: teacherId
          });

          if (purchaseResponse.data.contactInfo) {
            setContactInfo({
              ...purchaseResponse.data.contactInfo,
              location: requestResponse.data.studentLocation
            });
            setSuccess(true);
          } else {
            setError('Failed to retrieve contact information');
          }
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        
        // If the error is that contact info is already purchased, that's actually good!
        if (error.response?.data?.error === 'Contact info already purchased') {
          try {
            // Get the request details to show the contact info
            const requestResponse = await axios.get(`${API_BASE_URL}/connect/requests/${requestId}`);
            
            setContactInfo({
              studentName: requestResponse.data.studentName,
              email: requestResponse.data.studentEmail,
              phoneNumber: requestResponse.data.studentPhone,
              location: requestResponse.data.studentLocation
            });
            setSuccess(true);
          } catch (fetchError) {
            setError('Payment processed but failed to retrieve contact information');
          }
        } else {
          setError(error.response?.data?.error || 'Failed to process payment');
        }
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate('/dashboard/teacher');
  };

  const handleContactStudent = (type, value) => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${value}`;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Processing your payment...</h4>
            <p className="text-muted">Please wait while we confirm your purchase and prepare your contact information.</p>
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
                  Payment Error
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
        <div className="col-md-8">
          <div className="card border-success shadow-lg">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-check-circle-fill me-2"></i>
                Payment Successful!
              </h4>
            </div>
            <div className="card-body">
              {/* Success Message */}
              <div className="text-center mb-4">
                <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3 text-success">Thank you for your purchase!</h3>
                <p className="text-muted">
                  Your payment of <strong>£7.00</strong> has been processed successfully. 
                  You now have access to the student's contact information.
                </p>
              </div>

              {/* Contact Information */}
              {contactInfo && (
                <div className="contact-information">
                  <h5 className="mb-3 text-primary">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Student Contact Information
                  </h5>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-person me-2"></i>
                            Student Name
                          </h6>
                          <p className="card-text fw-bold">{contactInfo.studentName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-envelope me-2"></i>
                            Email Address
                          </h6>
                          <p className="card-text">
                            <button 
                              className="btn btn-link p-0 text-decoration-none fw-bold"
                              onClick={() => handleContactStudent('email', contactInfo.email)}
                            >
                              {contactInfo.email}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-telephone me-2"></i>
                            Phone Number
                          </h6>
                          <p className="card-text">
                            <button 
                              className="btn btn-link p-0 text-decoration-none fw-bold"
                              onClick={() => handleContactStudent('phone', contactInfo.phoneNumber)}
                            >
                              {contactInfo.phoneNumber}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-geo-alt me-2"></i>
                            Location
                          </h6>
                          <p className="card-text fw-bold">
                            {contactInfo.location || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact Actions */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => handleContactStudent('email', contactInfo.email)}
                      >
                        <i className="bi bi-envelope me-2"></i>
                        Send Email
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button 
                        className="btn btn-success w-100"
                        onClick={() => handleContactStudent('phone', contactInfo.phoneNumber)}
                      >
                        <i className="bi bi-telephone me-2"></i>
                        Call Now
                      </button>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="alert alert-info mt-4">
                    <h6 className="alert-heading">
                      <i className="bi bi-info-circle me-2"></i>
                      Next Steps
                    </h6>
                    <ul className="mb-0">
                      <li>Contact the student directly using the information above</li>
                      <li>Introduce yourself and discuss their tutoring needs</li>
                      <li>Arrange your first lesson and discuss scheduling preferences</li>
                      <li>This information is permanently saved in your dashboard</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="text-center mt-4">
                <button 
                  className="btn btn-primary btn-lg me-3"
                  onClick={handleGoToDashboard}
                >
                  <i className="bi bi-house-door me-2"></i>
                  Go to Dashboard
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>
                  Print Details
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-4 text-center">
                <small className="text-muted">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@example.com" className="text-decoration-none">
                    support@example.com
                  </a>
                  {' '}or visit our{' '}
                  <a href="#" className="text-decoration-none">help center</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;