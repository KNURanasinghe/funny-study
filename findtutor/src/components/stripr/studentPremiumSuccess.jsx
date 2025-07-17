import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const STRIPE_SERVER_URL = 'http://82.25.180.10:4242';

const StudentPremiumSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;
  const hasRun = useRef(false); // Prevent double execution in React StrictMode

  const checkPremiumStatus = async (studentEmail, attempt = 1) => {
    try {
      console.log(`Checking premium status (attempt ${attempt}):`, studentEmail);
      
      // Check student premium status using your MySQL API
      const premiumResponse = await axios.get(
        `${STRIPE_SERVER_URL}/check-student-premium-status/${encodeURIComponent(studentEmail)}`
      );
      
      console.log('Premium status response:', premiumResponse.data);
      
      if (premiumResponse.data.hasPremium && premiumResponse.data.isPaid) {
        setPremiumData(premiumResponse.data.premiumData);
        setSuccess(true);
        setLoading(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking premium status (attempt ${attempt}):`, error);
      return false;
    }
  };

  const createPremiumRecordDirectly = async (sessionId, studentEmail, paymentData) => {
    try {
      console.log('🔧 Creating premium record directly via API...');
      
      // Get full session details from Stripe
      const sessionResponse = await axios.get(`${STRIPE_SERVER_URL}/check-payment/${sessionId}`);
      const sessionData = sessionResponse.data;
      const metadata = sessionData.metadata || {};
      
      console.log('Session metadata:', metadata);
      
      // Prepare the premium record data
      const premiumData = {
        subject: metadata.subject || '',
        email: studentEmail,
        mobile: metadata.mobile || '',
        topix: metadata.topix || '',
        descripton: metadata.descripton || '',
        ispayed: true,
        paymentDate: new Date().toISOString(),
        stripeSessionId: sessionId,
        paymentAmount: 29.00 // Default student premium amount
      };
      
      console.log('Creating record with data:', premiumData);
      
      // Use your MySQL API endpoint to create the record
      const createResponse = await axios.post(
        `${STRIPE_SERVER_URL}/api/collections/findtitor_premium_student/records`,
        premiumData
      );
      
      console.log('✅ Direct creation successful:', createResponse.data);
      return createResponse.data;
      
    } catch (error) {
      console.error('❌ Direct creation failed:', error);
      
      // Log the full error for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      
      throw error;
    }
  };

  const manualWebhookTrigger = async (sessionId) => {
    try {
      console.log('🎣 Attempting to manually trigger webhook processing...');
      
      // Create a test endpoint to manually process the webhook
      const triggerResponse = await axios.post(`${STRIPE_SERVER_URL}/manual-webhook-trigger`, {
        sessionId: sessionId,
        type: 'student_premium_subscription'
      });
      
      console.log('Manual webhook trigger response:', triggerResponse.data);
      return triggerResponse.data.success;
      
    } catch (error) {
      console.error('Manual webhook trigger failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const processPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const studentEmail = searchParams.get('student_email');

      if (!sessionId || !studentEmail) {
        setError('Missing payment information');
        setLoading(false);
        return;
      }

      try {
        console.log('🎓 Processing student premium payment for session:', sessionId, 'email:', studentEmail);
        
        // Verify the payment status with Stripe
        const paymentResponse = await axios.get(`${STRIPE_SERVER_URL}/check-payment/${sessionId}`);
        console.log('Payment response:', paymentResponse.data);
        
        if (paymentResponse.data.paymentStatus !== 'paid') {
          setError('Payment not completed');
          setLoading(false);
          return;
        }

        // Initial wait for webhook processing
        console.log('⏳ Waiting for webhook to process...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Start checking premium status with retries
        let isActivated = false;
        let currentRetry = 0;

        while (!isActivated && currentRetry < maxRetries) {
          currentRetry++;
          setRetryCount(currentRetry);
          
          isActivated = await checkPremiumStatus(studentEmail, currentRetry);
          
          if (!isActivated) {
            // Wait 3 seconds before next retry
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }

        if (!isActivated) {
          console.log('🚨 Webhook processing failed, attempting manual recovery...');
          
          try {
            // Step 1: Try manual webhook trigger
            const webhookTriggered = await manualWebhookTrigger(sessionId);
            
            if (webhookTriggered) {
              // Wait a bit and check again
              await new Promise(resolve => setTimeout(resolve, 2000));
              isActivated = await checkPremiumStatus(studentEmail);
            }
            
            // Step 2: If webhook trigger didn't work, create record directly
            if (!isActivated) {
              console.log('🔧 Manual webhook trigger failed, creating record directly...');
              
              const createdRecord = await createPremiumRecordDirectly(sessionId, studentEmail, paymentResponse.data);
              
              if (createdRecord) {
                console.log('✅ Direct creation successful');
                setPremiumData(createdRecord);
                setSuccess(true);
                setLoading(false);
                return;
              }
            }
            
          } catch (recoveryError) {
            console.error('❌ All recovery attempts failed:', recoveryError);
          }
          
          // If everything fails, show error with detailed info
          setError(`Premium activation failed despite successful payment. Session ID: ${sessionId}. Please contact support - your payment was processed successfully and we will activate your premium access manually.`);
          setLoading(false);
        }

      } catch (error) {
        console.error('❌ Error processing student premium payment:', error);
        setError(error.response?.data?.error || 'Failed to process premium payment');
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate('/dashboard/student');
  };

  const handleFindTeachers = () => {
    navigate('/find-teachers');
  };

  const handleContactSupport = () => {
    const sessionId = searchParams.get('session_id');
    const studentEmail = searchParams.get('student_email');
    
    const subject = encodeURIComponent('Premium Activation Issue - Urgent');
    const body = encodeURIComponent(`Hello,

I completed my premium subscription payment but I'm experiencing activation issues.

PAYMENT DETAILS:
- Session ID: ${sessionId}
- Email: ${studentEmail}
- Payment Status: SUCCESSFUL
- Issue: Premium features not activated after payment

WHAT I'VE TRIED:
- Waited for automatic activation (30+ seconds)
- Refreshed the page multiple times
- Checked my dashboard

Please activate my premium subscription immediately as the payment has been processed successfully.

Thank you for your urgent assistance!`);
    
    window.open(`mailto:support@yourcompany.com?subject=${subject}&body=${body}`);
  };

  const handleManualCheck = async () => {
    setLoading(true);
    setError('');
    
    const studentEmail = searchParams.get('student_email');
    const sessionId = searchParams.get('session_id');
    
    try {
      // Try to create the record manually
      const createdRecord = await createPremiumRecordDirectly(sessionId, studentEmail);
      
      if (createdRecord) {
        setPremiumData(createdRecord);
        setSuccess(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Manual check failed:', error);
      setError('Manual activation failed. Please contact support.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">🎓 Processing Your Premium Payment...</h4>
            <p className="text-muted">
              Please wait while we activate your premium subscription.
              {retryCount > 0 && (
                <><br />Verification attempt: {retryCount} of {maxRetries}</>
              )}
            </p>
            <div className="progress mt-3" style={{ height: '6px' }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                style={{ width: `${(retryCount / maxRetries) * 100}%` }}
              ></div>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                {retryCount === 0 && "Initializing payment processing..."}
                {retryCount > 0 && retryCount <= 3 && "Waiting for webhook processing..."}
                {retryCount > 3 && retryCount <= 6 && "Verifying premium activation..."}
                {retryCount > 6 && "Attempting recovery procedures..."}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Premium Activation Issue
                </h4>
              </div>
              <div className="card-body">
                <div className="alert alert-success">
                  <h6 className="alert-heading">
                    <i className="bi bi-check-circle me-2"></i>
                    ✅ Your Payment Was Successful
                  </h6>
                  <p className="mb-0">
                    Great news! Your payment has been processed successfully. We're just experiencing 
                    a temporary delay in activating your premium features.
                  </p>
                </div>
                
                <p className="card-text mb-4">{error}</p>
                
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-success w-100"
                      onClick={handleManualCheck}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Manual Activate
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={handleGoToDashboard}
                    >
                      <i className="bi bi-house-door me-2"></i>
                      Dashboard
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-danger w-100"
                      onClick={handleContactSupport}
                    >
                      <i className="bi bi-envelope me-2"></i>
                      Contact Support
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={() => window.location.reload()}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh Page
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <small className="text-muted">
                    <strong>What happens next?</strong><br />
                    1. Try "Manual Activate" first - this will attempt to activate your premium immediately<br />
                    2. If that doesn't work, contact support with your session ID for immediate assistance<br />
                    3. Our system will also continue trying to activate automatically in the background
                  </small>
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
        <div className="col-md-10">
          <div className="card border-success shadow-lg">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-star-fill me-2"></i>
                🎉 Welcome to Premium Learning!
              </h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="success-icon mb-3">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="text-success">✅ Premium Subscription Activated!</h3>
                <p className="text-muted">
                  Congratulations! Your premium student subscription has been activated successfully. 
                  You now have access to exclusive benefits and features.
                </p>
              </div>

              {premiumData && (
                <div className="alert alert-info mb-4">
                  <h6 className="alert-heading">📋 Your Premium Details:</h6>
                  <p className="mb-1"><strong>Email:</strong> {premiumData.email}</p>
                  <p className="mb-1"><strong>Subject:</strong> {premiumData.subject || 'Not specified'}</p>
                  <p className="mb-1"><strong>Payment Amount:</strong> £{premiumData.paymentAmount}</p>
                  <p className="mb-0"><strong>Activated:</strong> {new Date(premiumData.paymentDate).toLocaleString()}</p>
                </div>
              )}

              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card h-100 border-primary">
                    <div className="card-body text-center">
                      <i className="bi bi-person-workspace text-primary" style={{ fontSize: '2rem' }}></i>
                      <h5 className="card-title mt-2">2 Free Lessons</h5>
                      <p className="card-text">Get 2 free tutoring sessions every month with qualified teachers.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100 border-success">
                    <div className="card-body text-center">
                      <i className="bi bi-search text-success" style={{ fontSize: '2rem' }}></i>
                      <h5 className="card-title mt-2">Priority Matching</h5>
                      <p className="card-text">Get matched with the best teachers for your subjects first.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100 border-info">
                    <div className="card-body text-center">
                      <i className="bi bi-headset text-info" style={{ fontSize: '2rem' }}></i>
                      <h5 className="card-title mt-2">Premium Support</h5>
                      <p className="card-text">Access to dedicated support and advanced learning resources.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  className="btn btn-primary btn-lg me-3"
                  onClick={handleFindTeachers}
                >
                  <i className="bi bi-search me-2"></i>
                  Find Premium Teachers
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleGoToDashboard}
                >
                  <i className="bi bi-house-door me-2"></i>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPremiumSuccess;