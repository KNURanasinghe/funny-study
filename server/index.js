// Enhanced server.js - Handles both contact purchases and premium subscriptions
const stripe = require('stripe')('sk_test_51RlPFJPLqHqCP926QLDWR2bTke471MpnYncdf6KDgjF2Auq67G4jdBO3Hzfm9bxelP6oYsQF9diuHmhSsGDMABaQ00OIQHSYSd');
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For PocketBase API calls
const app = express();

// Middleware for JSON parsing (but not for webhook)
app.use('/webhook', express.raw({type: 'application/json'}));
app.use(express.static('public'));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000']
}));

const YOUR_DOMAIN = 'http://localhost:5173';
const POCKETBASE_URL = 'http://127.0.0.1:8090';

// ==================== CONTACT PURCHASE FLOW ====================

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { requestId, teacherId } = req.body;
    
    if (!requestId || !teacherId) {
      return res.status(400).json({ error: 'Request ID and Teacher ID are required' });
    }

    console.log('🛒 Creating checkout session for contact purchase:', { requestId, teacherId });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Student Contact Information',
              description: 'Access to student contact details for tutoring connection',
            },
            unit_amount: 700, // £7.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}&teacher_id=${teacherId}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        type: 'contact_purchase',
        requestId: requestId.toString(),
        teacherId: teacherId.toString(),
      },
    });

    console.log('✅ Contact purchase checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ Error creating contact purchase checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ==================== PREMIUM SUBSCRIPTION FLOW ====================

app.post('/create-premium-checkout-session', async (req, res) => {
  try {
    const { teacherEmail, teacherName } = req.body;
    
    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    console.log('🌟 Creating premium checkout session for:', { teacherEmail, teacherName });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Premium Teaching Subscription',
              description: 'Premium subscription with video showcase and direct contact features',
              images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'], // Optional product image
            },
            unit_amount: 4900, // £49.00 in pence (adjust price as needed)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/premium-success?session_id={CHECKOUT_SESSION_ID}&teacher_email=${encodeURIComponent(teacherEmail)}`,
      cancel_url: `${YOUR_DOMAIN}/dashboard/teacher?tab=premium&cancelled=true`,
      metadata: {
        type: 'premium_subscription',
        teacherEmail: teacherEmail,
        teacherName: teacherName || '',
      },
      customer_email: teacherEmail,
    });

    console.log('✅ Premium checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ Error creating premium checkout session:', error);
    res.status(500).json({ error: 'Failed to create premium checkout session' });
  }
});

// ==================== WEBHOOK HANDLER ====================

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // Get this from Stripe Dashboard

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('💳 Processing successful payment:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata
    });

    const { type } = session.metadata;

    if (type === 'contact_purchase') {
      await handleContactPurchase(session);
    } else if (type === 'premium_subscription') {
      await handlePremiumSubscription(session);
    } else {
      console.error('❌ Unknown payment type:', type);
    }
  }

  // Return 200 to acknowledge receipt of the event
  res.json({ received: true });
});

// ==================== WEBHOOK HANDLERS ====================

async function handleContactPurchase(session) {
  const { requestId, teacherId } = session.metadata;

  if (!requestId || !teacherId) {
    console.error('❌ Missing metadata in contact purchase session:', session.metadata);
    return;
  }

  try {
    // Check if we have a database connection
    if (!global.db) {
      console.error('❌ Database connection not available');
      return;
    }

    // Update the ConnectionRequests table
    const updateQuery = `
      UPDATE ConnectionRequests 
      SET 
        status = 'purchased',
        paymentStatus = 'paid',
        contactRevealed = TRUE,
        purchaseDate = NOW(),
        stripeSessionId = ?
      WHERE id = ? AND teacherId = ?
    `;

    await new Promise((resolve, reject) => {
      global.db.execute(updateQuery, [session.id, requestId, teacherId], (err, result) => {
        if (err) {
          console.error('❌ Database update failed:', err);
          reject(err);
        } else {
          console.log('✅ ConnectionRequest updated successfully:', {
            requestId,
            teacherId,
            affectedRows: result.affectedRows
          });
          
          if (result.affectedRows === 0) {
            console.warn('⚠️ No rows were updated. Request may not exist or already processed.');
          }
          
          resolve(result);
        }
      });
    });

    console.log('✅ Contact purchase processed successfully');

  } catch (dbError) {
    console.error('❌ Database error in contact purchase webhook:', dbError);
  }
}

async function handlePremiumSubscription(session) {
  const { teacherEmail, teacherName } = session.metadata;

  if (!teacherEmail) {
    console.error('❌ Missing teacher email in premium subscription session:', session.metadata);
    return;
  }

  try {
    console.log('🌟 Processing premium subscription for:', teacherEmail);

    // First, check if the teacher already has a premium record
    const checkResponse = await axios.get(
      `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records?filter=(mail='${teacherEmail}')`
    );

    if (checkResponse.data.items && checkResponse.data.items.length > 0) {
      // Update existing record
      const existingRecord = checkResponse.data.items[0];
      
      const updateResponse = await axios.patch(
        `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records/${existingRecord.id}`,
        {
          ispaid: true,
          paymentDate: new Date().toISOString(),
          stripeSessionId: session.id,
          paymentAmount: session.amount_total / 100, // Convert from pence to pounds
        }
      );

      console.log('✅ Premium status updated for existing teacher:', teacherEmail);
    } else {
      // Create new premium record
      const createResponse = await axios.post(
        `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records`,
        {
          mail: teacherEmail,
          ispaid: true,
          link_or_video: true, // Default to links, teacher can change later
          link1: '',
          link2: '',
          link3: '',
          paymentDate: new Date().toISOString(),
          stripeSessionId: session.id,
          paymentAmount: session.amount_total / 100,
        }
      );

      console.log('✅ Premium record created for new teacher:', teacherEmail);
    }

    // Optional: Send welcome email or notification here
    console.log('✅ Premium subscription processed successfully for:', teacherEmail);

  } catch (pocketbaseError) {
    console.error('❌ PocketBase error in premium subscription webhook:', pocketbaseError.response?.data || pocketbaseError.message);
  }
}

// ==================== STATUS CHECK ENDPOINTS ====================

// Check payment status (for Success page)
app.get('/check-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      paymentType: session.metadata.type
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});
// Create a premium record for a teacher
app.get('/check-premium-status/:teacherEmail', async (req, res) => {
  try {
    const { teacherEmail } = req.params;

    // 1. Check if premium record exists
    const response = await axios.get(
      `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records?filter=(mail='${teacherEmail}')`
    );

    if (response.data.items && response.data.items.length > 0) {
      const premiumData = response.data.items[0];
      return res.json({
        hasPremium: true,
        isPaid: premiumData.ispaid,
        premiumData: premiumData
      });
    }

    // 2. Create record if not found
    const data = {
      link_or_video: true,
      link1: "",
      link2: "",
      link3: "",
      ispaid: true,
      mail: teacherEmail
    };

    const createRes = await axios.post(
      `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records`,
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(201).json({
      hasPremium: true,
      isPaid: true,
      premiumData: createRes.data
    });

  } catch (error) {
    console.error('Error checking/creating premium status:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to check or create premium status' });
  }
});


// ==================== PREMIUM CONTENT MANAGEMENT ====================

// Update premium content after payment
app.post('/update-premium-content', async (req, res) => {
  try {
    const { teacherEmail, contentData } = req.body;

    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    // Find the premium record
    const checkResponse = await axios.get(
      `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records?filter=(mail='${teacherEmail}')AND(ispaid=true)`
    );

    if (!checkResponse.data.items || checkResponse.data.items.length === 0) {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    const premiumRecord = checkResponse.data.items[0];

    // Prepare data
    const updateData = {
      link_or_video: true,
      link1: contentData.link1 || '',
      link2: contentData.link2 || '',
      link3: contentData.link3 || ''
    };

    console.log('Sending PATCH payload:', updateData);

    // Update links
    const updateResponse = await axios.patch(
      `${POCKETBASE_URL}/api/collections/findtutor_premium_teachers/records/${premiumRecord.id}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Premium content updated successfully',
      data: updateResponse.data
    });

  } catch (error) {
    console.error('Error updating premium content:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to update premium content' });
  }
});



console.log('🚀 Enhanced Stripe server with premium payments running on port 4242');
app.listen(4242, () => console.log('Server started successfully!'));